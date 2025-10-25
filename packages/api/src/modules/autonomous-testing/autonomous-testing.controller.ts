import { Request, Response } from 'express';
import { AutonomousTestingService } from './autonomous-testing.service';

export class AutonomousTestingController {
  private service = AutonomousTestingService.getInstance();

  /**
   * POST /api/autonomous-testing/start
   * Start autonomous testing session
   */
  async startTesting(req: Request, res: Response): Promise<void> {
    console.log('\n========================================');
    console.log('🚀 [START] REAL Autonomous Testing Request');
    console.log('========================================');
    console.log('Request Path:', req.path);
    console.log('Request Method:', req.method);
    console.log('User:', (req as any).user?.email);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Timestamp:', new Date().toISOString());
    
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
        console.log('🔐 [AUTH] Website authentication credentials provided for user:', authentication.username);
      }

      // Validate input
      if (!websiteUrl && !apiUrl) {
        console.log('❌ [VALIDATION] Failed - No URL provided');
        res.status(400).json({ 
          error: 'Either websiteUrl or apiUrl must be provided' 
        });
        return;
      }
      
      console.log('✅ [VALIDATION] Passed - Starting real Playwright testing...');

      // Start autonomous testing (async) with REAL Playwright
      const sessionId = await this.service.startAutonomousTesting({
        websiteUrl,
        apiUrl,
        depth: depth || 'deep',
        enableHealing: enableHealing !== false,
        createJiraTickets: createJiraTickets || false,
        headless: false, // Changed to false so browser window is visible for debugging
        parallelWorkers: 3, // Reduced from 5 to 3 to avoid resource issues
        captureVideo: recordVideo !== false,
        captureScreenshots: true,
        aiAnalysisEnabled: true,
        authentication: authentication || undefined,
      });

      console.log('✅ [START] Playwright testing initiated, sessionId:', sessionId);
      res.json({ sessionId });

    } catch (error: any) {
      console.error('Error starting autonomous testing:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/autonomous-testing/progress/:sessionId
   * Stream progress updates via Server-Sent Events
   */
  async getProgress(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;

    // Setup SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Subscribe to progress updates
    const unsubscribe = this.service.subscribeToProgress(sessionId, (update) => {
      res.write(`data: ${JSON.stringify(update)}\n\n`);

      // Close connection when completed or error
      if (update.phase === 'completed' || update.phase === 'error') {
        res.end();
      }
    });

    // Cleanup on client disconnect
    req.on('close', () => {
      unsubscribe();
      res.end();
    });
  }

  /**
   * GET /api/autonomous-testing/results/:sessionId
   * Get final results
   */
  async getResults(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      const results = await this.service.getResults(sessionId);

      if (!results) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      res.json(results);

    } catch (error: any) {
      console.error('Error getting results:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/autonomous-testing/sessions
   * List all sessions
   */
  async listSessions(req: Request, res: Response): Promise<void> {
    try {
      const sessions = await this.service.listSessions();
      res.json({ sessions });

    } catch (error: any) {
      console.error('Error listing sessions:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
