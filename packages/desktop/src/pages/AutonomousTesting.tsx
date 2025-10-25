import React, { useState } from 'react';
import '../renderer/App.css';

// Simple styling until MUI is properly set up
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '24px',
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  select: {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#e5e5e5',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '8px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.3s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginTop: '16px',
  },
  statCard: {
    textAlign: 'center' as const,
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  alert: {
    padding: '12px 16px',
    marginBottom: '16px',
    borderRadius: '4px',
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
  },
};

interface ProgressUpdate {
  phase: string;
  progress: number;
  message: string;
  details?: any;
}

export default function AutonomousTestingPage() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [depth, setDepth] = useState<'shallow' | 'deep' | 'exhaustive'>('deep');
  const [enableHealing, setEnableHealing] = useState(true);
  const [createJiraTickets, setCreateJiraTickets] = useState(false);
  
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<'input' | 'running' | 'completed'>('input');
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartTesting = async () => {
    if (!websiteUrl && !apiUrl) {
      setError('Please enter at least Website URL or API URL');
      return;
    }

    setError(null);
    setIsRunning(true);
    setPhase('running');
    setResult(null);

    try {
      // Call API to start autonomous testing
      const API_URL = 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/autonomous-testing/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: websiteUrl || undefined,
          apiUrl: apiUrl || undefined,
          depth,
          enableHealing,
          createJiraTickets,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start autonomous testing');
      }

      const { sessionId } = await response.json();

      // Subscribe to progress updates via SSE
      const API_URL = 'http://localhost:3001';
      const eventSource = new EventSource(`${API_URL}/api/autonomous-testing/progress/${sessionId}`);

      eventSource.onmessage = (event) => {
        const update: ProgressUpdate = JSON.parse(event.data);
        setProgress(update);

        if (update.phase === 'completed') {
          eventSource.close();
          fetchResults(sessionId);
        }

        if (update.phase === 'error') {
          eventSource.close();
          setError(update.message);
          setIsRunning(false);
          setPhase('input');
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setError('Connection lost. Please try again.');
        setIsRunning(false);
        setPhase('input');
      };

    } catch (err: any) {
      setError(err.message);
      setIsRunning(false);
      setPhase('input');
    }
  };

  const fetchResults = async (sessionId: string) => {
    try {
      const API_URL = 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/autonomous-testing/results/${sessionId}`);
      const results = await response.json();
      
      setResult(results);
      setIsRunning(false);
      setPhase('completed');

    } catch (err) {
      setError('Failed to fetch results');
      setIsRunning(false);
      setPhase('input');
    }
  };

  const handleReset = () => {
    setPhase('input');
    setProgress(null);
    setResult(null);
    setError(null);
  };

  const getPhaseLabel = (phaseKey: string) => {
    const labels: Record<string, string> = {
      discovery: '🔍 Discovering',
      generation: '🧪 Generating Tests',
      execution: '▶️  Executing',
      analysis: '🧠 Analyzing',
      report: '📊 Generating Report',
      completed: '✅ Completed',
    };
    return labels[phaseKey] || phaseKey;
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Rocket fontSize="large" color="primary" />
          Autonomous Testing
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Automatically discover, test, and analyze any website or API with AI-powered testing
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Input Phase */}
      {phase === 'input' && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website URL"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  helperText="URL of the website to test"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API Base URL (Optional)"
                  placeholder="https://api.example.com"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  helperText="Base URL for API testing"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Test Depth</InputLabel>
                  <Select
                    value={depth}
                    label="Test Depth"
                    onChange={(e) => setDepth(e.target.value as any)}
                  >
                    <MenuItem value="shallow">Shallow (5-10 tests, 2-3 min)</MenuItem>
                    <MenuItem value="deep">Deep (50-100 tests, 10-15 min)</MenuItem>
                    <MenuItem value="exhaustive">Exhaustive (200+ tests, 30+ min)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={enableHealing}
                      onChange={(e) => setEnableHealing(e.target.checked)}
                    />
                  }
                  label="Enable Self-Healing (Auto-fix broken tests)"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={createJiraTickets}
                      onChange={(e) => setCreateJiraTickets(e.target.checked)}
                    />
                  }
                  label="Create Jira tickets for bugs"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleStartTesting}
                  startIcon={<Rocket />}
                  sx={{ py: 2, fontSize: '1.1rem' }}
                >
                  Start Autonomous Testing
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Running Phase */}
      {phase === 'running' && progress && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {getPhaseLabel(progress.phase)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={progress.progress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {progress.message} ({Math.round(progress.progress)}%)
              </Typography>
            </Box>

            {progress.details && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  {progress.details.pagesFound !== undefined && (
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h5">{progress.details.pagesFound}</Typography>
                        <Typography variant="caption" color="text.secondary">Pages Found</Typography>
                      </Paper>
                    </Grid>
                  )}
                  {progress.details.endpointsFound !== undefined && (
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h5">{progress.details.endpointsFound}</Typography>
                        <Typography variant="caption" color="text.secondary">APIs Found</Typography>
                      </Paper>
                    </Grid>
                  )}
                  {progress.details.testsGenerated !== undefined && (
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h5">{progress.details.testsGenerated}</Typography>
                        <Typography variant="caption" color="text.secondary">Tests Generated</Typography>
                      </Paper>
                    </Grid>
                  )}
                  {progress.details.passed !== undefined && (
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                        <Typography variant="h5" color="success.dark">{progress.details.passed}</Typography>
                        <Typography variant="caption" color="success.dark">Passed</Typography>
                      </Paper>
                    </Grid>
                  )}
                  {progress.details.failed !== undefined && (
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                        <Typography variant="h5" color="error.dark">{progress.details.failed}</Typography>
                        <Typography variant="caption" color="error.dark">Failed</Typography>
                      </Paper>
                    </Grid>
                  )}
                  {progress.details.healed !== undefined && (
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                        <Typography variant="h5" color="warning.dark">{progress.details.healed}</Typography>
                        <Typography variant="caption" color="warning.dark">Healed</Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>

                {progress.details.currentTest && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Current: {progress.details.currentTest}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Completed Phase */}
      {phase === 'completed' && result && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <CheckCircle color="success" fontSize="large" />
                <Typography variant="h5">
                  Autonomous Testing Completed!
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={6} md={2}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3">{result.testsGenerated}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Tests</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="success.main">{result.testsPassed}</Typography>
                    <Typography variant="body2" color="text.secondary">Passed</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="error.main">{result.testsFailed}</Typography>
                    <Typography variant="body2" color="text.secondary">Failed</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="warning.main">{result.testsHealed}</Typography>
                    <Typography variant="body2" color="text.secondary">Healed</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3">{result.report.summary.coverage}%</Typography>
                    <Typography variant="body2" color="text.secondary">Coverage</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3">
                      {Math.floor(result.duration / 1000 / 60)}m
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Duration</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {result.report.details.failures.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Error color="error" />
                  Issues Found ({result.report.details.failures.length})
                </Typography>

                {result.report.details.failures.map((failure: any, index: number) => (
                  <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip label={failure.category} size="small" color="error" />
                      <Chip label={`${Math.round(failure.confidence * 100)}% confidence`} size="small" />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Root Cause:</strong> {failure.rootCause}
                    </Typography>
                    {failure.suggestedFix.forDeveloper && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>💡 For Developer:</strong> {failure.suggestedFix.forDeveloper}
                      </Typography>
                    )}
                    {failure.jiraTicket && (
                      <Chip label={`Jira: ${failure.jiraTicket}`} size="small" color="primary" />
                    )}
                  </Paper>
                ))}
              </CardContent>
            </Card>
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => window.open(result.report.files.html, '_blank')}
            >
              View HTML Report
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.open(result.report.files.json, '_blank')}
            >
              Download JSON
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
            >
              Run New Test
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
