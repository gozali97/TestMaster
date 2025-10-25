import { useState } from 'react';
import './Recorder.css';

interface RecordedAction {
  id: string;
  type: string;
  locator: string;
  value?: string;
  timestamp: Date;
}

export const Recorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [actions, setActions] = useState<RecordedAction[]>([]);
  const [selectedBrowser, setSelectedBrowser] = useState<'chromium' | 'firefox' | 'webkit'>('chromium');

  const startRecording = async () => {
    setIsRecording(true);
    setIsPaused(false);
    setActions([]);
    
    // Simulate recording (in real implementation, this would launch Playwright)
    console.log('Starting recorder with browser:', selectedBrowser);
    
    // Mock some recorded actions
    setTimeout(() => {
      addAction('navigate', 'page', 'https://example.com');
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    console.log('Recording stopped');
  };

  const pauseRecording = () => {
    setIsPaused(!isPaused);
    console.log(isPaused ? 'Recording resumed' : 'Recording paused');
  };

  const addAction = (type: string, locator: string, value?: string) => {
    const newAction: RecordedAction = {
      id: Date.now().toString(),
      type,
      locator,
      value,
      timestamp: new Date(),
    };
    setActions(prev => [...prev, newAction]);
  };

  const deleteAction = (id: string) => {
    setActions(prev => prev.filter(a => a.id !== id));
  };

  const generateTestCase = () => {
    console.log('Generating test case from recorded actions:', actions);
    // In real implementation, this would create a test case
  };

  return (
    <div className="recorder">
      <div className="recorder-header">
        <h2>Test Recorder</h2>
        <p>Record browser interactions to create automated tests</p>
      </div>

      <div className="recorder-controls">
        <div className="browser-selector">
          <label>Browser:</label>
          <select
            value={selectedBrowser}
            onChange={(e) => setSelectedBrowser(e.target.value as any)}
            disabled={isRecording}
          >
            <option value="chromium">Chromium</option>
            <option value="firefox">Firefox</option>
            <option value="webkit">WebKit</option>
          </select>
        </div>

        <div className="recording-controls">
          {!isRecording ? (
            <button className="btn-start" onClick={startRecording}>
              <span className="record-icon">●</span> Start Recording
            </button>
          ) : (
            <>
              <button className="btn-pause" onClick={pauseRecording}>
                {isPaused ? '▶ Resume' : '⏸ Pause'}
              </button>
              <button className="btn-stop" onClick={stopRecording}>
                ⏹ Stop
              </button>
            </>
          )}
        </div>

        {isRecording && (
          <div className="recording-status">
            <span className={`status-indicator ${isPaused ? 'paused' : 'recording'}`}></span>
            <span>{isPaused ? 'Paused' : 'Recording...'}</span>
          </div>
        )}
      </div>

      <div className="recorded-actions">
        <div className="actions-header">
          <h3>Recorded Actions ({actions.length})</h3>
          {actions.length > 0 && (
            <button className="btn-generate" onClick={generateTestCase}>
              Generate Test Case
            </button>
          )}
        </div>

        {actions.length === 0 ? (
          <div className="empty-state">
            <p>No actions recorded yet</p>
            <p>Click "Start Recording" to begin capturing interactions</p>
          </div>
        ) : (
          <div className="actions-list">
            {actions.map((action, index) => (
              <div key={action.id} className="action-item">
                <div className="action-number">{index + 1}</div>
                <div className="action-content">
                  <div className="action-type">{action.type}</div>
                  <div className="action-locator">{action.locator}</div>
                  {action.value && <div className="action-value">Value: {action.value}</div>}
                  <div className="action-time">
                    {action.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <button className="action-delete" onClick={() => deleteAction(action.id)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
