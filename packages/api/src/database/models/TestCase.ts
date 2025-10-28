import { Model, DataTypes } from 'sequelize';
import sequelize from '../config';
import { Project } from './Project';
import { User } from './User';

export class TestCase extends Model {
  declare id: number;
  declare projectId: number;
  declare name: string;
  declare description: string | null;
  declare type: 'WEB' | 'MOBILE' | 'API' | 'DESKTOP';
  declare steps: any[];
  declare dataBindings: Record<string, any>;
  declare tags: string[];
  declare priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  declare status: 'DRAFT' | 'ACTIVE' | 'DISABLED' | 'ARCHIVED';
  declare createdBy: number;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

TestCase.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Project,
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('WEB', 'MOBILE', 'API', 'DESKTOP'),
      defaultValue: 'WEB',
    },
    steps: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    dataBindings: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    priority: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
      defaultValue: 'MEDIUM',
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'DISABLED', 'ARCHIVED'),
      defaultValue: 'DRAFT',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'test_cases',
    timestamps: true,
    underscored: true,
    paranoid: true,
  }
);

TestCase.belongsTo(Project, { foreignKey: 'projectId' });
TestCase.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Project.hasMany(TestCase, { foreignKey: 'projectId' });
