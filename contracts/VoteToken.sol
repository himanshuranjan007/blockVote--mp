// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VoteToken (VOTE)
 * @notice ERC-20 governance token used for decentralized voting.
 *         1 VOTE token = 1 vote. Tokens are minted by the admin
 *         and distributed to eligible voters.
 */
contract VoteToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10 ** 18; // 1 million tokens max
    
    // Track registered voters
    mapping(address => bool) public registeredVoters;
    address[] public voterList;
    
    // Events
    event VoterRegistered(address indexed voter, uint256 tokensGranted);
    event TokensBurned(address indexed voter, uint256 amount);

    constructor() ERC20("VoteToken", "VOTE") Ownable(msg.sender) {
        // Mint initial supply to the deployer (admin/election commission)
        _mint(msg.sender, 100_000 * 10 ** 18);
    }

    /**
     * @notice Register a voter and grant them voting tokens
     * @param voter Address of the voter to register
     * @param amount Number of tokens to grant (in wei)
     */
    function registerVoter(address voter, uint256 amount) external onlyOwner {
        require(!registeredVoters[voter], "Voter already registered");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        require(voter != address(0), "Invalid voter address");
        
        registeredVoters[voter] = true;
        voterList.push(voter);
        _mint(voter, amount);
        
        emit VoterRegistered(voter, amount);
    }

    /**
     * @notice Batch register multiple voters
     * @param voters Array of voter addresses
     * @param amount Tokens to grant each voter
     */
    function batchRegisterVoters(address[] calldata voters, uint256 amount) external onlyOwner {
        for (uint256 i = 0; i < voters.length; i++) {
            if (!registeredVoters[voters[i]] && voters[i] != address(0)) {
                require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
                registeredVoters[voters[i]] = true;
                voterList.push(voters[i]);
                _mint(voters[i], amount);
                emit VoterRegistered(voters[i], amount);
            }
        }
    }

    /**
     * @notice Mint additional tokens (only owner)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens (used after voting to prevent double-voting)
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @notice Get total number of registered voters
     */
    function getVoterCount() external view returns (uint256) {
        return voterList.length;
    }

    /**
     * @notice Check if an address is a registered voter
     */
    function isRegisteredVoter(address voter) external view returns (bool) {
        return registeredVoters[voter];
    }
}
