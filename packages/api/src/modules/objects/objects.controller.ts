import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { Project } from '../../database/models';
import sequelize from '../../database/config';

export class ObjectsController {
  async create(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const { name, type, locators, properties, tags, parentId } = req.body;

      const project = await Project.findOne({
        where: { id: projectId, organizationId: req.user.organizationId },
      });

      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      const [result] = await sequelize.query(
        `INSERT INTO test_objects (project_id, name, type, locators, properties, tags, parent_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            projectId,
            name,
            type || 'WEB_ELEMENT',
            JSON.stringify(locators || []),
            JSON.stringify(properties || {}),
            JSON.stringify(tags || []),
            parentId || null,
          ],
        }
      );

      res.status(201).json({
        success: true,
        data: { id: (result as any).insertId, name, type, locators, properties, tags },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async list(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const { search, type } = req.query;

      const project = await Project.findOne({
        where: { id: projectId, organizationId: req.user.organizationId },
      });

      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      let whereClause = 'WHERE project_id = ?';
      const replacements: any[] = [projectId];

      if (search) {
        whereClause += ' AND name LIKE ?';
        replacements.push(`%${search}%`);
      }

      if (type) {
        whereClause += ' AND type = ?';
        replacements.push(type);
      }

      const [objects] = await sequelize.query(
        `SELECT * FROM test_objects ${whereClause} ORDER BY created_at DESC`,
        { replacements }
      );

      res.json({ success: true, data: objects });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { projectId, objectId } = req.params;

      const project = await Project.findOne({
        where: { id: projectId, organizationId: req.user.organizationId },
      });

      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      const [[object]] = await sequelize.query(
        'SELECT * FROM test_objects WHERE id = ? AND project_id = ?',
        { replacements: [objectId, projectId] }
      );

      if (!object) {
        return res.status(404).json({ success: false, error: 'Object not found' });
      }

      res.json({ success: true, data: object });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { projectId, objectId } = req.params;
      const { name, type, locators, properties, tags } = req.body;

      const project = await Project.findOne({
        where: { id: projectId, organizationId: req.user.organizationId },
      });

      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      await sequelize.query(
        `UPDATE test_objects 
         SET name = ?, type = ?, locators = ?, properties = ?, tags = ?, updated_at = NOW()
         WHERE id = ? AND project_id = ?`,
        {
          replacements: [
            name,
            type,
            JSON.stringify(locators),
            JSON.stringify(properties),
            JSON.stringify(tags),
            objectId,
            projectId,
          ],
        }
      );

      res.json({ success: true, message: 'Object updated successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { projectId, objectId } = req.params;

      const project = await Project.findOne({
        where: { id: projectId, organizationId: req.user.organizationId },
      });

      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      await sequelize.query('DELETE FROM test_objects WHERE id = ? AND project_id = ?', {
        replacements: [objectId, projectId],
      });

      res.json({ success: true, message: 'Object deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
