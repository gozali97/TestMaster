import { Model, DataTypes } from 'sequelize';
import sequelize from '../config';
import { Organization } from './Organization';

export class User extends Model {
  declare id: number;
  declare email: string;
  declare passwordHash: string;
  declare name: string;
  declare role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'TESTER' | 'VIEWER';
  declare organizationId: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('SUPER_ADMIN', 'ORG_ADMIN', 'TESTER', 'VIEWER'),
      defaultValue: 'TESTER',
    },
    organizationId: {
      type: DataTypes.INTEGER,
      references: {
        model: Organization,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

User.belongsTo(Organization, { foreignKey: 'organizationId' });
Organization.hasMany(User, { foreignKey: 'organizationId' });
