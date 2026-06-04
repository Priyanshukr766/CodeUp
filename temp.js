function parseToken(raw) {
  // Full CF URL
  let urlMatch = raw.match(
    /codeforces\.com\/(?:contest|gym)\/(\d+)\/problem\/([A-Za-z]\d*)/i
  );
  if (!urlMatch) {
    // problemset URLs
    urlMatch = raw.match(
      /codeforces\.com\/problemset\/problem\/(\d+)\/([A-Za-z]\d*)/i
    );
  }
  if (urlMatch) return [urlMatch[1], urlMatch[2].toUpperCase()];

  // Compact token "1984A"
  const tokenMatch = raw.match(/^(\d+)\s*([A-Za-z]\d*)$/);
  if (tokenMatch) return [tokenMatch[1], tokenMatch[2].toUpperCase()];

  return null;
}


console.log(parseToken("https://codeforces.com/problemset/problem/115/A")); 
console.log(parseToken("https://codeforces.com/contest/1984/problem/A")); 
console.log(parseToken("115    A")); 
    