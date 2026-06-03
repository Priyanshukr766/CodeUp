import { useState, useRef } from 'react';

export default function CustomTestCase({ id, onRemove, onChange }) {
  const [input, setInput]   = useState('');
  const [output, setOutput] = useState('');

  const handleInputChange = (val) => {
    setInput(val);
    onChange(id, { input: val, expectedOutput: output });
  };

  const handleOutputChange = (val) => {
    setOutput(val);
    onChange(id, { input, expectedOutput: val });
  };

  return (
    <div className="custom-test">
      <div className="custom-test-header">
        <span>Custom Test {id}</span>
        <button className="remove-btn" onClick={() => onRemove(id)} title="Remove">×</button>
      </div>
      <div className="custom-test-body">
        <div className="custom-test-pane">
          <label>Input</label>
          <textarea
            className="custom-test-textarea"
            placeholder="Enter input..."
            value={input}
            onChange={e => handleInputChange(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="custom-test-pane">
          <label>Expected Output</label>
          <textarea
            className="custom-test-textarea"
            placeholder="Expected output (optional)..."
            value={output}
            onChange={e => handleOutputChange(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
