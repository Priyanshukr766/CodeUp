// Boilerplate templates per language
export const LANGUAGES = [
  { id: 'cpp',    label: 'C++17',   monacoId: 'cpp'    },
  { id: 'c',      label: 'C',       monacoId: 'c'      },
  { id: 'java',   label: 'Java',    monacoId: 'java'   },
  { id: 'python', label: 'Python',  monacoId: 'python' },
];

export const BOILERPLATES = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // your code here

    return 0;
}
`,

  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // your code here

    return 0;
}
`,

  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // your code here
    }
}
`,

  python: `import sys
input = sys.stdin.readline

def solve():
    # your code here
    pass

t = int(input())
for _ in range(t):
    solve()
`,
};
