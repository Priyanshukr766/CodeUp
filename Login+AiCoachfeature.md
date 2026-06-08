# Analytics & AI Coach Docs

### Analytics
1. Skill Distribution
2. Difficulty Distribution
3. Practice Consistency

### AI Coach
4. Strength & Weakness Report
5. Personalized Problem Recommendations

---

# Architecture Overview

## Data Sources

### Source A - Codeforces official APIs

Used for:

* Skill Distribution
* Difficulty Distribution
* Strength & Weakness Report
* Personalized Recommendations

Data fetched:

* Solved problems
* Problem tags
* Problem ratings
* User submission history

---

### Source B - App Activity

Used for:

* Practice Consistency

Data collected internally:

* User login dates
* Problem solve dates
* Session activity

---

# Supabase Database Design

## users

Stores authenticated users.

```sql
create table users (
    id uuid primary key,
    email text unique not null,
    name text,
    cf_handle text unique,
    created_at timestamptz default now()
);
```

---

## cf_problems

Stores metadata for Codeforces problems.

```sql
create table cf_problems (
    contest_id integer not null,
    problem_index text not null,
    problem_name text not null,
    rating integer,
    tags text[],
    
    primary key (contest_id, problem_index)
);
```

Purpose:

Avoid repeatedly fetching tags and ratings from Codeforces.

---

## user_solved_problems

Stores problems solved by a user.

```sql
create table user_solved_problems (
    id bigint generated always as identity primary key,

    user_id uuid not null references users(id),

    contest_id integer not null,
    problem_index text not null,

    solved_at timestamptz,

    unique(user_id, contest_id, problem_index)
);
```

Purpose:

Foundation for:

* Skill Distribution
* Difficulty Distribution
* Strength/Weakness
* Recommendations

---

## user_activity

Stores daily activity.

```sql
create table user_activity (
    id bigint generated always as identity primary key,

    user_id uuid not null references users(id),

    activity_date date not null,

    problems_solved integer default 0,

    unique(user_id, activity_date)
);
```

Purpose:

Practice Consistency.

---

## recommendation_cache

Optional cache table.

```sql
create table recommendation_cache (
    user_id uuid primary key references users(id),

    generated_at timestamptz default now(),

    recommendations jsonb
);
```

Purpose:

Avoid generating recommendations repeatedly.

---

# Codeforces Synchronization

## Initial Sync

After user enters CF handle:

### Fetch

```http
https://codeforces.com/api/user.status?handle={handle}
```

Extract:

* Accepted submissions only

For every accepted submission:

Store:

```text
contest_id
problem_index
solved_at
```

into:

```text
user_solved_problems
```

---

## Problem Metadata Sync

Fetch:

```http
https://codeforces.com/api/problemset.problems
```

Store:

```text
rating
tags
name
contest id
index
```

into:

```text
cf_problems
```

Run periodically.

Recommended:

* Once daily
* Or manual admin refresh

---

# FEATURE IMPLEMENTATION

---

# Feature 1 - Skill Distribution

## Purpose

Show topic-wise solved problem distribution.

---

## Data Source

Codeforces Handle

Tables:

```text
user_solved_problems
cf_problems
```

---

## Computation

Join:

```text
user_solved_problems
+
cf_problems
```

Count solved problems per tag.

Example:

```text
Greedy = 42

DP = 15

Graphs = 9
```

---

## UI

Use:

Horizontal Bar Chart

Example:

```text
Greedy          ████████████ 42
DP              █████        15
Graphs          ██            9
```

---

## Output

Top 10 tags only.

---

# Feature 2 - Difficulty Distribution

## Purpose

Show difficulty spread of solved problems.

---

## Data Source

Codeforces Handle

Tables:

```text
user_solved_problems
cf_problems
```

---

## Computation

Group solved problems by rating.

Buckets:

```text
800
1000
1200
1400
1600
1800
2000+
```

Example:

```text
800 -> 20
1000 -> 45
1200 -> 60
1400 -> 23
```

---

## UI

Vertical Histogram

Example:

```text
       █
       █
   █   █
 █ █ █ █
-----------
800 1000 1200 1400
```

---

## Output

Show:

```text
Most Solved Difficulty:
1200

Highest Solved Difficulty:
1800
```

---

# Feature 3 - Practice Consistency

## Purpose

Measure regularity.

---

## Data Source

App Activity

Table:

```text
user_activity
```

---

## Computation

Current Streak:

Consecutive dates where:

```text
problems_solved > 0
```

---

Weekly Solves:

```text
last 7 days
```

---

Monthly Solves:

```text
last 30 days
```

---

## UI

Show cards.

Example:

```text
Current Streak

12 Days
```

---

```text
Problems Solved

This Week : 18

This Month : 64
```

---

No chart required.

Simple stat cards.

---

# Feature 4 - Strength & Weakness Report

## Purpose

Identify strongest and weakest topics.

---

## Data Sources

Codeforces Handle

and

App Activity (optional enhancement)

---

## Metrics

For each tag:

Compute:

```text
Solved Count
```

---

Rank tags.

---

Strengths:

Top 3 tags.

Example:

```text
Greedy
Math
Binary Search
```

---

Weaknesses:

Bottom 3 tags.

Conditions:

Minimum problem threshold.

Ignore tags with:

```text
solved_count < 3
```

to avoid noise.

---

## UI

Simple AI Report Card.

Example:

```text
Strengths

✓ Greedy
✓ Math
✓ Binary Search

Weak Areas

✗ Graphs
✗ DP
✗ Trees
```

No graph required.

---

# Feature 5 - Personalized Problem Recommendations

## Purpose

Recommend what to solve next.

---

## Data Sources

Codeforces Handle

Tables:

```text
user_solved_problems
cf_problems
```

---

## Recommendation Logic V1

No LLM required.

Rule-based.

---

Step 1

Identify weakest tag.

Example:

```text
Graphs
```

---

Step 2

Find unsolved problems.

Constraints: tag = Graphs


---

Step 3

Difficulty Selection

Choose:

```text
Current Comfort Rating + 100
```

Example:

Most solved difficulty:

```text
1200
```

Recommend:

```text
1300
```

problems.

---

Step 4

Return top 5 problems.

---

## Output

Example:

```text
Recommended Next Problems

1. Problem A

Reason:
Weak Topic = Graphs

2. Problem B

Reason:
Weak Topic = Graphs
```

---

## UI

Simple recommendation cards.

Each card:

```text
Problem Name

Rating

Tags

Reason
```

No chart required.

---

# Authentication
Supabase Auth

Providers:

* Google

No email/password implementation.

---

# MVP Flow

1. User logs in with Google.
2. User enters Codeforces handle.
3. Backend syncs CF history.
4. Analytics generated from stored data.
5. Practice activity collected from app usage.
6. Recommendation engine generates suggested problems.
7. Dashboard displays all five finalized features.
