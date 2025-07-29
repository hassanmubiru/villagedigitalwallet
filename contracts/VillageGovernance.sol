// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title VillageGovernanceToken
 * @dev ERC20 token with permit functionality for governance
 */
contract VillageGovernanceToken is ERC20, ERC20Permit, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner
    ) ERC20(name, symbol) ERC20Permit(name) Ownable(owner) {
        _mint(owner, initialSupply);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

/**
 * @title VillageGovernance
 * @dev Simplified governance system for Village Digital Wallet
 */
contract VillageGovernance is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    
    VillageGovernanceToken public governanceToken;

    // Governance parameters
    struct GovernanceParams {
        uint256 proposalThreshold; // Minimum tokens needed to create proposal
        uint256 votingDelay; // Delay before voting starts (in blocks)
        uint256 votingPeriod; // Duration of voting period (in blocks)
        uint256 quorumPercentage; // Percentage of total supply needed for quorum
        uint256 timelockDelay; // Delay before execution (in seconds)
    }

    GovernanceParams public params;

    // Proposal categories
    enum ProposalCategory {
        SAVINGS_MANAGEMENT,
        LOAN_APPROVAL,
        INTEREST_RATE_CHANGE,
        MEMBER_MANAGEMENT,
        TREASURY_MANAGEMENT,
        SYSTEM_UPGRADE
    }

    struct Proposal {
        uint256 proposalId;
        ProposalCategory category;
        address proposer;
        string title;
        string description;
        uint256 createdAt;
        bool executed;
        mapping(address => bool) hasVoted;
        mapping(address => bool) voteSupport;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    // Member voting power based on contributions and reputation
    mapping(address => uint256) public memberVotingPower;
    mapping(address => uint256) public memberReputation;

    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        ProposalCategory category,
        string title
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votingPower
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event GovernanceParamsUpdated(GovernanceParams newParams);
    event VotingPowerUpdated(address indexed member, uint256 newPower);
    event ReputationUpdated(address indexed member, uint256 newReputation);

    constructor(
        address initialOwner,
        string memory tokenName,
        string memory tokenSymbol,
        uint256 initialTokenSupply
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(ADMIN_ROLE, initialOwner);
        _grantRole(PROPOSER_ROLE, initialOwner);

        // Deploy governance token
        governanceToken = new VillageGovernanceToken(
            tokenName,
            tokenSymbol,
            initialTokenSupply,
            address(this)
        );

        // Set initial governance parameters
        params = GovernanceParams({
            proposalThreshold: 1000 * 10**18, // 1000 tokens
            votingDelay: 1, // 1 block
            votingPeriod: 50400, // 1 week (12 second blocks)
            quorumPercentage: 4, // 4%
            timelockDelay: 2 days
        });
    }

    /**
     * @dev Create a new governance proposal
     */
    function createProposal(
        ProposalCategory category,
        string memory title,
        string memory description
    ) external returns (uint256) {
        require(
            governanceToken.balanceOf(msg.sender) >= params.proposalThreshold,
            "Insufficient tokens to create proposal"
        );

        uint256 proposalId = proposalCount++;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.proposalId = proposalId;
        proposal.category = category;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.createdAt = block.timestamp;

        emit ProposalCreated(proposalId, msg.sender, category, title);
        return proposalId;
    }

    /**
     * @dev Cast a vote on a proposal
     */
    function vote(uint256 proposalId, uint8 support) external {
        require(!proposals[proposalId].hasVoted[msg.sender], "Already voted");
        require(proposals[proposalId].proposalId == proposalId, "Invalid proposal");
        
        uint256 votingPower = getVotingPower(msg.sender);
        require(votingPower > 0, "No voting power");

        // Update proposal tracking
        proposals[proposalId].hasVoted[msg.sender] = true;
        proposals[proposalId].voteSupport[msg.sender] = support == 1;

        if (support == 0) {
            proposals[proposalId].againstVotes += votingPower;
        } else if (support == 1) {
            proposals[proposalId].forVotes += votingPower;
        } else {
            proposals[proposalId].abstainVotes += votingPower;
        }

        emit VoteCast(proposalId, msg.sender, support == 1, votingPower);
    }

    /**
     * @dev Execute a successful proposal
     */
    function executeProposal(uint256 proposalId) external onlyRole(ADMIN_ROLE) {
        require(!proposals[proposalId].executed, "Proposal already executed");
        require(proposals[proposalId].forVotes > proposals[proposalId].againstVotes, "Proposal failed");
        
        proposals[proposalId].executed = true;
        emit ProposalExecuted(proposalId);
    }

    /**
     * @dev Get voting power for a member (based on tokens + reputation)
     */
    function getVotingPower(address member) public view returns (uint256) {
        uint256 tokenBalance = governanceToken.balanceOf(member);
        uint256 reputationBonus = memberReputation[member] / 100; // 1% bonus per 100 reputation points
        return tokenBalance + (tokenBalance * reputationBonus / 100);
    }

    /**
     * @dev Update member voting power based on contributions
     */
    function updateVotingPower(address member, uint256 contributionAmount) external onlyRole(ADMIN_ROLE) {
        // Mint governance tokens based on contributions
        uint256 tokensToMint = contributionAmount / 1000; // 1 token per 1000 units contributed
        if (tokensToMint > 0) {
            governanceToken.mint(member, tokensToMint);
        }

        memberVotingPower[member] = getVotingPower(member);
        emit VotingPowerUpdated(member, memberVotingPower[member]);
    }

    /**
     * @dev Update member reputation based on behavior
     */
    function updateReputation(address member, uint256 reputationChange, bool increase) external onlyRole(ADMIN_ROLE) {
        if (increase) {
            memberReputation[member] += reputationChange;
        } else {
            memberReputation[member] = memberReputation[member] > reputationChange 
                ? memberReputation[member] - reputationChange 
                : 0;
        }
        emit ReputationUpdated(member, memberReputation[member]);
    }

    /**
     * @dev Update governance parameters (requires admin role)
     */
    function updateGovernanceParams(GovernanceParams memory newParams) external onlyRole(ADMIN_ROLE) {
        params = newParams;
        emit GovernanceParamsUpdated(newParams);
    }

    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (
        ProposalCategory category,
        address proposer,
        string memory title,
        string memory description,
        uint256 createdAt,
        bool executed,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.category,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.createdAt,
            proposal.executed,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes
        );
    }

    /**
     * @dev Check if member has voted on a proposal
     */
    function hasVoted(uint256 proposalId, address member) external view returns (bool) {
        return proposals[proposalId].hasVoted[member];
    }

    /**
     * @dev Get member's vote on a proposal
     */
    function getVote(uint256 proposalId, address member) external view returns (bool) {
        return proposals[proposalId].voteSupport[member];
    }
}
