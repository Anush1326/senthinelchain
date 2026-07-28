import { User } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(formatResponse(true, users));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json(formatResponse(false, null, 'User not found'));
    }
    
    res.json(formatResponse(true, user));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json(formatResponse(false, null, 'User not found'));
    }
    
    const { name, role, isActive } = req.body;
    
    if (name) user.name = name;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    
    await user.save();
    
    res.json(formatResponse(true, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json(formatResponse(false, null, 'User not found'));
    }
    
    await user.destroy();
    
    res.json(formatResponse(true, {}, 'User deleted'));
  } catch (error) {
    next(error);
  }
};
