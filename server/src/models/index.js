import { sequelize } from '../config/database.js';
import User from './User.js';
import Evidence from './Evidence.js';
import AuditLog from './AuditLog.js';

// Define associations
User.hasMany(Evidence, { foreignKey: 'uploadedBy', as: 'uploadedEvidences' });
Evidence.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

User.hasMany(Evidence, { foreignKey: 'verifiedBy', as: 'verifiedEvidences' });
Evidence.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  sequelize,
  User,
  Evidence,
  AuditLog
};
