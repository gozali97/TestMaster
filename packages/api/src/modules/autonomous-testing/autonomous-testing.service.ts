import { AutonomousTestingOrchestrator, AutonomousTestingConfig, AutonomousTestingResult, ProgressUpdate } from '@testmaster/test-engine';
import { v4 as uuidv4 } from 'uuid';

type ProgressCallback = (update: ProgressUpdate) => void;

export class AutonomousTestingService {
  private static instance: AutonomousTestingService;
  
  private sessions = new Map<string, {
    orchestrator: AutonomousTestingOrchestrator;
    result?: AutonomousTestingResult;
    progressCallbacks: ProgressCallback[];
  }>();

  private constructor() {}

  static getInstance(): AutonomousTestingService {
    if (!AutonomousTestingService.instance) {
      AutonomousTestingService.instance = new AutonomousTestingService();
    }
    return AutonomousTestingService.instance;
  }

  /**
   * Start autonomous testing
   */
  async startAutonomousTesting(config: AutonomousTestingConfig): Promise<string> {
    console.log('\n========================================');
    console.log('🤖 [SERVICE] startAutonomousTesting called');
    console.log('========================================');
    
    const sessionId = uuidv4();
    console.log(`🆔 [SERVICE] Generated session ID: ${sessionId}`);

    console.log(`\n🤖 Starting Autonomous Testing Session: ${sessionId}\n`);
    console.log('Configuration:', JSON.stringify(config, null, 2));

    // Create orchestrator
    console.log('🛠️  [SERVICE] Creating AutonomousTestingOrchestrator...');
    try {
      const orchestrator = new AutonomousTestingOrchestrator(
        sessionId,
        (progress: ProgressUpdate) => {
          console.log('📢 [SERVICE] Progress callback:', progress);
          this.notifyProgress(sessionId, progress);
        }
      );
      console.log('✅ [SERVICE] Orchestrator created successfully');

      // Store session
      console.log('💾 [SERVICE] Storing session in map...');
      this.sessions.set(sessionId, {
        orchestrator,
        progressCallbacks: [],
      });
      console.log('✅ [SERVICE] Session stored. Total sessions:', this.sessions.size);

      // Run autonomous testing (async, don't await)
      console.log('🚀 [SERVICE] Starting background testing...');
      this.runTesting(sessionId, orchestrator, config);
      console.log('✅ [SERVICE] Background testing initiated');

      console.log('📤 [SERVICE] Returning sessionId:', sessionId);
      console.log('========================================\n');
      return sessionId;
    } catch (error: any) {
      console.error('\n❌❌❌ [SERVICE] Failed to create orchestrator ❌❌❌');
      console.error('Error Type:', error.constructor.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      console.error('========================================\n');
      throw error;
    }
  }

  /**
   * Run testing in background
   */
  private async runTesting(
    sessionId: string,
    orchestrator: AutonomousTestingOrchestrator,
    config: AutonomousTestingConfig
  ): Promise<void> {
    console.log(`\n🏃 [BACKGROUND] Starting testing for session: ${sessionId}`);
    try {
      console.log('🖼️ [BACKGROUND] Calling orchestrator.runAutonomousTesting...');
      const result = await orchestrator.runAutonomousTesting(config);
      console.log('✅ [BACKGROUND] Orchestrator completed successfully');

      // Store result
      console.log('💾 [BACKGROUND] Storing result...');
      const session = this.sessions.get(sessionId);
      if (session) {
        session.result = result;
        console.log('✅ [BACKGROUND] Result stored in session');
      } else {
        console.error('❌ [BACKGROUND] Session not found when storing result!');
      }

      console.log(`\n✅ Session ${sessionId} completed successfully\n`);

    } catch (error: any) {
      console.error(`\n❌❌❌ [BACKGROUND] Session ${sessionId} failed ❌❌❌`);
      console.error('Error Type:', error.constructor.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);

      // Notify error
      console.log('📢 [BACKGROUND] Notifying error to callbacks...');
      this.notifyProgress(sessionId, {
        phase: 'error',
        progress: 0,
        message: error.message,
      });
    }
  }

  /**
   * Subscribe to progress updates
   */
  subscribeToProgress(sessionId: string, callback: ProgressCallback): () => void {
    console.log(`\n🔔 [SUBSCRIBE] New subscription for session: ${sessionId}`);
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      console.error('❌ [SUBSCRIBE] Session not found:', sessionId);
      console.error('Available sessions:', Array.from(this.sessions.keys()));
      callback({
        phase: 'error',
        progress: 0,
        message: 'Session not found',
      });
      return () => {};
    }
    console.log('✅ [SUBSCRIBE] Session found, adding callback');

    session.progressCallbacks.push(callback);
    console.log(`✅ [SUBSCRIBE] Callback added. Total callbacks: ${session.progressCallbacks.length}`);

    // Return unsubscribe function
    return () => {
      console.log(`\n🔕 [UNSUBSCRIBE] Removing callback for session: ${sessionId}`);
      const index = session.progressCallbacks.indexOf(callback);
      if (index > -1) {
        session.progressCallbacks.splice(index, 1);
        console.log(`✅ [UNSUBSCRIBE] Callback removed. Remaining: ${session.progressCallbacks.length}`);
      }
    };
  }

  /**
   * Notify all progress callbacks
   */
  private notifyProgress(sessionId: string, update: ProgressUpdate): void {
    console.log(`\n📢 [NOTIFY] Notifying progress for session: ${sessionId}`);
    console.log('Update:', JSON.stringify(update, null, 2));
    
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      console.error('❌ [NOTIFY] Session not found:', sessionId);
      return;
    }
    
    console.log(`📢 [NOTIFY] Notifying ${session.progressCallbacks.length} callbacks`);
    if (session) {
      for (const callback of session.progressCallbacks) {
        try {
          callback(update);
          console.log('✅ [NOTIFY] Callback executed successfully');
        } catch (error) {
          console.error('❌ [NOTIFY] Error in progress callback:', error);
        }
      }
    }
  }

  /**
   * Get results
   */
  async getResults(sessionId: string): Promise<AutonomousTestingResult | null> {
    console.log(`\n📊 [GET_RESULTS] Request for session: ${sessionId}`);
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error('❌ [GET_RESULTS] Session not found:', sessionId);
      return null;
    }
    console.log(`✅ [GET_RESULTS] Session found. Has result: ${!!session.result}`);
    return session?.result || null;
  }

  /**
   * List all sessions
   */
  async listSessions(): Promise<Array<{ id: string; hasResult: boolean }>> {
    console.log(`\n📋 [LIST_SESSIONS] Listing all sessions`);
    const sessions: Array<{ id: string; hasResult: boolean }> = [];

    for (const [id, session] of this.sessions.entries()) {
      sessions.push({
        id,
        hasResult: !!session.result,
      });
    }

    console.log(`✅ [LIST_SESSIONS] Found ${sessions.length} sessions`);
    return sessions;
  }

  /**
   * Cleanup old sessions
   */
  cleanup(olderThanHours: number = 24): void {
    console.log(`\n🧹 [CLEANUP] Cleaning up sessions older than ${olderThanHours} hours`);
    // In production, would check timestamps and remove old sessions
    // For now, just log
    console.log(`🧹 [CLEANUP] Would remove sessions older than ${olderThanHours} hours`);
  }
}
