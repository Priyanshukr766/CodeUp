int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // your code here
    cout<<x;
    return 0;
}
Sample 1: Compilation Error
In function 'int main()':
 error: 'x' was not declared in this scope



int main() {
    int* ptr = nullptr;
    *ptr = 10;
}
Sample 1: Compilation Error




int main() {
    int arr[5];
    arr[100] = 10;
    cout<<arr[1000];
    return 0;
}
Sample 1: Wrong answer





void solve() {
    solve();
}
int main() {
    solve();
    return 0;
}
Sample 1: Compilation Error
Internal error: Code execution failed





int main() {
    int x = 10 / 0;
}
Sample 1: Compilation error
Internal error: code execution failed





int main() {
    while(true) {
    }
}
Sample 1: Compilation error
(Took plenty of time for evaluation to come)






int main() {
    vector<int> v(1000000000);
}
Sample 1: Compilation error
Internal error: code execution failed





int main() {
    int x = INT_MAX;
    x*=x;
    cout<<x;
}
Sample1:Wrong answer






int main() {
    vector<int> v(5);
    cout << v[5];
}
Sample1:Compilation error 
Internal error: Code execution failed







int main() {
    int* p = new int(5);
    delete p;
    cout << *p;
}
Your Output
1047
Expected Output
2
Your Output
1047
Expected Output
2





int main() {
    ListNode* head = nullptr;
    cout << head->val;
}
Your Output
(empty)
Expected Output
2
In function 'int main()':
 error: 'ListNode' was not declared in this scope
    5 |     ListNode* head = nullptr;
      |     ^~~~~~~~
code.cc:5:15: error: 'head' was not declared in this scope; did you mean 'read'?
    5 |     ListNode* head = nullptr;
      |               ^~~~
      |               read
Your Output
(empty)





int solve(){
    
}

int main() {
    int x =solve();
    cout<<000;
}
Sample1: Compilation error
Internal error: code execution failed





int main() {
    vector<int>v= {1,2,3,0};
    sort(v.begin(), v.end(), cmp);
    for(auto &it: v)cout<<it<<" ";
    return 0;
}
In function 'int main()':
 error: 'cmp' was not declared in this scope; did you mean 'bcmp'?
   10 |     sort(v.begin(), v.end(), cmp);
      |                              ^~~
      |                              bcmp





int solve(){

}
int main() {
    vector<int>v= {1,2,3,0};
    sort(v.begin(), v.end(), cmp);
    for(auto &it: v)cout<<it<<" ";
    return 0;
}
In function 'int solve()':
 warning: no return statement in function returning non-void [-Wreturn-type]
    6 | }
      | ^






void solve(int& x) {
}
int main(){
    solve(5);
    return 0;
}
In function 'int main()':
 error: cannot bind non-const lvalue reference of type 'int&' to an rvalue of type 'int'
    7 |     solve(5);
      |           ^
code.cc:4:17: note: initializing argument 1 of 'void solve(int&)'
    4 | void solve(int& x) {
      |            ~~~~~^