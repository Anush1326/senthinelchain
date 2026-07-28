import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class Evidence extends Model {}

Evidence.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  category: {
    type: DataTypes.ENUM('document', 'image', 'video', 'audio', 'digital'),
    defaultValue: 'document',
  },
  fileHash: {
    type: DataTypes.STRING, // SHA-256
    allowNull: false,
  },
  ipfsHash: {
    type: DataTypes.STRING,
  },
  transactionHash: {
    type: DataTypes.STRING,
  },
  blockNumber: {
    type: DataTypes.INTEGER,
  },
  contractEvidenceId: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'flagged', 'rejected'),
    defaultValue: 'pending',
  },
  fileSize: {
    type: DataTypes.INTEGER,
  },
  fileType: {
    type: DataTypes.STRING,
  },
  originalFileName: {
    type: DataTypes.STRING,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  verifiedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  aiAnalysis: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  chainOfCustody: {
    type: DataTypes.JSONB,
    defaultValue: [], // Array of objects
  }
}, {
  sequelize,
  modelName: 'Evidence',
});

export default Evidence;
