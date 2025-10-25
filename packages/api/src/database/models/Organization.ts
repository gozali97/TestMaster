import { Model, DataTypes } from 'sequelize';
import sequelize from '../config';

export class Organization extends Model {
  declare id: number;
  declare name: string;
  declare plan: 'FREE' | 'PROFESSIONAL' | 'ENTERPRISE';
  declare settings: Record<string, any>;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Organization.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    plan: {
      type: DataTypes.ENUM('FREE', 'PROFESSIONAL', 'ENTERPRISE'),
      defaultValue: 'FREE',
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'organizations',
    timestamps: true,
    underscored: true,
  }
);
