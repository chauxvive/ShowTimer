import { useState, useEffect } from 'react'
import './App.css'

//SM clock:

// -  Curtain Down button - (are you sure?)
// -    on curtain down, show show stats: 
// -         Act 1 run time, intermission run time, Act 2 run time, Total run time
// -    (fill in email to send, later, autosends data)

// - (later: option to add additional sections)
// - (add and position additional breaks)
// - (add personalized labels)

// - eventually use this to create storage of dates with previous runtime data
// - also use this to create user info and settings and things

interface TimerProps {
  label: string;
  isRunning: boolean;
  onStartStop: () => void;
  onEnd: (finalTime: number) => void;
  isEnded: boolean;
  finalTime: number;
  reset: boolean;
  onResetAct: () => void;
}

const Timer: React.FC<TimerProps> = ({ label, isRunning, onStartStop, onEnd, isEnded, finalTime, reset, onResetAct }) => {
  const [seconds, setSeconds] = useState<number>(0);

  // Effect to update the timer every second when running
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    if (isRunning && !isEnded) {
      intervalId = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, isEnded]);

  // Function to format seconds into mm:ss
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const secs = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Effect to reset the timer when the `reset` prop changes
  useEffect(() => {
    if (reset) {
      setSeconds(0); // Reset the timer to 0
    }
  }, [reset]);

  return (
    <div>
      <h2>{label}</h2>
      <h3>{isEnded ? `Complete - ${formatTime(finalTime)}` : formatTime(seconds)}</h3>
      {!isEnded && (
        <>
          <button onClick={onStartStop}>{isRunning ? 'Pause' : 'Start'}</button>
          <button onClick={() => onEnd(seconds)}>End</button>
          <button
            onClick={() => {
              setSeconds(0);
              onResetAct();
            }}
            disabled={!isRunning} // Only enable when the act is running
          >
            Reset Act
          </button>
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [act1Running, setAct1Running] = useState<boolean>(false);
  const [act1Ended, setAct1Ended] = useState<boolean>(false);
  const [act1FinalTime, setAct1FinalTime] = useState<number>(0);

  const [intermissionRunning, setIntermissionRunning] = useState<boolean>(false);
  const [intermissionEnded, setIntermissionEnded] = useState<boolean>(false);
  const [intermissionFinalTime, setIntermissionFinalTime] = useState<number>(0);

  const [act2Running, setAct2Running] = useState<boolean>(false);
  const [act2Ended, setAct2Ended] = useState<boolean>(false);
  const [act2FinalTime, setAct2FinalTime] = useState<number>(0);

  const [resetTimers, setResetTimers] = useState<boolean>(false); // Track if timers should be reset

  // Handlers for toggling the timers
  const handleAct1Toggle = () => {
    setAct1Running((prev) => !prev);
    setIntermissionRunning(false);
    setAct2Running(false);
  };

  const handleIntermissionToggle = () => {
    setIntermissionRunning((prev) => !prev);
    setAct1Running(false);
    setAct2Running(false);
  };

  const handleAct2Toggle = () => {
    setAct2Running((prev) => !prev);
    setAct1Running(false);
    setIntermissionRunning(false);
  };

  // Handlers for ending each timer (now accepts the final time)
  const handleAct1End = (finalTime: number) => {
    setAct1Ended(true);
    setAct1Running(false);
    setAct1FinalTime(finalTime); // Store the final time
    setIntermissionRunning(true); // Start intermission automatically
  };

  const handleIntermissionEnd = (finalTime: number) => {
    setIntermissionEnded(true);
    setIntermissionRunning(false);
    setIntermissionFinalTime(finalTime); // Store the final time
    setAct2Running(true); // Start act 2 automatically
  };

  const handleAct2End = (finalTime: number) => {
    setAct2Ended(true);
    setAct2Running(false);
    setAct2FinalTime(finalTime); // Store the final time
  };

  // Reset all timers and states
  const resetAllTimers = () => {
    setAct1Running(false);
    setAct1Ended(false);
    setAct1FinalTime(0);

    setIntermissionRunning(false);
    setIntermissionEnded(false);
    setIntermissionFinalTime(0);

    setAct2Running(false);
    setAct2Ended(false);
    setAct2FinalTime(0);

    setResetTimers(true);

    // Reset the reset state after a brief moment
    setTimeout(() => setResetTimers(false), 0);
  };

  // Handler for resetting the current act only
  const resetAct = (setFinalTime: React.Dispatch<React.SetStateAction<number>>) => {
    setFinalTime(0);
  };

  // Function to format time (for summary)
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const secs = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate total run time (Act 1 + Intermission + Act 2)
  const totalRunTime = act1FinalTime + intermissionFinalTime + act2FinalTime;

  return (
    <div>
      <h1>Show Timer</h1>
      <Timer
        label="Act 1"
        isRunning={act1Running}
        onStartStop={handleAct1Toggle}
        onEnd={handleAct1End}
        isEnded={act1Ended}
        finalTime={act1FinalTime}
        reset={resetTimers}
        onResetAct={() => resetAct(setAct1FinalTime)}
      />
      <Timer
        label="Intermission"
        isRunning={intermissionRunning}
        onStartStop={handleIntermissionToggle}
        onEnd={handleIntermissionEnd}
        isEnded={intermissionEnded}
        finalTime={intermissionFinalTime}
        reset={resetTimers}
        onResetAct={() => resetAct(setIntermissionFinalTime)}
      />
      <Timer
        label="Act 2"
        isRunning={act2Running}
        onStartStop={handleAct2Toggle}
        onEnd={handleAct2End}
        isEnded={act2Ended}
        finalTime={act2FinalTime}
        reset={resetTimers}
        onResetAct={() => resetAct(setAct2FinalTime)}
      />

      {/* Reset button at the bottom */}
      <button onClick={resetAllTimers} style={{ marginTop: '20px' }}>
        Reset All
      </button>

      {/* Display the summary after all acts have ended */}
      {act1Ended && intermissionEnded && act2Ended && (
        <div style={{ marginTop: '20px' }}>
          <h2>Final Show Summary</h2>
          <p>
            <strong>Act 1:</strong> {formatTime(act1FinalTime)}
          </p>
          <p>
            <strong>Intermission:</strong> {formatTime(intermissionFinalTime)}
          </p>
          <p>
            <strong>Act 2:</strong> {formatTime(act2FinalTime)}
          </p>
          <p>
            <strong>Total Runtime:</strong> {formatTime(totalRunTime)}
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
