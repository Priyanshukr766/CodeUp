***
# Complete Implementation Guide: Codeforces Contest Mode

## **Objective**
Implement a **Contest Mode** for the CodeUp platform. When a user inputs a general Codeforces Contest URL (e.g., `https://codeforces.com/contest/1984`), the platform should fetch the contest metadata, render a countdown timer, and display a persistent tabbed navigation to let users seamlessly write code for different problems (A, B, C...) without leaving the workspace or losing their code progress between tabs.

## **Architecture Overview**
1. **API Usage**: Use the official Codeforces API (`/api/contest.standings`) to get the contest details and problem list. (No scraping required for the contest metadata).
2. **Problem Fetching**: Continue using the existing cf_fetcher.py to fetch specific problem details **on-demand** (lazy loading) when a user switches tabs.
3. **State Persistence**: Editor code, language selections, and test records must be cached in React state under their respective problem index so progress is saved as users switch between problems. 

---

## **Phase 1: Backend Implementation**

### 1. Create `server/routes/contest.js`
Create a new Express route to fetch contest details via the official Codeforces API.
- **Endpoint**: `GET /api/contest/:id`
- **Logic**: 
  - Call `https://codeforces.com/api/contest.standings?contestId=${id}&from=1&count=1` via `axios`.
  - Extract `data.result.contest` (contains `name`, `phase`, `startTimeSeconds`, `durationSeconds`, `relativeTimeSeconds`).
  - Extract `data.result.problems` (array of objects with `index`, `name`).
  - Return a structured JSON response merging both pieces of data.
  - Implement basic try/catch error handling.

### 2. Update index.js
- Import the new `contestRoute` from `./routes/contest.js`.
- Register it into the Express app: `app.use('/api/contest', contestRoutes);`

### 3. Update api.js (Frontend API connector)
- Add a fetching utility:
  ```javascript
  export async function fetchContest(contestId) {
    const res = await axios.get(`/api/contest/${contestId}`);
    return res.data;
  }
  ```

---

## **Phase 2: Frontend State Management (App.jsx)**

### 1. New State Variables
Add the following states to App.jsx to manage the contest context:
```javascript
const [contestMode, setContestMode] = useState(null); // stores { id, name, phase, startTimeSeconds, durationSeconds, problems: [...] }
const [activeProblemIndex, setActiveProblemIndex] = useState(null); // 'A', 'B', etc.
const [problemCache, setProblemCache] = useState({}); 
// ^ Structure: { 'A': { details: {...}, code: "...", language: "cpp", results: [...] }, 'B': {...} }
```

### 2. Modify URL Parsing (`handleFetch`)
When a user submits the SearchBar token, classify if it's a individual problem or a full contest.
- **Problem Regex** (existing): `/problem/A`, `1984A`, etc. -> Execute normal `fetchProblem`. Clear `contestMode` state.
- **Contest Regex** : Detect numbers-only inputs `^\d+$` or Contest URLs `codeforces\.com\/contest\/(\d+)\/?$`.
  - Trigger `handleContestFetch(contestId)`.

### 3. Implement `handleContestFetch`
- Set `fetching(true)`.
- Fetch `contestData` using the new api utility.
- Initialize `contestMode` with the response.
- Clear `problemCache`.
- Automatically invoke `handleTabSwitch(contestData.problems[0].index)` to load the first problem (Problem A).

### 4. Implement `handleTabSwitch` & Code Hydration
When a user clicks on a different problem tab:
1. **Save current progress**: Save the current `EditorPanel` data (code, language) to `problemCache[activeProblemIndex]`.
2. **Switch Tab**: `setActiveProblemIndex(newIndex)`.
3. **Check Cache**: 
   - If `problemCache[newIndex].details` exists, immediately hydrate the workspace (no API call needed).
   - If it doesn't exist, trigger `fetchProblem(contestId + newIndex)` via the python scraper route. During load, show a loading spinner. Once fetched, store it in `problemCache`.

---

## **Phase 3: New Frontend Components**

### 1. Build `components/ContestTabs.jsx`
- **Props**: `problems` (array of A, B, C), `activeIndex`, `onSelectProblem`.
- **UI**: A horizontal scrollable row with buttons. 
  - Each button shows `Problem.index` (e.g., "A", "B"). Hovering shows the full problem `name`.
  - Highlight the currently active index.

### 2. Build `components/ContestTimer.jsx`
- **Props**: `startTimeSeconds`, `durationSeconds`, `phase`.
- **Logic**:
  - Calculate `endTimeSeconds = startTimeSeconds + durationSeconds`.
  - Create a `setInterval` that calculates remaining time (`endTimeSeconds - current time in seconds`).
  - Format output as `HH:MM:SS`. 
  - Change colors (e.g., turn text red when under 10 minutes left).
  - Handle the "BEFORE" phase (countdown to start) vs "CODING" phase vs "FINISHED".

### 3. Update the Top Bar rendering (App.jsx)
- Inject `<ContestTabs />` and `<ContestTimer />` below or beside the search bar conditionally if `contestMode` is active.

---

## **Acceptance Criteria (Checklist for AI)**

1. **Routing**: `GET /api/contest/:id` successfully returns problem lists and time metadata without crashing.
2. **Detection**: App detects `https://codeforces.com/contest/1984` and fetches the contest instead of failing.
3. **Lazy Loading**: Starting a contest selects Problem A automatically. Navigating to Problem B triggers the scraper for problem B.
4. **Persistence**: 
   - User writes C++ code and runs tests in Problem A.
   - User switches to Problem B, writes Java code.
   - User switches back to Problem A: The C++ code and earlier tests must still be in the exact condition they were left.
5. **Timer accuracy**: Timer correctly decrements using `setInterval` and properly handles standard codeforces "FINISHED" scenarios.