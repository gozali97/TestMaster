import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { Project } from '../../database/models';
import { Op } from 'sequelize';

export class ProjectsController {
  async create(req: AuthRequest, res: Response) {
    try {
      const { name, description, settings } = req.body;
      
      const project = await Project.create({
        name,
        description,
        organizationId: req.user.organizationId,
        settings: settings || {},
        createdBy: req.user.id,
      });

      res.status(201).json({ success: true, data: project });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async list(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);
      const where: any = {
        organizationId: req.user.organizationId,
        deletedAt: null,
      };

      if (search) {
        where.name = { [Op.like]: `%${search}%` };
      }

      const { count, rows } = await Project.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [[sortBy as string, sortOrder as string]],
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
      const { id } = req.params;
      
      const project = await Project.findOne({
        where: {
          id,
          organizationId: req.user.organizationId,
          deletedAt: null,
        },
      });

      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      res.json({ success: true, data: project });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, settings } = req.body;

      const project = await Project.findOne({
        where: {
          id,
          organizationId: req.user.organizationId,
          deletedAt: null,
        },
      });

      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      await project.update({ name, description, settings });
      res.json({ success: true, data: project });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const project = await Project.findOne({
        where: {
          id,
          organizationId: req.user.organizationId,
          deletedAt: null,
        },
      });

      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      await project.destroy();
      res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
