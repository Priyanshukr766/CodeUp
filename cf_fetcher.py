# -*- coding: utf-8 -*-
"""
cf_fetcher.py
─────────────────────────────────────────────────────────────────────────────
Playwright-based Codeforces problem fetcher that implements the same DOM
parsing strategy used by the Competitive Companion browser extension
(github.com/jmerle/competitive-companion) — without installing the extension.

Architecture (mirrors problemFetching.md design):
  • One persistent Chromium browser launched at module-import time
  • Each fetch opens an isolated BrowserContext + Page (tab), then closes it
  • Primary URL  → /contest/{id}/problem/{index}
  • Fallback URL → /problemset/problem/{id}/{index}
  • 404 detection via .error-noborder sentinel, error-page title, and HTTP
    response code
  • Strict 15 s navigation timeout + try/finally resource cleanup
  • Returns a Competitive-Companion-compatible JSON payload

Usage (async):
    import asyncio
    from cf_fetcher import fetch_problem

    async def main():
        result = await fetch_problem("1984A")   # or "1984", "A"
        print(result)

    asyncio.run(main())

Usage (CLI):
    python cf_fetcher.py 1984A
    python cf_fetcher.py 1984 A
    python cf_fetcher.py https://codeforces.com/contest/1984/problem/A
"""

from __future__ import annotations
import time
import asyncio
import io
import json
import re
import sys
import textwrap
from dataclasses import dataclass, field, asdict
from typing import Optional

# ── Force UTF-8 stdout/stderr on Windows (cp1252 console can't encode box chars)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# ── playwright import guard ───────────────────────────────────────────────────
try:
    from playwright.async_api import (
        async_playwright,
        Browser,
        BrowserContext,
        Page,
        Response,
        PlaywrightContextManager,
    )
except ImportError:
    sys.exit(
        "[cf_fetcher] playwright is not installed.\n"
        "Run:  pip install playwright\n"
        "Then: playwright install chromium"
    )


# ═══════════════════════════════════════════════════════════════════════════════
# Data models  (mirrors Competitive Companion's Task / Test schema)
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class TestCase:
    input: str
    output: str


@dataclass
class CFProblem:
    """Competitive-Companion-compatible problem payload."""
    name: str                          # e.g. "Beautiful Matrix"
    group: str                         # e.g. "Codeforces - Round 123"
    url: str
    interactive: bool
    time_limit_ms: int                 # milliseconds
    memory_limit_mb: int               # megabytes
    tests: list[TestCase] = field(default_factory=list)
    # Extended fields — HTML content (innerHTML from Codeforces DOM)
    # Frontend renders these with dangerouslySetInnerHTML + DOMPurify + MathJax
    statement: str = ""
    input_spec: str = ""
    output_spec: str = ""
    note: str = ""


# ═══════════════════════════════════════════════════════════════════════════════
# Singleton browser manager
# ═══════════════════════════════════════════════════════════════════════════════

_playwright_mgr: Optional[PlaywrightContextManager] = None
_browser: Optional[Browser] = None


async def _get_browser() -> Browser:
    """
    Return the shared Chromium Browser instance, launching it on first call.
    Matches the 'Persistent Browser Instance' countermeasure from the spec.
    """
    global _playwright_mgr, _browser
    if _browser is None or not _browser.is_connected():
        _playwright_mgr = async_playwright()
        pw = await _playwright_mgr.__aenter__()
        _browser = await pw.chromium.launch(
            headless=True,
            args=[
                # Reduce Chromium fingerprint flags detected by Cloudflare
                "--disable-blink-features=AutomationControlled",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-extensions",
                "--disable-sync",
                "--disable-background-networking",
                "--disable-client-side-phishing-detection",
                "--disable-component-extensions-with-background-pages",
                "--disable-default-apps",
                "--mute-audio",
            ],
        )
    return _browser


async def shutdown_browser() -> None:
    """
    Cleanly close the persistent browser. Call this when your application exits
    to avoid zombie Chromium processes (Nuance C countermeasure).
    """
    global _playwright_mgr, _browser
    if _browser and _browser.is_connected():
        await _browser.close()
        _browser = None
    if _playwright_mgr:
        try:
            await _playwright_mgr.__aexit__(None, None, None)
        except Exception:
            pass
        _playwright_mgr = None


# ═══════════════════════════════════════════════════════════════════════════════
# URL parsing helpers
# ═══════════════════════════════════════════════════════════════════════════════

# Matches: "1984A"  "1984 A"  "1984a"  "100B1"
_TOKEN_RE = re.compile(r"^(\d+)\s*([A-Za-z]\d*)$")

# Pattern 1: /contest/{id}/problem/{index}  or  /gym/{id}/problem/{index}
#   e.g. https://codeforces.com/contest/580/problem/C
_CF_CONTEST_URL_RE = re.compile(
    r"https?://(?:\w+\.)?codeforces\.(?:com|ml|es|net)"
    r"/(?:contest|gym|group/[^/]+/contest)/(\d+)/problem/([A-Za-z]\d*)",
    re.IGNORECASE,
)

# Pattern 2: /problemset/problem/{id}/{index}  (NO second "/problem/" segment)
#   e.g. https://codeforces.com/problemset/problem/1324/F
_CF_PROBLEMSET_URL_RE = re.compile(
    r"https?://(?:\w+\.)?codeforces\.(?:com|ml|es|net)"
    r"/problemset/problem/(\d+)/([A-Za-z]\d*)",
    re.IGNORECASE,
)


def _parse_problem_token(raw: str) -> tuple[str, str]:
    """
    Accept any of:
      "1984A"   →  ("1984", "A")
      "1984 A"  →  ("1984", "A")
      "https://codeforces.com/contest/1984/problem/A"     → ("1984", "A")
      "https://codeforces.com/problemset/problem/1324/F"  → ("1324", "F")
    Returns (contest_id, problem_index).
    """
    raw = raw.strip()

    # Try /contest/{id}/problem/{index} pattern first
    m = _CF_CONTEST_URL_RE.search(raw)
    if m:
        return m.group(1), m.group(2).upper()

    # Try /problemset/problem/{id}/{index} pattern
    m = _CF_PROBLEMSET_URL_RE.search(raw)
    if m:
        return m.group(1), m.group(2).upper()

    # Try compact token "1984A" / "1984 A"
    m = _TOKEN_RE.match(raw)
    if m:
        return m.group(1), m.group(2).upper()

    raise ValueError(
        f"Cannot parse problem token: {raw!r}\n"
        "Expected formats: '1984A', '1984 A', '/contest/ID/problem/INDEX', "
        "or '/problemset/problem/ID/INDEX'."
    )


def _build_urls(contest_id: str, index: str) -> tuple[str, str]:
    """Return (primary_contest_url, fallback_problemset_url)."""
    base = "https://codeforces.com"
    primary  = f"{base}/contest/{contest_id}/problem/{index}"
    fallback = f"{base}/problemset/problem/{contest_id}/{index}"
    return primary, fallback


# ═══════════════════════════════════════════════════════════════════════════════
# Browser context factory
# ═══════════════════════════════════════════════════════════════════════════════

_STEALTH_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/125.0.0.0 Safari/537.36"
)
#Browser:Mall, Browser context: SHopping cart Pages: Items in the cart
async def _new_context(browser: Browser) -> BrowserContext:
    """
    Create a fresh BrowserContext that mirrors a real desktop browser session.
    Matches the 'Headless Browser Context' layer from the spec.
    """
    ctx = await browser.new_context(
        viewport={"width": 1366, "height": 768},
        user_agent=_STEALTH_UA,
        locale="en-US",
        timezone_id="America/New_York",
        extra_http_headers={
            "Accept-Language": "en-US,en;q=0.9",
            "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT":             "1",
            "Upgrade-Insecure-Requests": "1",
        },
        java_script_enabled=True,
        # Abort image / font / media loads — speeds up fetching significantly
        # and reduces memory (we only need the DOM text)
    )

    # Mask navigator.webdriver — the single most important Cloudflare signal
    await ctx.add_init_script("""
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
        });
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
        });
        window.chrome = { runtime: {} };
    """)

    # Block images, fonts, and media to save memory + bandwidth
    await ctx.route(
        "**/*",
        lambda route: (
            route.abort()
            if route.request.resource_type in ("image", "media", "font", "stylesheet")
            else route.continue_()
        ),
    )

    return ctx


# ═══════════════════════════════════════════════════════════════════════════════
# Competitive Companion DOM extraction (injected JavaScript)
# ═══════════════════════════════════════════════════════════════════════════════

# This JS mirrors CodeforcesProblemParser.parseMainProblem() from
# github.com/jmerle/competitive-companion. It runs inside the Codeforces
# window context after the page finishes loading.
_CC_EXTRACTION_SCRIPT = r"""
() => {
    // ── helpers ────────────────────────────────────────────────────────────

    // text() — for metadata we need to parse as numbers/strings (no HTML needed)
    const text = (sel, root) => {
        const el = (root || document).querySelector(sel);
        return el ? el.innerText.trim() : '';
    };

    // html() — for content sections we want the FULL HTML so the frontend
    // can render bold, italics, math ($$$...$$$), images, tables, etc.
    // We clone the node and strip the section-title span before returning
    // so the React component receives just the body content, not the label.
    const html = (sel, root) => {
        const el = (root || document).querySelector(sel);
        if (!el) return '';
        const clone = el.cloneNode(true);
        // Remove the "Input" / "Output" / "Note" header span that CF injects
        const title = clone.querySelector('.section-title');
        if (title) title.remove();
        return clone.innerHTML.trim();
    };

    const attr = (sel, a, root) => {
        const el = (root || document).querySelector(sel);
        return el ? (el.getAttribute(a) || '').trim() : '';
    };

    // ── page-level 404 / redirect guard ────────────────────────────────────
    const pageTitle = document.title || '';
    if (
        pageTitle.includes('404') ||
        pageTitle.toLowerCase().includes('not found') ||
        document.querySelector('.error-noborder') !== null
    ) {
        return { __error__: '404' };
    }

    // ── problem statement root ─────────────────────────────────────────────
    const ps = document.querySelector('.problem-statement');
    if (!ps) return { __error__: 'no_problem_statement' };

    // ── title (use innerText — we only need the plain string) ─────────────
    const titleEl = ps.querySelector('.header .title');
    const name = titleEl ? titleEl.innerText.trim() : '';

    // ── time limit (innerText — parsed as a number) ───────────────────────
    const timeLimitRaw = text('.time-limit', ps);
    const timeLimitMatch = timeLimitRaw.match(/([\d.]+)\s*second/i);
    const timeLimitMs = timeLimitMatch
        ? Math.round(parseFloat(timeLimitMatch[1]) * 1000)
        : 1000;

    // ── memory limit (innerText — parsed as a number) ─────────────────────
    const memLimitRaw = text('.memory-limit', ps);
    const memLimitMatch = memLimitRaw.match(/([\d.]+)\s*megabyte/i);
    const memoryLimitMb = memLimitMatch ? parseInt(memLimitMatch[1]) : 256;

    // ── interactive flag ──────────────────────────────────────────────────
    const isInteractive =
        !!ps.querySelector('.section-title-interactions') ||
        text('.section-title', ps).toLowerCase().includes('interact');

    // ── statement body — innerHTML to keep ALL formatting ─────────────────
    // Codeforces structure: .problem-statement > div[0]=header, div[1]=body
    // We grab innerHTML of div[1] so bold, $$$math$$$, <br>, <em> etc. survive.
    const statementDivs = ps.querySelectorAll(':scope > div');
    let statement = '';
    if (statementDivs.length >= 2) {
        statement = statementDivs[1].innerHTML.trim();
    }

    // ── input / output spec — innerHTML for full formatting ───────────────
    const inputSpec  = html('.input-specification',  ps);
    const outputSpec = html('.output-specification', ps);

    // ── note — innerHTML so example explanations render correctly ─────────
    const note = html('.note', ps);

    // ── sample test cases (innerText — these are code/data, not prose) ────
    const sampleRoot = ps.querySelector('.sample-test');
    const tests = [];
    if (sampleRoot) {
        const inputPres  = [...sampleRoot.querySelectorAll('.input  pre')];
        const outputPres = [...sampleRoot.querySelectorAll('.output pre')];
        const count = Math.min(inputPres.length, outputPres.length);
        for (let i = 0; i < count; i++) {
            tests.push({
                input:  inputPres[i].innerText,
                output: outputPres[i].innerText,
            });
        }
    }

    // ── group / contest name (breadcrumb) ─────────────────────────────────
    const breadcrumb = document.querySelector('#pageContent .rtable tr td a');
    const group = breadcrumb ? 'Codeforces - ' + breadcrumb.innerText.trim() : 'Codeforces';

    return {
        name,
        group,
        timeLimitMs,
        memoryLimitMb,
        isInteractive,
        statement,
        inputSpec,
        outputSpec,
        note,
        tests,
    };
}
"""

# ═══════════════════════════════════════════════════════════════════════════════
# Navigation + Cloudflare bypass helper
# ═══════════════════════════════════════════════════════════════════════════════

_NAV_TIMEOUT_MS = 15_000   # 15 s hard cap
_CF_WAIT_MS     = 4_000    # extra settle time for Cloudflare JS challenges


async def _navigate_with_fallback(
    page: Page,
    primary_url: str,
    fallback_url: str,
) -> str:
    """
    Navigate to primary_url; fall back to fallback_url on 404 / error pages.
    Waits for Cloudflare challenges to resolve automatically.
    Returns the final URL that succeeded.

    Matches the 'Navigation & Automated Challenge Bypass' step + 'Routing
    Fallback Strategy' countermeasure from the spec.
    """

    async def _go(url: str) -> Optional[Response]:
        try:
            resp = await page.goto(
                url,
                wait_until="domcontentloaded",
                timeout=_NAV_TIMEOUT_MS,
            )
            return resp
        except Exception:
            return None

    async def _is_error_page() -> bool:
        """True if Codeforces returned a 404 / error sentinel."""
        return await page.evaluate(
            """() => {
                const t = document.title || '';
                return (
                    t.includes('404') ||
                    t.toLowerCase().includes('not found') ||
                    !!document.querySelector('.error-noborder')
                );
            }"""
        )

    async def _has_cloudflare_challenge() -> bool:
        """True while Cloudflare's JS challenge is still running."""
        return await page.evaluate(
            """() => {
                const t = document.title || '';
                return (
                    t.toLowerCase().includes('just a moment') ||
                    t.toLowerCase().includes('checking your browser') ||
                    !!document.querySelector('#challenge-running') ||
                    !!document.querySelector('#cf-spinner')
                );
            }"""
        )

    async def _wait_for_cf(label: str) -> None:
        """
        Poll until Cloudflare challenge clears or we hit _NAV_TIMEOUT_MS.
        Cloudflare usually solves its own JS puzzle within 2-4 seconds.
        """
        for _ in range(int(_NAV_TIMEOUT_MS / 500)):
            if not await _has_cloudflare_challenge():
                return
            await asyncio.sleep(0.5)
        raise TimeoutError(f"Cloudflare challenge did not clear for {label}")

    # ── try primary ────────────────────────────────────────────────────────
    resp = await _go(primary_url)
    if resp is not None:
        await _wait_for_cf(primary_url)
        if not await _is_error_page() and resp.status < 400:
            return primary_url

    # ── fall back ──────────────────────────────────────────────────────────
    resp = await _go(fallback_url)
    if resp is None:
        raise RuntimeError(f"Both URLs failed to load.\n  {primary_url}\n  {fallback_url}")
    await _wait_for_cf(fallback_url)
    if await _is_error_page() or resp.status >= 400:
        raise RuntimeError(
            f"Problem not found at either URL:\n  {primary_url}\n  {fallback_url}"
        )
    return fallback_url


# ═══════════════════════════════════════════════════════════════════════════════
# Public API
# ═══════════════════════════════════════════════════════════════════════════════

async def fetch_problem(
    token_or_url: str,
    index: Optional[str] = None,
) -> CFProblem:
    start_time = time.perf_counter()
    """
    Fetch and parse a Codeforces problem.

    Parameters
    ----------
    token_or_url : str
        Any of:
          • "1984A"
          • "1984"  (with index= parameter)
          • "https://codeforces.com/contest/1984/problem/A"
    index : str, optional
        Problem index ("A", "B1", …). Only needed when token_or_url is a
        bare contest ID.

    Returns
    -------
    CFProblem
        Structured payload with title, limits, test cases, etc.

    Raises
    ------
    ValueError
        If the token cannot be parsed.
    RuntimeError
        If the problem page cannot be loaded or parsed.
    """
    # ── resolve contest_id / problem_index ────────────────────────────────
    if index is not None:
        contest_id = token_or_url.strip()
        problem_index = index.strip().upper()
    else:
        contest_id, problem_index = _parse_problem_token(token_or_url)

    primary_url, fallback_url = _build_urls(contest_id, problem_index)

    # ── obtain the persistent browser ─────────────────────────────────────
    browser = await _get_browser()

    # ── open an isolated context (tab) — closed in finally ────────────────
    context: BrowserContext = await _new_context(browser)
    page:    Page            = await context.new_page()

    try:
        # ── navigate (with CF bypass + URL fallback) ───────────────────────
        final_url = await _navigate_with_fallback(page, primary_url, fallback_url)

        # ── inject Competitive Companion extraction script ─────────────────
        raw = await page.evaluate(_CC_EXTRACTION_SCRIPT)

        # ── handle sentinel errors returned from JS ────────────────────────
        if isinstance(raw, dict) and "__error__" in raw:
            err = raw["__error__"]
            if err == "404":
                raise RuntimeError(f"Problem {contest_id}{problem_index} not found (404).")
            if err == "no_problem_statement":
                raise RuntimeError(
                    f"Could not locate .problem-statement on {final_url}.\n"
                    "The page may require a login, or the DOM structure has changed."
                )
            raise RuntimeError(f"Extraction script returned error: {err}")

        # ── assemble CFProblem ─────────────────────────────────────────────
        tests = [
            TestCase(input=t["input"], output=t["output"])
            for t in raw.get("tests", [])
        ]

        problem = CFProblem(
            name            = raw.get("name", ""),
            group           = raw.get("group", "Codeforces"),
            url             = final_url,
            interactive     = raw.get("isInteractive", False),
            time_limit_ms   = raw.get("timeLimitMs", 1000),
            memory_limit_mb = raw.get("memoryLimitMb", 256),
            tests           = tests,
            statement       = raw.get("statement", ""),
            input_spec      = raw.get("inputSpec", ""),
            output_spec     = raw.get("outputSpec", ""),
            note            = raw.get("note", ""),
        )

        total_time = time.perf_counter() - start_time

        print(
            f"[LATENCY] fetch_problem({contest_id}{problem_index}) "
            f"completed in {total_time:.2f}s"
        )   
        print("\n\n\n") 
        return problem

    finally:
        # ── strict resource cleanup (Nuance C countermeasure) ─────────────
        await page.close()
        await context.close()


def problem_to_dict(p: CFProblem) -> dict:
    """
    Convert CFProblem to a dict that matches the Competitive Companion JSON
    schema so it can be consumed by CP-Editor, CPH, or any custom listener.
    """
    return {
        "name":        p.name,
        "group":       p.group,
        "url":         p.url,
        "interactive": p.interactive,
        "memoryLimit": p.memory_limit_mb,
        "timeLimit":   p.time_limit_ms,
        "tests":       [{"input": t.input, "output": t.output} for t in p.tests],
        # Extended fields (not in CC schema)
        "statement":   p.statement,
        "inputSpec":   p.input_spec,
        "outputSpec":  p.output_spec,
        "note":        p.note,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# CLI entry point
# ═══════════════════════════════════════════════════════════════════════════════

async def _cli_main() -> None:
    args = sys.argv[1:]
    if not args:
        print(textwrap.dedent("""
            Usage:
              python cf_fetcher.py <token>          e.g.  python cf_fetcher.py 1984A
              python cf_fetcher.py <id> <index>     e.g.  python cf_fetcher.py 1984 A
              python cf_fetcher.py <full_url>       e.g.  python cf_fetcher.py https://codeforces.com/contest/1984/problem/A
        """).strip())
        sys.exit(1)

    token   = args[0]
    idx     = args[1] if len(args) > 1 else None

    print(f"[cf_fetcher] Fetching problem: {' '.join(args)}")

    try:
        problem = await fetch_problem(token, idx)
        payload = problem_to_dict(problem)

        # ── pretty print JSON output ───────────────────────────────────────
        sep = "=" * 60
        print(f"\n{sep}")
        print(f"  {payload['name']}")
        print(f"  {payload['group']}")
        print(f"  {payload['url']}")
        print(sep)
        print(f"  Time Limit  : {payload['timeLimit']} ms")
        print(f"  Memory Limit: {payload['memoryLimit']} MB")
        print(f"  Interactive : {payload['interactive']}")
        print(f"  Test Cases  : {len(payload['tests'])}")
        print(sep)

        for i, tc in enumerate(payload["tests"], 1):
            print(f"\n  -- Sample {i} --")
            print(f"  Input:\n{textwrap.indent(tc['input'], '    ')}")
            print(f"  Output:\n{textwrap.indent(tc['output'], '    ')}")

        print("\n  -- Full JSON Payload --")
        # NOTE: statement/inputSpec/outputSpec/note now contain full HTML —
        # they may be long in the terminal but are NOT truncated.
        # The frontend uses this HTML directly with DOMPurify + MathJax.
        print(json.dumps(payload, indent=2, ensure_ascii=False))

    except (ValueError, RuntimeError) as exc:
        print(f"\n[cf_fetcher] ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        await shutdown_browser()


if __name__ == "__main__":
    asyncio.run(_cli_main())




"""
[ START ] User calls: fetch_problem("1984A")
   │
   ├─ Step 1: Figure out the address
   │    └─ Calls _parse_problem_token / _build_urls
   │    └─ GETS: primary_url, fallback_url
   │
   ├─ Step 2: Get the Car (Singleton Browser)
   │    └─ Calls _get_browser()
   │    └─ GETS: The invisible Chromium engine
   │
   ├─ Step 3: Get the Driver (Disguised Context)
   │    └─ Calls _new_context(browser)
   │    └─ GETS: The fake ID, screen size, and ad-blockers
   │
   ├─ Step 4: Open a New Tab
   │    └─ Calls context.new_page()
   │    └─ GETS: A blank page ready to surf
   │
   ├─ Step 5: Drive to the Club (Navigation & Bypass)
   │    └─ Calls _navigate_with_fallback(...)
   │         │
   │         ├─ Try Primary Door: Calls _go(primary_url)
   │         ├─ Wait in Line: Calls _wait_for_cf() (Checks for Cloudflare)
   │         ├─ Check the Room: Calls _is_error_page() (Checks for 404)
   │         │
   │         └─ (If primary fails, repeats the above for fallback_url)
   │    └─ GETS: The final_url where the problem actually lives
   │
   ├─ Step 6: Execute the Mission (DOM Extraction)
   │    └─ Calls page.evaluate(_CC_EXTRACTION_SCRIPT)
   │    └─ GETS: The raw JSON dictionary containing the title, time limits, and tests
   │
   └─ [ END ] Returns the perfectly formatted CFProblem data to you!
"""