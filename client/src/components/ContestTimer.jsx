// ContestTimer.jsx
// Countdown / count-up timer for a Codeforces contest.
// Handles three phases:
//   BEFORE   — contest hasn't started yet  → counts down to start
//   CODING   — contest is running           → counts down to end
//   FINISHED — contest is over              → shows "Finished"

import { useState, useEffect } from 'react';

function formatSeconds(totalSecs) {
  if (totalSecs <= 0) return '00:00:00';
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  const pad = n => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function ContestTimer({ startTimeSeconds, durationSeconds, phase }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (phase === 'FINISHED') {
      setRemaining(null);
      return;
    }

    const tick = () => {
      const now = Math.floor(Date.now() / 1000);

      if (phase === 'BEFORE') {
        // Count down to start
        setRemaining(Math.max(0, startTimeSeconds - now));
      } else {
        // CODING phase — count down to end
        const endTime = startTimeSeconds + durationSeconds;
        setRemaining(Math.max(0, endTime - now));
      }
    };

    tick(); // run immediately
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTimeSeconds, durationSeconds, phase]);

  if (phase === 'FINISHED') {
    return <span className="contest-timer finished">Finished</span>;
  }

  const label   = phase === 'BEFORE' ? 'Starts in' : 'Time left';
  const urgent  = remaining !== null && remaining < 600; // under 10 min
  const display = remaining !== null ? formatSeconds(remaining) : '--:--:--';

  return (
    <div className="contest-timer-wrap">
      <span className="contest-timer-label">{label}</span>
      <span className={`contest-timer${urgent ? ' urgent' : ''}`}>{display}</span>
    </div>
  );
}
