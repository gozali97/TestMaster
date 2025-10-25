import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { TestRun, TestCase, Project } from '../../database/models';
import { Op } from 'sequelize';
import sequelize from '../../database/config';

export class AnalyticsController {
  async getDashboardMetrics(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.query;
      const where: any = {};

      if (projectId) {
        where.projectId = projectId;
      }

      const [[totalTests]] = await sequelize.query(
        `SELECT COUNT(*) as count FROM test_cases 
         WHERE deleted_at IS NULL 
         ${projectId ? 'AND project_id = ?' : ''}`,
        { replacements: projectId ? [projectId] : [] }
      );

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [[executions]] = await sequelize.query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as passed,
          SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
          AVG(TIMESTAMPDIFF(SECOND, started_at, completed_at)) as avgDuration
         FROM test_runs 
         WHERE created_at >= ?
         ${projectId ? 'AND project_id = ?' : ''}`,
        { replacements: projectId ? [thirtyDaysAgo, projectId] : [thirtyDaysAgo] }
      ) as any;

      const passRate = (executions as any).total > 0 
        ? (((executions as any).passed / (executions as any).total) * 100).toFixed(1)
        : '0';

      res.json({
        success: true,
        data: {
          totalTests: (totalTests as any).count,
          totalExecutions: (executions as any).total || 0,
          passRate: parseFloat(passRate),
          avgExecutionTime: (executions as any).avgDuration ? Math.round((executions as any).avgDuration) : 0,
          passedTests: (executions as any).passed || 0,
          failedTests: (executions as any).failed || 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getExecutionTrends(req: AuthRequest, res: Response) {
    try {
      const { projectId, days = 30 } = req.query;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(days));

      const [trends] = await sequelize.query(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as passed,
          SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
          AVG(TIMESTAMPDIFF(SECOND, started_at, completed_at)) as avgDuration
         FROM test_runs 
         WHERE created_at >= ?
         ${projectId ? 'AND project_id = ?' : ''}
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        { replacements: projectId ? [startDate, projectId] : [startDate] }
      );

      res.json({ success: true, data: trends });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getTestCaseStats(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;

      const project = await Project.findOne({
        where: { id: projectId, organizationId: req.user.organizationId },
      });

      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      const [stats] = await sequelize.query(
        `SELECT 
          type,
          status,
          priority,
          COUNT(*) as count
         FROM test_cases 
         WHERE project_id = ? AND deleted_at IS NULL
         GROUP BY type, status, priority`,
        { replacements: [projectId] }
      );

      const [[typeDistribution]] = await sequelize.query(
        `SELECT 
          type,
          COUNT(*) as count
         FROM test_cases 
         WHERE project_id = ? AND deleted_at IS NULL
         GROUP BY type`,
        { replacements: [projectId] }
      );

      res.json({
        success: true,
        data: {
          stats,
          typeDistribution,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getFlakyTests(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const { threshold = 0.3 } = req.query;

      const [flakyTests] = await sequelize.query(
        `SELECT 
          tc.id,
          tc.name,
          COUNT(DISTINCT tr.id) as totalRuns,
          SUM(CASE WHEN tr.status = 'PASSED' THEN 1 ELSE 0 END) as passedRuns,
          SUM(CASE WHEN tr.status = 'FAILED' THEN 1 ELSE 0 END) as failedRuns,
          (SUM(CASE WHEN tr.status = 'FAILED' THEN 1 ELSE 0 END) / COUNT(DISTINCT tr.id)) as failureRate
         FROM test_cases tc
         INNER JOIN test_results tres ON tc.id = tres.test_case_id
         INNER JOIN test_runs tr ON tres.test_run_id = tr.id
         WHERE tc.project_id = ? AND tc.deleted_at IS NULL
         GROUP BY tc.id, tc.name
         HAVING failureRate > 0 AND failureRate < ?
         ORDER BY failureRate DESC
         LIMIT 20`,
        { replacements: [projectId, threshold] }
      );

      res.json({ success: true, data: flakyTests });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getExecutionTimeline(req: AuthRequest, res: Response) {
    try {
      const { runId } = req.params;

      const testRun = await TestRun.findByPk(runId, {
        include: [{ model: Project, where: { organizationId: req.user.organizationId } }],
      });

      if (!testRun) {
        return res.status(404).json({ success: false, error: 'Test run not found' });
      }

      const [timeline] = await sequelize.query(
        `SELECT 
          tres.id,
          tc.name as testName,
          tres.status,
          tres.duration,
          tres.started_at,
          tres.completed_at,
          tres.error_message
         FROM test_results tres
         INNER JOIN test_cases tc ON tres.test_case_id = tc.id
         WHERE tres.test_run_id = ?
         ORDER BY tres.started_at ASC`,
        { replacements: [runId] }
      );

      res.json({ success: true, data: timeline });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
