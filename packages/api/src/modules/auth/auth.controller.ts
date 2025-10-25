import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Organization } from '../../database/models';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, organizationName } = req.body;

      console.log('Register request body:', { email, name, hasPassword: !!password, organizationName });

      if (!email || !password || !name) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email, password, and name are required' 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          success: false, 
          error: 'Password must be at least 6 characters' 
        });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email already exists' });
      }

      // Generate organization name with extra safety check
      let orgName: string;
      
      if (organizationName && organizationName.trim() !== '') {
        orgName = organizationName.trim();
      } else if (name && name.trim() !== '') {
        orgName = `${name.trim()}'s Organization`;
      } else {
        orgName = 'My Organization';
      }
      
      console.log('Creating organization with name:', orgName);
      
      // Ensure orgName is not null or empty
      if (!orgName || orgName === '') {
        throw new Error('Organization name cannot be empty');
      }
      
      const organization = await Organization.create({
        name: orgName,
        plan: 'FREE',
      });
      
      console.log('Organization created successfully:', organization.id, organization.name);

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({
        email,
        passwordHash,
        name,
        role: 'ORG_ADMIN',
        organizationId: organization.id,
      });

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId,
          },
          tokens: { accessToken, refreshToken },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId,
          },
          tokens: { accessToken, refreshToken },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ success: false, error: 'Refresh token required' });
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || 'refresh-secret'
      ) as any;

      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '15m' }
      );

      res.json({
        success: true,
        data: { accessToken },
      });
    } catch (error: any) {
      res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
  }
}
