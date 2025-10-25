import { Request, Response } from 'express';

interface Session {
  id: string;
  status: 'running' | 'completed' | 'error';
  progress: number;
  phase: string;
  message: string;
  startTime: number;
  result?: any;
  videoPath?: string;
}

interface AuthCredentials {
  username: string;
  password: string;
}

export class AutonomousTestingSimpleController {
  private sessions = new Map<string, Session>();

  /**
   * POST /api/autonomous-testing/start
   * Start autonomous testing session
   */
  async startTesting(req: Request, res: Response): Promise<void> {
    console.log('\n========================================');
    console.log('🚀 [START] Autonomous Testing Request');
    console.log('========================================');
    console.log('Request Path:', req.path);
    console.log('Request Method:', req.method);
    console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Timestamp:', new Date().toISOString());
    console.log('SkipAuth Flag:', (req as any).skipAuth);
    
    try {
      const { websiteUrl, apiUrl, depth, enableHealing, createJiraTickets, recordVideo, authentication } = req.body;
      console.log('📝 [VALIDATION] Extracted parameters:', { 
        websiteUrl, 
        apiUrl, 
        depth, 
        enableHealing, 
        createJiraTickets,
        recordVideo,
        hasAuthentication: !!authentication
      });
      
      if (authentication) {
        console.log('🔐 [AUTH] Authentication credentials provided for user:', authentication.username);
      }

      // Validate input
      if (!websiteUrl && !apiUrl) {
        console.log('❌ [VALIDATION] Failed - No URL provided');
        res.status(400).json({ 
          error: 'Either websiteUrl or apiUrl must be provided' 
        });
        return;
      }
      
      console.log('✅ [VALIDATION] Passed - At least one URL provided');

      // Generate session ID
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      console.log('🆔 [SESSION] Generated session ID:', sessionId);

      // Create session
      const session: Session = {
        id: sessionId,
        status: 'running',
        progress: 0,
        phase: 'initializing',
        message: 'Initializing autonomous testing...',
        startTime: Date.now(),
      };
      console.log('💾 [SESSION] Created session object:', JSON.stringify(session, null, 2));

      this.sessions.set(sessionId, session);
      console.log('✅ [SESSION] Stored in sessions map. Total sessions:', this.sessions.size);

      // Simulate autonomous testing process
      console.log('🔄 [SIMULATE] Starting simulation for session:', sessionId);
      this.simulateTesting(sessionId, websiteUrl, apiUrl, depth, authentication, recordVideo);
      console.log('✅ [SIMULATE] Simulation started successfully');

      console.log('📤 [RESPONSE] Sending success response with sessionId:', sessionId);
      res.json({ sessionId });
      console.log('========================================\n');

    } catch (error: any) {
      console.error('\n❌❌❌ [ERROR] Caught exception in startTesting ❌❌❌');
      console.error('Error Type:', error.constructor.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      console.error('========================================\n');
      
      res.status(500).json({ 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Simulate autonomous testing (for development)
   */
  private async simulateTesting(
    sessionId: string, 
    websiteUrl?: string, 
    apiUrl?: string, 
    depth?: string,
    authentication?: AuthCredentials,
    recordVideo?: boolean
  ): Promise<void> {
    console.log('\n📋 [SIMULATE] simulateTesting called');
    console.log('Session ID:', sessionId);
    console.log('Website URL:', websiteUrl);
    console.log('API URL:', apiUrl);
    console.log('Depth:', depth);
    console.log('Authentication:', authentication ? `Yes (${authentication.username})` : 'No');
    console.log('Record Video:', recordVideo ? 'Yes' : 'No');
    
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error('❌ [SIMULATE] Session not found in map!');
      console.error('Available session IDs:', Array.from(this.sessions.keys()));
      return;
    }
    console.log('✅ [SIMULATE] Session found in map');

    console.log(`\n🤖 Starting Autonomous Testing: ${sessionId}`);
    console.log(`Website: ${websiteUrl || 'N/A'}`);
    console.log(`API: ${apiUrl || 'N/A'}`);
    console.log(`Depth: ${depth || 'deep'}`);
    if (authentication) {
      console.log(`🔐 Authentication: ${authentication.username}`);
    }
    if (recordVideo) {
      console.log('🎥 Video recording: ENABLED');
    }
    console.log('');

    // If authentication provided, simulate login
    if (authentication) {
      await this.simulateLogin(sessionId, websiteUrl!, authentication);
    }

    // Setup video recording path if enabled
    const videoPath = recordVideo ? await this.setupVideoRecording(sessionId) : undefined;
    if (videoPath) {
      console.log('🎥 [VIDEO] Recording path:', videoPath);
      const session = this.sessions.get(sessionId);
      if (session) {
        session.videoPath = videoPath;
      }
    }

    // Simulate phases
    const phases = [
      { phase: 'discovery', duration: 3000, progress: 20, message: 'Discovering website structure...' },
      { phase: 'generation', duration: 2000, progress: 40, message: 'Generating test cases...' },
      { phase: 'execution', duration: 5000, progress: 70, message: recordVideo ? 'Executing tests (recording video)...' : 'Executing tests...' },
      { phase: 'analysis', duration: 2000, progress: 90, message: 'Analyzing results...' },
      { phase: 'report', duration: 1000, progress: 100, message: 'Generating report...' },
    ];

    let currentIndex = 0;

    const runNextPhase = () => {
      console.log(`\n🔄 [PHASE] Running phase ${currentIndex + 1}/${phases.length}`);
      if (currentIndex >= phases.length) {
        console.log('\n🏁 [COMPLETE] All phases completed');
        // Complete
        const session = this.sessions.get(sessionId);
        if (!session) {
          console.error('❌ [COMPLETE] Session not found!');
          return;
        }
        console.log('✅ [COMPLETE] Session found, updating status');
        if (session) {
          session.status = 'completed';
          session.phase = 'completed';
          session.progress = 100;
          session.message = 'Autonomous testing completed!';
          session.result = {
            testsGenerated: 87,
            testsPassed: 79,
            testsFailed: 6,
            testsHealed: 2,
            duration: Date.now() - session.startTime,
            videoPath: session.videoPath,
            report: {
              summary: {
                coverage: 85,
                totalTests: 87,
                passed: 79,
                failed: 6,
                healed: 2,
              },
              details: {
                failures: [
                  {
                    testName: 'Login form validation',
                    category: 'APP_BUG',
                    rootCause: 'Form validation not working correctly',
                    confidence: 0.95,
                    suggestedFix: {
                      forDeveloper: 'Check form submission handler in login.js',
                      forQA: 'Verify form validation logic',
                    },
                    jiraTicket: 'PROJ-1234',
                  },
                  {
                    testName: 'Checkout flow',
                    category: 'TEST_ISSUE',
                    rootCause: 'Timeout waiting for payment processing',
                    confidence: 0.80,
                    suggestedFix: {
                      forDeveloper: null,
                      forQA: 'Increase timeout to 10s',
                    },
                  },
                ],
              },
              files: {
                html: `/reports/${sessionId}/report.html`,
                json: `/reports/${sessionId}/report.json`,
                video: session.videoPath,
              },
            },
          };
          
          if (session.videoPath) {
            console.log('🎥 [VIDEO] Recording saved to:', session.videoPath);
          }
        }
        console.log(`\n✅ Session ${sessionId} completed!\n`);
        return;
      }

      const phaseConfig = phases[currentIndex];
      console.log('📊 [PHASE] Phase config:', phaseConfig);
      
      const session = this.sessions.get(sessionId);
      if (!session) {
        console.error('❌ [PHASE] Session not found during phase update!');
        return;
      }
      
      if (session) {
        session.phase = phaseConfig.phase;
        session.progress = phaseConfig.progress;
        session.message = phaseConfig.message;
        console.log('✅ [PHASE] Session updated:', {
          phase: session.phase,
          progress: session.progress,
          message: session.message
        });
      }

      console.log(`  ${phaseConfig.message} (${phaseConfig.progress}%)`);

      currentIndex++;
      console.log(`⏱️  [PHASE] Scheduling next phase in ${phaseConfig.duration}ms`);
      setTimeout(runNextPhase, phaseConfig.duration);
    };

    // Start first phase
    console.log('⏱️  [SIMULATE] Starting first phase in 1000ms');
    setTimeout(runNextPhase, 1000);
  }

  /**
   * Simulate login process
   */
  private async simulateLogin(sessionId: string, websiteUrl: string, credentials: AuthCredentials): Promise<void> {
    console.log('\n🔐 [AUTH] Simulating login process...');
    console.log('🔐 [AUTH] URL:', websiteUrl);
    console.log('🔐 [AUTH] Username:', credentials.username);
    
    const session = this.sessions.get(sessionId);
    if (session) {
      session.phase = 'authentication';
      session.progress = 5;
      session.message = `Logging in as ${credentials.username}...`;
    }

    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ [AUTH] Login simulation completed');
    
    if (session) {
      session.phase = 'authenticated';
      session.progress = 10;
      session.message = 'Login successful, starting tests...';
    }
  }

  /**
   * Setup video recording path
   */
  private async setupVideoRecording(sessionId: string): Promise<string> {
    console.log('\n🎥 [VIDEO] Setting up video recording...');
    
    const os = require('os');
    const path = require('path');
    const fs = require('fs');
    
    // Get user's Downloads folder
    const homeDir = os.homedir();
    const downloadsDir = path.join(homeDir, 'Downloads');
    const testMasterDir = path.join(downloadsDir, 'TestMaster-Videos');
    
    console.log('🎥 [VIDEO] Downloads folder:', downloadsDir);
    console.log('🎥 [VIDEO] TestMaster videos folder:', testMasterDir);
    
    // Create TestMaster-Videos folder if not exists
    if (!fs.existsSync(testMasterDir)) {
      console.log('🎥 [VIDEO] Creating TestMaster-Videos folder...');
      fs.mkdirSync(testMasterDir, { recursive: true });
    }
    
    // Generate video filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const time = new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
    const videoFilename = `autonomous-test-${timestamp}-${time}-${sessionId.split('-').pop()}.webm`;
    const videoPath = path.join(testMasterDir, videoFilename);
    
    console.log('🎥 [VIDEO] Video will be saved to:', videoPath);
    console.log('✅ [VIDEO] Video recording setup completed');
    
    return videoPath;
  }

  /**
   * GET /api/autonomous-testing/progress/:sessionId
   * Stream progress updates via Server-Sent Events
   */
  async getProgress(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;
    console.log('\n📊 [PROGRESS] Request for session:', sessionId);

    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error('❌ [PROGRESS] Session not found:', sessionId);
      console.error('Available sessions:', Array.from(this.sessions.keys()));
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    console.log('✅ [PROGRESS] Session found, setting up SSE');

    // Setup SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    console.log('✅ [PROGRESS] SSE headers set');

    // Send initial update
    const initialUpdate = {
      phase: session.phase,
      progress: session.progress,
      message: session.message,
    };
    console.log('📤 [PROGRESS] Sending initial update:', initialUpdate);
    res.write(`data: ${JSON.stringify(initialUpdate)}\n\n`);

    // Poll for updates
    console.log('🔄 [PROGRESS] Starting polling interval (1000ms)');
    const interval = setInterval(() => {
      const currentSession = this.sessions.get(sessionId);
      if (!currentSession) {
        console.log('❌ [PROGRESS] Session lost, ending SSE');
        clearInterval(interval);
        res.end();
        return;
      }

      const update = {
        phase: currentSession.phase,
        progress: currentSession.progress,
        message: currentSession.message,
      };
      console.log('📤 [PROGRESS] Sending update:', update);
      res.write(`data: ${JSON.stringify(update)}\n\n`);

      // Close if completed or error
      if (currentSession.status === 'completed' || currentSession.status === 'error') {
        console.log(`✅ [PROGRESS] Session ${currentSession.status}, ending SSE`);
        clearInterval(interval);
        res.end();
      }
    }, 1000);

    // Cleanup on client disconnect
    req.on('close', () => {
      console.log('🔌 [PROGRESS] Client disconnected, cleaning up');
      clearInterval(interval);
      res.end();
    });
  }

  /**
   * GET /api/autonomous-testing/results/:sessionId
   * Get final results
   */
  async getResults(req: Request, res: Response): Promise<void> {
    console.log('\n📊 [RESULTS] Request for session:', req.params.sessionId);
    try {
      const { sessionId } = req.params;

      const session = this.sessions.get(sessionId);

      if (!session) {
        console.error('❌ [RESULTS] Session not found:', sessionId);
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      if (!session.result) {
        console.log('⏳ [RESULTS] Testing not completed yet');
        res.status(400).json({ error: 'Testing not completed yet' });
        return;
      }

      console.log('✅ [RESULTS] Sending results');
      res.json(session.result);

    } catch (error: any) {
      console.error('❌ [RESULTS] Error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/autonomous-testing/sessions
   * List all sessions
   */
  async listSessions(req: Request, res: Response): Promise<void> {
    console.log('\n📋 [SESSIONS] Listing all sessions');
    try {
      const sessions = Array.from(this.sessions.values()).map(session => ({
        id: session.id,
        status: session.status,
        phase: session.phase,
        progress: session.progress,
        startTime: session.startTime,
      }));

      console.log(`✅ [SESSIONS] Found ${sessions.length} sessions`);
      res.json({ sessions });

    } catch (error: any) {
      console.error('❌ [SESSIONS] Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
