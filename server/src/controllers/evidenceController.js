import { Evidence, AuditLog } from '../models/index.js';
import { generateHash, formatResponse, paginate } from '../utils/helpers.js';
import { submitEvidenceToChain } from '../utils/blockchain.js';
import { pinata } from '../config/pinata.js';
import fs from 'fs';
import path from 'path';

export const getEvidences = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query, parseInt(req.query.page) || 1, parseInt(req.query.limit) || 10);
    
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;

    const evidences = await Evidence.findAndCountAll({
      where: query,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json(formatResponse(true, {
      total: evidences.count,
      pages: Math.ceil(evidences.count / limit),
      currentPage: page,
      data: evidences.rows
    }));
  } catch (error) {
    next(error);
  }
};

export const getEvidenceById = async (req, res, next) => {
  try {
    const evidence = await Evidence.findByPk(req.params.id);
    if (!evidence) {
      return res.status(404).json(formatResponse(false, null, 'Evidence not found'));
    }
    res.json(formatResponse(true, evidence));
  } catch (error) {
    next(error);
  }
};

export const createEvidence = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(formatResponse(false, null, 'Please upload a file'));
    }

    const { title, description, category, tags } = req.body;
    
    // Generate file hash
    const filePath = req.file.path;
    const fileHash = await generateHash(filePath);

    // Upload to Pinata
    const stream = fs.createReadStream(filePath);
    const pinataRes = await pinata.upload.file(stream);
    
    const ipfsHash = pinataRes.IpfsHash;

    // Submit to Blockchain
    const tx = await submitEvidenceToChain(fileHash, ipfsHash, req.user.walletAddress || '0x0000000000000000000000000000000000000000');

    const evidence = await Evidence.create({
      title,
      description,
      category,
      fileHash,
      ipfsHash,
      transactionHash: tx.hash,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      originalFileName: req.file.originalname,
      tags: tags ? JSON.parse(tags) : [],
      uploadedBy: req.user.id,
      chainOfCustody: [{ action: 'uploaded', by: req.user.id, timestamp: new Date() }]
    });

    await AuditLog.create({
      action: 'create_evidence',
      entityType: 'Evidence',
      entityId: evidence.id,
      userId: req.user.id,
      details: { fileHash, ipfsHash }
    });

    res.status(201).json(formatResponse(true, evidence));
  } catch (error) {
    next(error);
  }
};

export const updateEvidence = async (req, res, next) => {
  try {
    const evidence = await Evidence.findByPk(req.params.id);
    if (!evidence) {
      return res.status(404).json(formatResponse(false, null, 'Evidence not found'));
    }

    const { title, description, tags, status } = req.body;

    if (title) evidence.title = title;
    if (description) evidence.description = description;
    if (tags) evidence.tags = tags;
    if (status) evidence.status = status;

    await evidence.save();

    await AuditLog.create({
      action: 'update_evidence',
      entityType: 'Evidence',
      entityId: evidence.id,
      userId: req.user.id,
      details: { updates: req.body }
    });

    res.json(formatResponse(true, evidence));
  } catch (error) {
    next(error);
  }
};

export const deleteEvidence = async (req, res, next) => {
  try {
    const evidence = await Evidence.findByPk(req.params.id);
    if (!evidence) {
      return res.status(404).json(formatResponse(false, null, 'Evidence not found'));
    }

    await evidence.destroy();

    await AuditLog.create({
      action: 'delete_evidence',
      entityType: 'Evidence',
      entityId: req.params.id,
      userId: req.user.id,
      details: { title: evidence.title }
    });

    res.json(formatResponse(true, {}, 'Evidence deleted'));
  } catch (error) {
    next(error);
  }
};

export const verifyEvidence = async (req, res, next) => {
  try {
    const evidence = await Evidence.findByPk(req.params.id);
    if (!evidence) {
      return res.status(404).json(formatResponse(false, null, 'Evidence not found'));
    }

    evidence.status = req.body.status || 'verified';
    evidence.verifiedBy = req.user.id;
    
    const newCustody = [...evidence.chainOfCustody, { action: 'verified', by: req.user.id, timestamp: new Date(), status: evidence.status }];
    evidence.chainOfCustody = newCustody;

    await evidence.save();

    res.json(formatResponse(true, evidence));
  } catch (error) {
    next(error);
  }
};

export const getChainOfCustody = async (req, res, next) => {
  try {
    const evidence = await Evidence.findByPk(req.params.id, {
      attributes: ['id', 'chainOfCustody']
    });
    if (!evidence) {
      return res.status(404).json(formatResponse(false, null, 'Evidence not found'));
    }
    res.json(formatResponse(true, evidence.chainOfCustody));
  } catch (error) {
    next(error);
  }
};
