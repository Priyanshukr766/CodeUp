# Future AI Coach Features

These features will be implemented AFTER the initial analytics system is completed.

Prerequisites:

* Skill Distribution
* Difficulty Distribution
* Practice Consistency
* Strength & Weakness Report
* Personalized Problem Recommendations

must already exist.

---

# Feature 6 - AI Skill Gap Explanation

## Purpose

Convert analytics data into a human-readable explanation of why the user is struggling and what skills are preventing progression.

---

## AI Provider

Recommended:

* Gemini API

---

## Input Sources

### Analytics Engine Output

```json
{
  "current_rating": 1450,
  "top_tags": ["Greedy", "Binary Search"],
  "weak_tags": ["Graphs", "DP"],
  "most_solved_rating": 1200,
  "highest_solved_rating": 1700,
  "streak": 14
}
```

No raw Codeforces data should be sent.

Only processed analytics.

---

## Prompt Objective

Ask Gemini to:

1. Explain strengths
2. Explain weaknesses
3. Explain likely skill gaps
4. Explain what is limiting rating growth

---

## Expected Output

Example:

```text
Your strongest area is Greedy problem solving, indicating strong pattern recognition skills.

However, Graph and Dynamic Programming problems are significantly underrepresented in your practice history.

These topics frequently appear in 1500+ rated problems and may currently be limiting your progression.

Improving these areas is likely to have the highest impact on your future rating growth.
```

---

## UI  
A beatuiful modern card.

Title:

```text
AI Skill Gap Analysis
```

Content:

AI generated explanation.

No charts.

---

# Feature 7 - AI Goal-Based Roadmap

## Purpose

Generate a personalized roadmap based on a target Codeforces rating.

---

## AI Provider

Recommended:

* Gemini API

---

## User Input

```text
Target Rating
```

Example:

```text
1600
```

---

## Analytics Input

```json
{
  "current_rating": 1450,
  "top_tags": ["Greedy", "Binary Search"],
  "weak_tags": ["Graphs", "DP"],
  "most_solved_rating": 1200
}
```

---

## Prompt Objective

Ask Gemini to generate:

1. Weak topics to focus on
2. Order of study
3. Weekly progression plan
4. Suggested practice direction

---

## Expected Output

Example:

```text
Roadmap to 1600

Week 1:
Graph Traversal Fundamentals

Week 2:
Shortest Path Problems

Week 3:
Introduction to Dynamic Programming

Week 4:
Mixed Practice (1400-1600)

Focus primarily on Graphs and DP, as these represent the largest gaps in your current profile.
```

---

## UI

Modern stryled Card or modal.

Title:

```text
Roadmap to {Target Rating}
```

Content:

AI generated roadmap.

No charts.

---

# AI Architecture

```text
Codeforces Data
      +
App Activity
      ↓
Analytics Engine
      ↓
Processed Metrics
      ↓
Gemini API
      ↓
AI Explanation / Roadmap
```

Important:

Never send raw submission history to Gemini.

Always send processed analytics summaries.

This reduces token usage, improves response quality, and keeps costs within the free tier.
