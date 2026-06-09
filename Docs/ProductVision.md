
Core Product Vision

A LeetCode-style coding workspace for Codeforces where users can:

Enter a Codeforces problem URL or problem code.
The platform fetches and renders the problem statement exactly like Codeforces.
The left panel contains:
Problem statement
Constraints
Examples
Images if any
Rating
Tags
Sample test cases
The right panel contains:
Monaco Editor
Language selector (C++ / C / Java)
Boilerplate template
Run button
When Run is clicked:
Code is sent to Judge0
Every fetched sample testcase is executed automatically
Any custom user-added testcases are also executed
Detailed verdicts are shown

Example:

✓ Sample 1 Passed
✓ Sample 2 Passed
✗ Sample 3 Failed

Expected:
15

Received:
14
Passed test cases boundary Green failed test cases boundary by red


Main Pain Point Being Solved

Current workflow:

Codeforces
     ↓
Read problem
     ↓
Open VS Code
     ↓
Write code
     ↓
Copy sample input
     ↓
Paste into terminal
     ↓
Run
     ↓
Switch tabs
     ↓
Copy another testcase
     ↓
Run again

Your workflow:

Open platform
     ↓
Paste CF link
     ↓
Code
     ↓
Run
     ↓
See all testcase results

No tab switching.

No manual copy-pasting.

No VS Code setup.

No terminal.

MVP Scope (What I Would Build First)
Must Have
Fetch CF problem
Render statement
Monaco editor
Language selection
Boilerplate templates
OnlineCompiler api integration
Run against all sample tests
Add custom testcases
Detailed verdict UI
Save code locally

Not MVP
Login
Direct CF submission
Analytics dashboard
AI hints
Editorials
Notes
Progress tracking
Future Roadmap (Based on Your Answers)

Phase 2:
User accounts
Code sync
Problem history
Saved drafts

Phase 3:

Connect Codeforces handle
Fetch submissions
Analytics dashboard

Examples:

Strong:
Greedy
Binary Search

Weak:
DP
Graphs
Problems Solved:
423

Average Rating:
1560

Highest Solved:
2100

Phase 4:

AI hints
AI editorial explanations
AI weakness analysis

Phase 5:

Direct Codeforces submission
Contest mode

Phase 6:

Support for CSES
Support for AtCoder

For frontend and backend we use JS(mean react node express ..)
Scraper and stuff remain in python