import { Model, DataTypes } from 'sequelize';
import sequelize from '../config';
import { TestCase } from './TestCase';
import { User } from './User';

export type HealingStrategy = 'FALLBACK' | 'SIMILARITY' | 'VISUAL' | 'HISTORICAL';

export class HealingEvent extends Model {
  declare id: number;
  declare testResultId: number;
  declare testCaseId: number;
  declare objectId: number | null;
  declare stepIndex: number;
  declare failedLocator: string;
  declare healedLocator: string;
  declare strategy: HealingStrategy;
  declare confidence: number;
  declare autoApplied: boolean;
  declare approved: boolean | null;
  declare approvedBy: number | null;
  declare approvedAt: Date | null;
  declare metadata: {
    failureReason?: string;
    domSnapshot?: string;
    screenshot?: string;
    executionTime?: number;
    retryCount?: number;
    [key: string]: any;
  };
  declare createdAt: Date;
  declare updatedAt: Date;
}

HealingEvent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    testResultId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'test_result_id',
    },
    testCaseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'test_case_id',
      references: {
        model: TestCase,
        key: 'id',
      },
    },
    objectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'object_id',
    },
    stepIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'step_index',
    },
    failedLocator: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'failed_locator',
    },
    healedLocator: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'healed_locator',
    },
    strategy: {
      type: DataTypes.ENUM('FALLBACK', 'SIMILARITY', 'VISUAL', 'HISTORICAL'),
      allowNull: false,
    },
    confidence: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue('confidence');
        return value ? parseFloat(value.toString()) : 0;
      },
    },
    autoApplied: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'auto_applied',
    },
    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'approved_by',
      references: {
        model: User,
        key: 'id',
      },
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approved_at',
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'healing_events',
    timestamps: true,
    underscored: true,
  }
);

// Relationships
HealingEvent.belongsTo(TestCase, { foreignKey: 'testCaseId' });
HealingEvent.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
TestCase.hasMany(HealingEvent, { foreignKey: 'testCaseId' });
