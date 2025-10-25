import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AIService } from '../../services/ai/AIService';
import { TestCase } from '../../database/models';
import sequelize from '../../database/config';

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async generateTest(req: AuthRequest, res: Response) {
    try {
      const { description } = req.body;

      if (!description) {
        return res.status(400).json({ success: false, error: 'Description is required' });
      }

      const result = await this.aiService.generateTestFromDescription(description);

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json({
        success: true,
        data: {
          testCase: result.data,
          message: 'Test case generated successfully. Review and save if needed.'
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async suggestHealedLocator(req: AuthRequest, res: Response) {
    try {
      const { failedLocator, elementDescription, pageHtml } = req.body;

      const result = await this.aiService.suggestLocatorFix(
        failedLocator,
        elementDescription,
        pageHtml
      );

      if (!result.success) {
        return res.status(500).json(result);
      }

      // Store suggestion in database
      const { testResultId, objectId } = req.body;
      if (testResultId && objectId) {
        await sequelize.query(
          `INSERT INTO self_healing_logs 
           (test_result_id, object_id, old_locator, new_locator, healing_strategy, confidence, created_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          {
            replacements: [
              testResultId,
              objectId,
              JSON.stringify({ locator: failedLocator }),
              JSON.stringify(result.data.suggestions[0]),
              'AI-powered',
              result.data.suggestions[0].confidence
            ]
          }
        );
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async optimizeTest(req: AuthRequest, res: Response) {
    try {
      const { testId } = req.params;

      const testCase = await TestCase.findByPk(testId);
      if (!testCase) {
        return res.status(404).json({ success: false, error: 'Test case not found' });
      }

      const result = await this.aiService.optimizeTestCase(testCase.steps);

      if (!result.success) {
        return res.status(500).json(result);
      }

      // Store AI suggestion
      await sequelize.query(
        `INSERT INTO ai_suggestions 
         (test_case_id, suggestion_type, content, confidence_score, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        {
          replacements: [
            testId,
            'OPTIMIZATION',
            JSON.stringify(result.data),
            0.85
          ]
        }
      );

      res.json({
        success: true,
        data: result.data
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async identifyElementFromScreenshot(req: AuthRequest, res: Response) {
    try {
      const { screenshot, description } = req.body;

      if (!screenshot || !description) {
        return res.status(400).json({ 
          success: false, 
          error: 'Screenshot and description are required' 
        });
      }

      const result = await this.aiService.identifyElement(screenshot, description);

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAISuggestions(req: AuthRequest, res: Response) {
    try {
      const { testCaseId } = req.params;

      const [suggestions] = await sequelize.query(
        `SELECT * FROM ai_suggestions 
         WHERE test_case_id = ? 
         ORDER BY created_at DESC 
         LIMIT 10`,
        { replacements: [testCaseId] }
      );

      res.json({ success: true, data: suggestions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async applyAISuggestion(req: AuthRequest, res: Response) {
    try {
      const { suggestionId } = req.params;

      await sequelize.query(
        `UPDATE ai_suggestions 
         SET applied = TRUE, applied_at = NOW() 
         WHERE id = ?`,
        { replacements: [suggestionId] }
      );

      res.json({ success: true, message: 'Suggestion applied successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
