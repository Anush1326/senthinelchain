// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SentinelChain
 * @notice Immutable digital evidence store on Polygon Amoy blockchain.
 * Stores SHA256 Hash, IPFS CID, Timestamp, Uploader Address, and Case ID.
 */
contract SentinelChain {
    address public owner;

    enum EvidenceStatus { Pending, Verified, Flagged, Rejected }

    struct Evidence {
        uint256 id;
        bytes32 fileHash;    // SHA256 Hash
        string ipfsHash;     // IPFS CID
        uint256 timestamp;   // Timestamp
        address uploader;    // Uploader address
        string caseId;       // Case ID
        string title;        // Evidence Title
        string category;     // Category / Type
        EvidenceStatus status;
        string[] custody;
        bool exists;
    }

    uint256 public evidenceCount;
    
    // Mappings
    mapping(uint256 => Evidence) public evidenceList;
    mapping(bytes32 => Evidence) public evidenceByHash;
    mapping(bytes32 => bool) public hashExists;
    mapping(address => bool) public authorizedVerifiers;

    // Events
    event EvidenceStored(
        uint256 indexed id,
        bytes32 indexed fileHash,
        string ipfsHash,
        address indexed uploader,
        string caseId,
        uint256 timestamp
    );
    event EvidenceVerified(uint256 indexed id, bytes32 indexed fileHash, address indexed verifier);
    event EvidenceStatusChanged(uint256 indexed id, EvidenceStatus status);
    event CustodyTransferred(uint256 indexed id, string note);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender] || msg.sender == owner, "Only authorized verifier can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedVerifiers[msg.sender] = true;
    }

    /**
     * @notice Store evidence on blockchain with SHA256 Hash, IPFS CID, Case ID, Title & Category
     */
    function storeEvidence(
        bytes32 _fileHash,
        string memory _ipfsHash,
        string memory _caseId,
        string memory _title,
        string memory _category
    ) public returns (uint256) {
        require(!hashExists[_fileHash], "Evidence SHA256 hash already exists on-chain");
        require(_fileHash != bytes32(0), "Invalid SHA256 hash");

        evidenceCount++;
        
        Evidence storage newEvidence = evidenceList[evidenceCount];
        newEvidence.id = evidenceCount;
        newEvidence.fileHash = _fileHash;
        newEvidence.ipfsHash = _ipfsHash;
        newEvidence.timestamp = block.timestamp;
        newEvidence.uploader = msg.sender;
        newEvidence.caseId = _caseId;
        newEvidence.title = bytes(_title).length > 0 ? _title : "Digital Evidence Item";
        newEvidence.category = bytes(_category).length > 0 ? _category : "document";
        newEvidence.status = EvidenceStatus.Verified;
        newEvidence.exists = true;
        newEvidence.custody.push(string(abi.encodePacked("Uploaded by ", toAsciiString(msg.sender), " for Case ", _caseId)));

        // Index by hash
        evidenceByHash[_fileHash] = newEvidence;
        hashExists[_fileHash] = true;

        emit EvidenceStored(
            evidenceCount,
            _fileHash,
            _ipfsHash,
            msg.sender,
            _caseId,
            block.timestamp
        );

        return evidenceCount;
    }

    /**
     * @notice Convenience overload for storeEvidence with mandatory fields (SHA256, IPFS CID, Case ID)
     */
    function storeEvidence(
        bytes32 _fileHash,
        string memory _ipfsHash,
        string memory _caseId
    ) public returns (uint256) {
        return storeEvidence(_fileHash, _ipfsHash, _caseId, "Digital Evidence Item", "document");
    }

    /**
     * @notice Backward compatible submitEvidence function
     */
    function submitEvidence(
        string memory _title,
        string memory _ipfsHash,
        bytes32 _fileHash,
        string memory _category
    ) public returns (uint256) {
        return storeEvidence(_fileHash, _ipfsHash, "SC-2026-00001", _title, _category);
    }

    /**
     * @notice Verify if an evidence SHA256 hash exists on blockchain and return details
     */
    function verifyEvidence(bytes32 _fileHash) public view returns (
        bool exists,
        address uploader,
        uint256 timestamp,
        string memory caseId,
        string memory ipfsHash
    ) {
        if (!hashExists[_fileHash]) {
            return (false, address(0), 0, "", "");
        }
        Evidence memory e = evidenceByHash[_fileHash];
        return (true, e.uploader, e.timestamp, e.caseId, e.ipfsHash);
    }

    /**
     * @notice Verify evidence by ID
     */
    function verifyEvidence(uint256 _id) public view returns (bool) {
        return _id > 0 && _id <= evidenceCount && evidenceList[_id].exists;
    }

    /**
     * @notice Retrieve evidence details by SHA256 hash
     */
    function getEvidence(bytes32 _fileHash) public view returns (
        uint256 id,
        bytes32 fileHash,
        string memory ipfsHash,
        uint256 timestamp,
        address uploader,
        string memory caseId,
        string memory title,
        string memory category,
        EvidenceStatus status
    ) {
        require(hashExists[_fileHash], "Evidence not found for this SHA256 hash");
        Evidence memory e = evidenceByHash[_fileHash];
        return (e.id, e.fileHash, e.ipfsHash, e.timestamp, e.uploader, e.caseId, e.title, e.category, e.status);
    }

    /**
     * @notice Retrieve evidence details by ID
     */
    function getEvidence(uint256 _id) public view returns (
        uint256 id,
        string memory title,
        string memory ipfsHash,
        bytes32 fileHash,
        address submitter,
        uint256 timestamp,
        EvidenceStatus status,
        string memory category,
        string[] memory custody
    ) {
        require(_id > 0 && _id <= evidenceCount, "Evidence ID does not exist");
        Evidence storage e = evidenceList[_id];
        return (e.id, e.title, e.ipfsHash, e.fileHash, e.uploader, e.timestamp, e.status, e.category, e.custody);
    }

    /**
     * @notice Check if hash exists
     */
    function verifyHash(bytes32 _fileHash) public view returns (bool) {
        return hashExists[_fileHash];
    }

    /**
     * @notice Get total evidence count stored
     */
    function getEvidenceCount() public view returns (uint256) {
        return evidenceCount;
    }

    /**
     * @dev Convert address to string hex representation
     */
    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);
        }
        return string(abi.encodePacked("0x", s));
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}
