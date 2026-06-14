1. Compilation Error (CE)

The code doesn't compile.

Example 1: Missing semicolon
#include <iostream>
using namespace std;

int main() {
    int x = 5
    cout << x;
}

Error:

expected ';' before 'cout'
Example 2: Undeclared variable
int main() {
    cout << x;
}

Error:

'x' was not declared in this scope
2. Runtime Error (RTE)

Code compiles but crashes while running.

(a) Segmentation Fault

Accessing invalid memory.

int main() {
    int* ptr = nullptr;
    *ptr = 10;
}

Error:

Segmentation Fault
(b) Array Out of Bounds
int arr[5];

int main() {
    arr[100] = 10;
}

May produce:

Segmentation Fault

or undefined behavior.

(c) Stack Overflow

Infinite recursion.

void solve() {
    solve();
}

int main() {
    solve();
}

Error:

Stack Overflow
(d) Divide By Zero
int main() {
    int x = 10 / 0;
}

Error:

Floating point exception
3. Time Limit Exceeded (TLE)

Program takes too long.

Example
int main() {
    while(true) {
    }
}

Verdict:

Time Limit Exceeded
4. Memory Limit Exceeded (MLE)

Uses too much memory.

Example
int main() {
    vector<int> v(1000000000);
}

Verdict:

Memory Limit Exceeded
5. Wrong Answer (WA)

Program runs but gives incorrect output.

Example
int add(int a, int b) {
    return a - b;
}

Expected:

5

Output:

-1

Verdict:

Wrong Answer
6. Presentation Error (PE)

Mostly old judges.

Example

Expected:

1 2 3

Output:

1  2  3

(extra spaces)

Verdict:

Presentation Error

Rare nowadays.

7. Output Limit Exceeded (OLE)

Printing too much output.

Example
int main() {
    while(true) {
        cout << "Hello\n";
    }
}

Verdict:

Output Limit Exceeded
8. Integer Overflow

Very common in LeetCode/GFG.

int main() {
    int x = 100000;
    int y = 100000;

    cout << x * y;
}

Expected:

10000000000

Actual:

Garbage / Overflowed value

Fix:

long long ans = 1LL * x * y;
9. Signed Integer Overflow (UBSan)

LeetCode often shows this.

int x = INT_MAX;
x++;

Error:

runtime error:
signed integer overflow
10. Heap Buffer Overflow (ASan)

Very common.

vector<int> v(5);

cout << v[5];

Error:

heap-buffer-overflow
11. Stack Buffer Overflow
int arr[5];

int main() {
    arr[10] = 1;
}

Error:

stack-buffer-overflow
12. Use After Free
int* p = new int(5);

delete p;

cout << *p;

Error:

heap-use-after-free
13. Null Pointer Dereference

Extremely common in linked lists.

ListNode* head = nullptr;

cout << head->val;

Error:

member access within null pointer
14. Bad Allocation (std::bad_alloc)

Memory allocation fails.

vector<int> v(1e10);

Error:

terminate called after throwing
std::bad_alloc
15. Infinite Loop
int i = 0;

while(i < 10) {
}

Usually becomes:

Time Limit Exceeded
16. Undefined Behavior (UB)

Using uninitialized variables.

int x;

cout << x;

Output:

Random value

No guarantee.

17. Reference Binding Error

Common in recursion/backtracking.

void solve(int& x) {
}

solve(5);

Compilation Error:

cannot bind non-const lvalue reference
to an rvalue
18. Iterator Invalidated
vector<int> v = {1,2,3};

auto it = v.begin();

v.push_back(4);

cout << *it;

May produce:

heap-use-after-free

or undefined behavior.

19. Comparator Error in Priority Queue / Sort
sort(v.begin(), v.end(), cmp);

without defining cmp.

Compilation Error:

'cmp' was not declared
20. Missing Return Statement
int solve() {

}

Warning/Error:

control reaches end of non-void function