// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./VoteToken.sol";

/**
 * @title VotingSystem
 * @notice Decentralized voting system powered by VOTE tokens.
 *         Supports multiple elections with candidates, token-weighted
 *         voting, and transparent on-chain results.
 */
contract VotingSystem is Ownable {
    VoteToken public voteToken;

    // Election status enum
    enum ElectionStatus { Pending, Active, Ended }

    // Candidate struct
    struct Candidate {
        uint256 id;
        string name;
        string description;
        uint256 voteCount;
    }

    // Election struct
    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        ElectionStatus status;
        uint256 candidateCount;
        uint256 totalVotesCast;
        uint256 totalTokensUsed;
        address creator;
    }

    // State variables
    uint256 public electionCount;
    uint256 public tokensPerVote = 1 * 10 ** 18; // 1 token = 1 vote

    // Mappings
    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public voterChoice;
    mapping(uint256 => mapping(address => uint256)) public voterTokensUsed;

    // Events
    event ElectionCreated(uint256 indexed electionId, string title, uint256 startTime, uint256 endTime);
    event CandidateAdded(uint256 indexed electionId, uint256 candidateId, string name);
    event VoteCast(uint256 indexed electionId, address indexed voter, uint256 candidateId, uint256 tokensUsed);
    event ElectionStatusChanged(uint256 indexed electionId, ElectionStatus newStatus);
    event TokensPerVoteUpdated(uint256 newAmount);

    constructor(address _voteToken) Ownable(msg.sender) {
        voteToken = VoteToken(_voteToken);
    }

    // ========================
    // Election Management
    // ========================

    /**
     * @notice Create a new election
     * @param _title Election title
     * @param _description Election description
     * @param _startTime Unix timestamp for election start
     * @param _endTime Unix timestamp for election end
     */
    function createElection(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner returns (uint256) {
        require(_startTime < _endTime, "Invalid time range");
        require(_startTime >= block.timestamp, "Start time must be in the future");

        electionCount++;
        uint256 electionId = electionCount;

        elections[electionId] = Election({
            id: electionId,
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            status: ElectionStatus.Pending,
            candidateCount: 0,
            totalVotesCast: 0,
            totalTokensUsed: 0,
            creator: msg.sender
        });

        emit ElectionCreated(electionId, _title, _startTime, _endTime);
        return electionId;
    }

    /**
     * @notice Add candidate to an election
     * @param _electionId Election ID
     * @param _name Candidate name
     * @param _description Candidate description/platform
     */
    function addCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _description
    ) external onlyOwner {
        Election storage election = elections[_electionId];
        require(election.id != 0, "Election does not exist");
        require(election.status == ElectionStatus.Pending, "Election already started");

        election.candidateCount++;
        uint256 candidateId = election.candidateCount;

        candidates[_electionId][candidateId] = Candidate({
            id: candidateId,
            name: _name,
            description: _description,
            voteCount: 0
        });

        emit CandidateAdded(_electionId, candidateId, _name);
    }

    /**
     * @notice Start an election
     */
    function startElection(uint256 _electionId) external onlyOwner {
        Election storage election = elections[_electionId];
        require(election.id != 0, "Election does not exist");
        require(election.status == ElectionStatus.Pending, "Election cannot be started");
        require(election.candidateCount >= 2, "Need at least 2 candidates");

        election.status = ElectionStatus.Active;
        election.startTime = block.timestamp;

        emit ElectionStatusChanged(_electionId, ElectionStatus.Active);
    }

    /**
     * @notice End an election
     */
    function endElection(uint256 _electionId) external onlyOwner {
        Election storage election = elections[_electionId];
        require(election.id != 0, "Election does not exist");
        require(election.status == ElectionStatus.Active, "Election is not active");

        election.status = ElectionStatus.Ended;
        election.endTime = block.timestamp;

        emit ElectionStatusChanged(_electionId, ElectionStatus.Ended);
    }

    // ========================
    // Voting
    // ========================

    /**
     * @notice Cast a vote using tokens
     * @param _electionId Election ID
     * @param _candidateId Candidate ID to vote for
     * @param _tokenAmount Number of tokens to stake for this vote
     */
    function castVote(
        uint256 _electionId,
        uint256 _candidateId,
        uint256 _tokenAmount
    ) external {
        Election storage election = elections[_electionId];
        
        require(election.id != 0, "Election does not exist");
        require(election.status == ElectionStatus.Active, "Election is not active");
        require(!hasVoted[_electionId][msg.sender], "Already voted in this election");
        require(_candidateId > 0 && _candidateId <= election.candidateCount, "Invalid candidate");
        require(_tokenAmount >= tokensPerVote, "Insufficient tokens for vote");
        require(voteToken.balanceOf(msg.sender) >= _tokenAmount, "Insufficient token balance");
        require(voteToken.registeredVoters(msg.sender), "Not a registered voter");

        // Transfer tokens to this contract (locks them)
        require(
            voteToken.transferFrom(msg.sender, address(this), _tokenAmount),
            "Token transfer failed"
        );

        // Calculate vote weight (1 token = 1 vote weight)
        uint256 voteWeight = _tokenAmount / tokensPerVote;

        // Record the vote
        hasVoted[_electionId][msg.sender] = true;
        voterChoice[_electionId][msg.sender] = _candidateId;
        voterTokensUsed[_electionId][msg.sender] = _tokenAmount;
        
        candidates[_electionId][_candidateId].voteCount += voteWeight;
        election.totalVotesCast += voteWeight;
        election.totalTokensUsed += _tokenAmount;

        emit VoteCast(_electionId, msg.sender, _candidateId, _tokenAmount);
    }

    // ========================
    // View Functions
    // ========================

    /**
     * @notice Get election details
     */
    function getElection(uint256 _electionId) external view returns (
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        ElectionStatus status,
        uint256 candidateCount,
        uint256 totalVotesCast,
        uint256 totalTokensUsed
    ) {
        Election storage e = elections[_electionId];
        return (e.title, e.description, e.startTime, e.endTime, e.status, e.candidateCount, e.totalVotesCast, e.totalTokensUsed);
    }

    /**
     * @notice Get candidate details
     */
    function getCandidate(uint256 _electionId, uint256 _candidateId) external view returns (
        string memory name,
        string memory description,
        uint256 voteCount
    ) {
        Candidate storage c = candidates[_electionId][_candidateId];
        return (c.name, c.description, c.voteCount);
    }

    /**
     * @notice Get the winning candidate of an ended election
     */
    function getWinner(uint256 _electionId) external view returns (
        uint256 winnerId,
        string memory winnerName,
        uint256 winnerVotes
    ) {
        Election storage election = elections[_electionId];
        require(election.status == ElectionStatus.Ended, "Election has not ended");

        uint256 highestVotes = 0;
        uint256 winningId = 0;

        for (uint256 i = 1; i <= election.candidateCount; i++) {
            if (candidates[_electionId][i].voteCount > highestVotes) {
                highestVotes = candidates[_electionId][i].voteCount;
                winningId = i;
            }
        }

        return (winningId, candidates[_electionId][winningId].name, highestVotes);
    }

    /**
     * @notice Update tokens required per vote
     */
    function setTokensPerVote(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Must be greater than 0");
        tokensPerVote = _amount;
        emit TokensPerVoteUpdated(_amount);
    }

    /**
     * @notice Check if a voter has voted in a specific election
     */
    function hasVoterVoted(uint256 _electionId, address _voter) external view returns (bool) {
        return hasVoted[_electionId][_voter];
    }

    /**
     * @notice Get all candidates for an election
     */
    function getAllCandidates(uint256 _electionId) external view returns (
        uint256[] memory ids,
        string[] memory names,
        uint256[] memory voteCounts
    ) {
        Election storage election = elections[_electionId];
        uint256 count = election.candidateCount;
        
        ids = new uint256[](count);
        names = new string[](count);
        voteCounts = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            Candidate storage c = candidates[_electionId][i + 1];
            ids[i] = c.id;
            names[i] = c.name;
            voteCounts[i] = c.voteCount;
        }
        
        return (ids, names, voteCounts);
    }
}
