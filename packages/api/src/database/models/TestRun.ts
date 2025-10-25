import { Model, DataTypes } from 'sequelize';
import sequelize from '../config';
import { Project } from './Project';
import { User } from './User';

export class TestRun extends Model {
  declare id: number;
  declare projectId: number;
  declare testSuiteId: number | null;
  declare environment: string;
  declare status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'STOPPED' | 'ERROR';
  declare startedAt: Date | null;
  declare completedAt: Date | null;
  declare triggeredBy: number;
  declare executionConfig: Record<string, any>;
  declare totalTests: number;
  declare passedTests: number;
  declare failedTests: number;
  declare skippedTests: number;
  declare logs: string[];
  declare screenshots: string[];
  declare video: string | null;
  declare errorMessage: string | null;
  declare errorStack: string | null;
  declare createdAt: Date;
}

TestRun.init(
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
    testSuiteId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    environment: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'RUNNING', 'PASSED', 'FAILED', 'STOPPED', 'ERROR'),
      defaultValue: 'PENDING',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    triggeredBy: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
    },
    executionConfig: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    totalTests: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    passedTests: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    failedTests: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    skippedTests: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    logs: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    screenshots: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    video: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    errorStack: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'test_runs',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  }
);

TestRun.belongsTo(Project, { foreignKey: 'projectId' });
TestRun.belongsTo(User, { foreignKey: 'triggeredBy', as: 'triggeredByUser' });
Project.hasMany(TestRun, { foreignKey: 'projectId' });
