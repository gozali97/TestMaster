import { Model, DataTypes } from 'sequelize';
import sequelize from '../config';
import { Organization } from './Organization';
import { User } from './User';

export class Project extends Model {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare organizationId: number;
  declare settings: Record<string, any>;
  declare createdBy: number;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

Project.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Organization,
        key: 'id',
      },
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {},
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
    tableName: 'projects',
    timestamps: true,
    underscored: true,
    paranoid: true,
  }
);

Project.belongsTo(Organization, { foreignKey: 'organizationId' });
Project.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Organization.hasMany(Project, { foreignKey: 'organizationId' });
