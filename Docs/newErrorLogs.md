int main() {
    int* ptr = nullptr;
    *ptr = 10;
}
Runtime/Limit excedded
Your Output
(empty)
Expected Output
YES
abc
Internal error: code execution failed

[CodeUp Hint]: The execution sandbox crashed. This is often caused by Memory Limit Exceeded, Division by Zero, or an Infinite Loop.







int main() {
    while(true){}
}
Your Output
(empty)
Expected Output
YES
abc
Internal error: code execution failed

[CodeUp Hint]: The execution sandbox crashed. This is often caused by Memory Limit Exceeded, Division by Zero, or an Infinite Loop.




int main() {
    cout<<1/0;
}
Your Output
(empty)
Expected Output
YES
abc
Internal error: code execution failed

[CodeUp Hint]: The execution sandbox crashed. This is often caused by Memory Limit Exceeded, Division by Zero, or an Infinite Loop.







int main() {
    int arr[5];
    arr[100] = 10;
}
Your Output
(empty)
Expected Output
YES
abc
In function 'int main()':
 warning: variable 'arr' set but not used [-Wunused-but-set-variable]
   10 |     int arr[5];
      |         ^~~





void solve() {
    solve();
}

int main() {
    solve();
}
Your Output
(empty)
Expected Output
YES
abc
Internal error: code execution failed

[CodeUp Hint]: The execution sandbox crashed. This is often caused by Memory Limit Exceeded, Division by Zero, or an Infinite Loop.







int main(){
    stack<int>stt;
    cout<<stt.top();
}
Your Output
(empty)
Expected Output
YES
abc
Internal error: code execution failed

[CodeUp Hint]: The execution sandbox crashed. This is often caused by Memory Limit Exceeded, Division by Zero, or an Infinite Loop.