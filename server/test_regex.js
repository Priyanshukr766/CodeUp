const stderr = `error: 'vector' was not declared in this scope
    1 | int main() { vector<int>v; cout<<v[100]; return 0; }
      |              ^~~~~~
Line 1: error: expected primary-expression before 'int'
    1 | int main() { vector<int>v; cout<<v[100]; return 0; }
      |                     ^~~`;
let lines = stderr.split('\n');
for (let line of lines) {
  if (/^\s*\d+\s*\|/.test(line)) console.log('IGNORED NUM:', line);
  else if (/^\s*\|/.test(line)) console.log('IGNORED PIPE:', line);
  else console.log('KEPT:', line);
}
