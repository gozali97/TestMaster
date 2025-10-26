import { Request, Response } from 'express';
// Direct import from source to avoid build issues
import { MultiPanelOrchestrator } from '@testmaster/test-engine/src/autonomous/MultiPanelOrchestrator';
import { v4 as uuidv4 } from 'uuid';

/**
 * Multi-Panel Autonomous Testing Controller
 */
export class MultiPanelController {
  private sessions: Map<string, any> = new Map();
  private progressListeners: Map<string, Function[]> = new Map();
  
  /**
   * POST /api/autonomous-testing/multi-panel/start
   * Start multi-panel testing session
   */
  async startMultiPanelTesting(req: Request, res: Response): Promise<void> {
    console.log('\n========================================');
    console.log('🚀 [MULTI-PANEL] Start Testing Request');
    console.log('========================================');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    try {
      const config = req.body;
      
      // Validate required fields
      if (!config.landingPage?.url) {
        res.status(400).json({ error: 'landingPage.url is required' });
        return;
      }
      
      if (!config.adminPanel?.url || !config.adminPanel?.credentials) {
        res.status(400).json({ error: 'adminPanel.url and credentials are required' });
        return;
      }
      
      // Generate session ID
      const sessionId = `MP-${uuidv4()}`;
      
      console.log('✅ [MULTI-PANEL] Configuration validated');
      console.log(`✅ [MULTI-PANEL] Session ID: ${sessionId}`);
      
      // Store session
      this.sessions.set(sessionId, {
        status: 'in_progress',
        startTime: Date.now(),
        config,
      });
      
      // Start testing asynchronously
      this.runMultiPanelTesting(sessionId, config).catch((error) => {
        console.error(`❌ [MULTI-PANEL] Session ${sessionId} failed:`, error);
        this.sessions.set(sessionId, {
          status: 'error',
          error: error.message,
        });
      });
      
      res.json({ sessionId });
      
    } catch (error: any) {
      console.error('❌ [MULTI-PANEL] Start failed:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * GET /api/autonomous-testing/multi-panel/progress/:sessionId
   * Stream progress updates via Server-Sent Events
   */
  async getProgress(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;
    
    console.log(`📡 [MULTI-PANEL] Progress stream started for ${sessionId}`);
    
    // Setup SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send initial status
    const session = this.sessions.get(sessionId);
    if (!session) {
      res.write(`data: ${JSON.stringify({
        phase: 'error',
        progress: 0,
        message: 'Session not found'
      })}\n\n`);
      res.end();
      return;
    }
    
    // Register progress listener
    const listener = (update: any) => {
      console.log(`📡 [MULTI-PANEL] Sending progress update for ${sessionId}:`, update);
      res.write(`data: ${JSON.stringify(update)}\n\n`);
      
      if (update.phase === 'completed' || update.phase === 'error') {
        res.end();
      }
    };
    
    if (!this.progressListeners.has(sessionId)) {
      this.progressListeners.set(sessionId, []);
    }
    this.progressListeners.get(sessionId)!.push(listener);
    
    // Send initial "connected" message
    console.log(`📡 [MULTI-PANEL] Sending initial connected message for ${sessionId}`);
    res.write(`data: ${JSON.stringify({
      phase: 'connected',
      progress: 0,
      message: 'Connected to progress stream, starting tests...'
    })}\n\n`);
    
    // Cleanup on client disconnect
    req.on('close', () => {
      const listeners = this.progressListeners.get(sessionId) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
      console.log(`📡 [MULTI-PANEL] Progress stream closed for ${sessionId}`);
    });
  }
  
  /**
   * GET /api/autonomous-testing/multi-panel/results/:sessionId
   * Get final results
   */
  async getResults(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      console.log(`[MULTI-PANEL] Getting results for session: ${sessionId}`);
      
      const session = this.sessions.get(sessionId);
      
      if (!session) {
        console.log(`[MULTI-PANEL] Session not found: ${sessionId}`);
        res.status(404).json({ error: 'Session not found' });
        return;
      }
      
      if (session.status === 'in_progress') {
        console.log(`[MULTI-PANEL] Session ${sessionId} still in progress`);
        res.status(202).json({ 
          status: 'in_progress',
          message: 'Testing is still in progress. Please wait...'
        });
        return;
      }
      
      if (session.status === 'error') {
        console.log(`[MULTI-PANEL] Session ${sessionId} failed with error`);
        res.status(500).json({ 
          status: 'error',
          error: session.error
        });
        return;
      }
      
      console.log(`[MULTI-PANEL] Returning results for session: ${sessionId}`);
      res.json(session.results);
      
    } catch (error: any) {
      console.error('❌ [MULTI-PANEL] Get results error:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * Run multi-panel testing
   */
  private async runMultiPanelTesting(sessionId: string, config: any): Promise<void> {
    try {
      console.log(`\n🚀 [MULTI-PANEL] Starting testing for session: ${sessionId}`);
      
      // Wait a bit for SSE listeners to connect
      console.log(`⏳ [MULTI-PANEL] Waiting for listeners to connect...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send initial progress
      const initialListeners = this.progressListeners.get(sessionId) || [];
      console.log(`📡 [MULTI-PANEL] Initial listeners count: ${initialListeners.length}`);
      initialListeners.forEach(listener => {
        listener({
          phase: 'initializing',
          progress: 0,
          message: 'Initializing multi-panel testing...'
        });
      });
      
      // Create orchestrator
      const orchestrator = new MultiPanelOrchestrator(
        sessionId,
        config,
        (update) => {
          // Broadcast progress to all listeners
          const listeners = this.progressListeners.get(sessionId) || [];
          console.log(`📡 [MULTI-PANEL] Broadcasting update to ${listeners.length} listeners:`, update);
          listeners.forEach(listener => listener(update));
        }
      );
      
      // Execute testing
      console.log(`🚀 [MULTI-PANEL] Executing orchestrator for session: ${sessionId}`);
      const results = await orchestrator.execute();
      console.log(`✅ [MULTI-PANEL] Orchestrator execution completed for session: ${sessionId}`);
      
      // Store results
      this.sessions.set(sessionId, {
        status: 'completed',
        startTime: this.sessions.get(sessionId)?.startTime,
        endTime: Date.now(),
        results,
      });
      
      console.log(`✅ [MULTI-PANEL] Testing completed for session: ${sessionId}`);
      
      // Send completion event
      const listeners = this.progressListeners.get(sessionId) || [];
      listeners.forEach(listener => {
        listener({
          phase: 'completed',
          progress: 100,
          message: 'Multi-panel testing completed!',
        });
      });
      
      // Cleanup listeners after a delay
      setTimeout(() => {
        this.progressListeners.delete(sessionId);
      }, 60000); // 1 minute
      
    } catch (error: any) {
      console.error(`❌ [MULTI-PANEL] Testing failed for session ${sessionId}:`, error);
      
      this.sessions.set(sessionId, {
        status: 'error',
        error: error.message,
        stack: error.stack,
      });
      
      // Send error event
      const listeners = this.progressListeners.get(sessionId) || [];
      listeners.forEach(listener => {
        listener({
          phase: 'error',
          progress: 0,
          message: error.message,
        });
      });
    }
  }
}
