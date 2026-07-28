import { Evidence, User } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { sequelize } from '../config/database.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalEvidence = await Evidence.count();
    const verifiedEvidence = await Evidence.count({ where: { status: 'verified' } });
    const pendingEvidence = await Evidence.count({ where: { status: 'pending' } });
    const totalUsers = await User.count();

    res.json(formatResponse(true, {
      totalEvidence,
      verifiedEvidence,
      pendingEvidence,
      totalUsers
    }));
  } catch (error) {
    next(error);
  }
};

export const getTrends = async (req, res, next) => {
  try {
    // Mock trends for now
    res.json(formatResponse(true, [
      { date: '2023-10-01', count: 5 },
      { date: '2023-10-02', count: 8 },
    ]));
  } catch (error) {
    next(error);
  }
};

export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const breakdown = await Evidence.findAll({
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['category']
    });

    res.json(formatResponse(true, breakdown));
  } catch (error) {
    next(error);
  }
};

export const getActivityFeed = async (req, res, next) => {
  try {
    const activities = await Evidence.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [{ model: User, as: 'uploader', attributes: ['name'] }]
    });

    res.json(formatResponse(true, activities));
  } catch (error) {
    next(error);
  }
};
