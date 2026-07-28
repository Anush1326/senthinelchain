// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SentinelChain {
    address public owner;
    
    enum EvidenceStatus { Pending, Verified, Flagged, Rejected }
    
    struct Evidence {
        uint256 id;
        string title;
        string ipfsHash;
        bytes32 fileHash;
        address submitter;
        uint256 timestamp;
        EvidenceStatus status;
        string category;
        string[] custody;
    }
    
    uint256 public evidenceCount;
    mapping(uint256 => Evidence) public evidenceList;
    mapping(bytes32 => bool) public hashExists;
    mapping(address => bool) public authorizedVerifiers;
    
    event EvidenceSubmitted(uint256 indexed id, address indexed submitter, bytes32 fileHash);
    event EvidenceVerified(uint256 indexed id, address indexed verifier);
    event EvidenceStatusChanged(uint256 indexed id, EvidenceStatus status);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);
    event CustodyTransferred(uint256 indexed id, string note);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender] || msg.sender == owner, "Only authorized verifier can perform this action");
        _;
    }
    
    modifier evidenceExists(uint256 _id) {
        require(_id > 0 && _id <= evidenceCount, "Evidence does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedVerifiers[msg.sender] = true;
    }
    
    function submitEvidence(
        string memory _title,
        string memory _ipfsHash,
        bytes32 _fileHash,
        string memory _category
    ) public returns (uint256) {
        require(!hashExists[_fileHash], "Evidence hash already exists");
        
        evidenceCount++;
        Evidence storage newEvidence = evidenceList[evidenceCount];
        newEvidence.id = evidenceCount;
        newEvidence.title = _title;
        newEvidence.ipfsHash = _ipfsHash;
        newEvidence.fileHash = _fileHash;
        newEvidence.submitter = msg.sender;
        newEvidence.timestamp = block.timestamp;
        newEvidence.status = EvidenceStatus.Pending;
        newEvidence.category = _category;
        newEvidence.custody.push(string(abi.encodePacked("Submitted by ", toAsciiString(msg.sender))));
        
        hashExists[_fileHash] = true;
        
        emit EvidenceSubmitted(evidenceCount, msg.sender, _fileHash);
        return evidenceCount;
    }
    
    function verifyEvidence(uint256 _id) public onlyVerifier evidenceExists(_id) {
        Evidence storage evidence = evidenceList[_id];
        require(evidence.status == EvidenceStatus.Pending, "Evidence is not pending");
        
        evidence.status = EvidenceStatus.Verified;
        evidence.custody.push(string(abi.encodePacked("Verified by ", toAsciiString(msg.sender))));
        
        emit EvidenceVerified(_id, msg.sender);
        emit EvidenceStatusChanged(_id, EvidenceStatus.Verified);
    }
    
    function updateStatus(uint256 _id, EvidenceStatus _newStatus) public onlyVerifier evidenceExists(_id) {
        Evidence storage evidence = evidenceList[_id];
        evidence.status = _newStatus;
        emit EvidenceStatusChanged(_id, _newStatus);
    }
    
    function transferCustody(uint256 _id, string memory _note) public evidenceExists(_id) {
        Evidence storage evidence = evidenceList[_id];
        evidence.custody.push(_note);
        emit CustodyTransferred(_id, _note);
    }
    
    function getEvidence(uint256 _id) public view evidenceExists(_id) returns (
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
        Evidence storage e = evidenceList[_id];
        return (e.id, e.title, e.ipfsHash, e.fileHash, e.submitter, e.timestamp, e.status, e.category, e.custody);
    }
    
    function verifyHash(bytes32 _fileHash) public view returns (bool) {
        return hashExists[_fileHash];
    }
    
    function addVerifier(address _verifier) public onlyOwner {
        require(!authorizedVerifiers[_verifier], "Address is already a verifier");
        authorizedVerifiers[_verifier] = true;
        emit VerifierAdded(_verifier);
    }
    
    function removeVerifier(address _verifier) public onlyOwner {
        require(authorizedVerifiers[_verifier], "Address is not a verifier");
        require(_verifier != owner, "Cannot remove owner from verifiers");
        authorizedVerifiers[_verifier] = false;
        emit VerifierRemoved(_verifier);
    }
    
    function getEvidenceCount() public view returns (uint256) {
        return evidenceCount;
    }
    
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
