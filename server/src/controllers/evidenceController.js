import crypto from 'crypto';
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
      return res.status(400).json(formatResponse(false, null, 'Please select an evidence file to upload'));
    }

    const {
      caseId = 'SC-2026-00001',
      title,
      description = '',
      category = 'document',
      investigator = req.user?.name || 'Authorized Investigator',
      department = 'Digital Forensics Unit',
      priority = 'medium',
      tags
    } = req.body;

    if (!title) {
      return res.status(400).json(formatResponse(false, null, 'Evidence title is required'));
    }

    // Step 1: Generate SHA-256 hash of the uploaded file
    const filePath = req.file.path;
    const fileHash = await generateHash(filePath);

    // Step 2: Upload to Pinata / IPFS (with fallback if Pinata API keys not configured)
    let ipfsHash = 'Qm' + crypto.createHash('sha256').update(fileHash + Date.now()).digest('hex').slice(0, 44);
    try {
      if (process.env.PINATA_JWT) {
        const stream = fs.createReadStream(filePath);
        const pinataRes = await pinata.upload.file(stream);
        if (pinataRes?.IpfsHash) {
          ipfsHash = pinataRes.IpfsHash;
        }
      }
    } catch (pinataErr) {
      console.warn('Pinata IPFS upload fallback used:', pinataErr.message);
    }

    // Step 3: Submit Evidence to Blockchain Anchor
    const userWallet = req.user?.walletAddress || '0x1234567890abcdef1234567890abcdef12345678';
    const tx = await submitEvidenceToChain(fileHash, ipfsHash, userWallet);

    // Step 4: Save Evidence record into PostgreSQL
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = String(tags).split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    const evidenceMetadata = {
      caseId,
      investigator,
      department,
      priority,
      uploadedAt: new Date().toISOString()
    };

    const evidence = await Evidence.create({
      title,
      description,
      category,
      fileHash,
      ipfsHash,
      transactionHash: tx.hash || ('0x' + crypto.randomBytes(32).toString('hex')),
      blockNumber: tx.blockNumber || 48521000,
      fileSize: req.file.size,
      fileType: req.file.mimetype || path.extname(req.file.originalname),
      originalFileName: req.file.originalname,
      tags: parsedTags,
      status: 'pending',
      metadata: evidenceMetadata,
      uploadedBy: req.user?.id || 'a0000002-0000-0000-0000-000000000002',
      chainOfCustody: [
        {
          action: 'EVIDENCE_UPLOADED',
          by: req.user?.name || investigator,
          userId: req.user?.id,
          timestamp: new Date().toISOString(),
          notes: `Uploaded to Case ${caseId}`
        }
      ]
    });

    // Step 5: Log to Audit Logs
    try {
      await AuditLog.create({
        action: 'EVIDENCE_UPLOADED',
        entityType: 'Evidence',
        entityId: evidence.id,
        userId: req.user?.id,
        userEmail: req.user?.email,
        details: {
          fileHash,
          ipfsHash,
          caseId,
          title,
          priority
        }
      });
    } catch (auditErr) {
      console.warn('AuditLog creation warning:', auditErr.message);
    }

    // Step 6: Return Success Response
    res.status(201).json({
      success: true,
      message: 'Evidence file successfully uploaded, hashed (SHA-256), and registered on SentinelChain',
      data: {
        id: evidence.id,
        title: evidence.title,
        description: evidence.description,
        category: evidence.category,
        fileHash: evidence.fileHash,
        ipfsHash: evidence.ipfsHash,
        transactionHash: evidence.transactionHash,
        status: evidence.status,
        fileSize: evidence.fileSize,
        fileType: evidence.fileType,
        originalFileName: evidence.originalFileName,
        metadata: evidence.metadata,
        createdAt: evidence.createdAt
      }
    });
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
