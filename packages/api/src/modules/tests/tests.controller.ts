import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { TestCase, Project } from '../../database/models';
import { Op } from 'sequelize';

export class TestsController {
  async create(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const { name, description, type, steps, tags, priority } = req.body;

      const project = await Project.findOne({
        where: { id: projectId, organizationId: req.user.organizationId },
      });

      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      const testCase = await TestCase.create({
        projectId,
        name,
        description,
        type: type || 'WEB',
        steps: steps || [],
        tags: tags || [],
        priority: priority || 'MEDIUM',
        status: 'ACTIVE',
        createdBy: req.user.id,
      });

      res.status(201).json({ success: true, data: testCase });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async list(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const { page = 1, limit = 20, search, type, status, priority } = req.query;

      const project = await Project.findOne({
        where: { id: projectId, organizationId: req.user.organizationId },
      });

      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      const offset = (Number(page) - 1) * Number(limit);
      const where: any = { projectId, deletedAt: null };

      if (search) {
        where.name = { [Op.like]: `%${search}%` };
      }
      if (type) where.type = type;
      if (status) where.status = status;
      if (priority) where.priority = priority;

      const { count, rows } = await TestCase.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['createdAt', 'desc']],
      });

      res.json({
        success: true,
        data: rows,
        meta: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit)),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { projectId, testId } = req.params;

      const testCase = await TestCase.findOne({
        where: { id: testId, projectId, deletedAt: null },
        include: [{ model: Project, where: { organizationId: req.user.organizationId } }],
      });

      if (!testCase) {
        return res.status(404).json({ success: false, error: 'Test case not found' });
      }

      res.json({ success: true, data: testCase });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { projectId, testId } = req.params;
      const updateData = req.body;

      const testCase = await TestCase.findOne({
        where: { id: testId, projectId, deletedAt: null },
        include: [{ model: Project, where: { organizationId: req.user.organizationId } }],
      });

      if (!testCase) {
        return res.status(404).json({ success: false, error: 'Test case not found' });
      }

      await testCase.update(updateData);
      res.json({ success: true, data: testCase });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { projectId, testId } = req.params;

      const testCase = await TestCase.findOne({
        where: { id: testId, projectId, deletedAt: null },
        include: [{ model: Project, where: { organizationId: req.user.organizationId } }],
      });

      if (!testCase) {
        return res.status(404).json({ success: false, error: 'Test case not found' });
      }

      await testCase.destroy();
      res.json({ success: true, message: 'Test case deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
