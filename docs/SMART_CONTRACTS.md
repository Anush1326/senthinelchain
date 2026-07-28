# Smart Contracts Documentation

## Contract Overview
The `SentinelEvidence` smart contract is designed to anchor evidence metadata to the blockchain. It stores the cryptographic hash of the file, the IPFS CID, and the user who uploaded it. This ensures immutability and verifiable proof of existence at a specific point in time.

## Function Reference

### `anchorEvidence(string memory fileHash, string memory ipfsHash)`
Anchors a new piece of evidence to the blockchain.
*   **Modifiers:** `onlyRegisteredUser`
*   **Parameters:**
    *   `fileHash`: The SHA-256 hash of the evidence file.
    *   `ipfsHash`: The IPFS Content Identifier (CID).

### `verifyEvidence(string memory fileHash)`
Returns the anchoring details for a given file hash.
*   **Returns:** `(address uploader, string ipfsHash, uint256 timestamp)`

## Events Reference
*   `EvidenceAnchored(address indexed uploader, string fileHash, string ipfsHash, uint256 timestamp)`: Emitted when evidence is successfully anchored.

## Deployment Guide for Polygon Amoy
1.  Configure `hardhat.config.js` with Polygon Amoy RPC URL and your private key.
2.  Run the deployment script:
    ```bash
    npx hardhat run scripts/deploy.js --network amoy
    ```
3.  Save the deployed contract address.

## Gas Estimates
*   `anchorEvidence`: ~85,000 gas
*   `verifyEvidence`: ~25,000 gas (view function, usually free)

## Security Considerations
*   The contract only stores hashes, not the actual data, ensuring privacy compliance.
*   Only authorized roles (managed via a separate RoleManager contract or backend logic) should be able to anchor evidence.
