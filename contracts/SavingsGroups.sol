// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SavingsGroups
 * @dev Smart contract for managing ROSCA (Rotating Savings and Credit Associations)
 * Traditional community savings groups enhanced with blockchain transparency
 */
contract SavingsGroups is ReentrancyGuard, Pausable, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Events
    event GroupCreated(uint256 indexed groupId, address indexed creator, string name, uint256 contributionAmount);
    event MemberJoined(uint256 indexed groupId, address indexed member, uint256 position);
    event ContributionMade(uint256 indexed groupId, address indexed member, uint256 amount, uint256 round);
    event PayoutDistributed(uint256 indexed groupId, address indexed recipient, uint256 amount, uint256 round);
    event GroupCompleted(uint256 indexed groupId, uint256 totalRounds);
    event EmergencyLoanRequested(uint256 indexed groupId, address indexed member, uint256 amount);
    event EmergencyLoanApproved(uint256 indexed groupId, address indexed member, uint256 amount);

    // Enums
    enum GroupStatus { Active, Completed, Cancelled }
    enum ContributionFrequency { Daily, Weekly, Monthly }

    // Structs
    struct SavingsGroup {
        uint256 groupId;
        string name;
        string description;
        address creator;
        address token; // ERC20 token used for contributions
        uint256 contributionAmount;
        uint256 maxMembers;
        uint256 currentMembers;
        ContributionFrequency frequency;
        uint256 startTime;
        uint256 lastPayoutTime;
        uint256 currentRound;
        GroupStatus status;
        bool emergencyFundEnabled;
        uint256 emergencyFundBalance;
        uint256 totalContributions;
        mapping(address => Member) members;
        mapping(uint256 => address) payoutOrder; // round => member address
        address[] memberList;
    }

    struct Member {
        bool isActive;
        uint256 joinTime;
        uint256 position; // position in payout order
        uint256 totalContributions;
        uint256 missedContributions;
        uint256 lastContributionTime;
        bool hasReceivedPayout;
        uint256 payoutRound;
        uint256 emergencyLoanAmount;
        bool hasEmergencyLoan;
    }

    struct EmergencyLoan {
        uint256 groupId;
        address borrower;
        uint256 amount;
        uint256 requestTime;
        uint256 approvalCount;
        bool isApproved;
        bool isRepaid;
        mapping(address => bool) approvals;
    }

    // State variables
    mapping(uint256 => SavingsGroup) public savingsGroups;
    mapping(uint256 => EmergencyLoan) public emergencyLoans;
    mapping(address => uint256[]) public userGroups; // user => array of group IDs
    
    uint256 public nextGroupId = 1;
    uint256 public nextLoanId = 1;
    uint256 public platformFee = 25; // 0.25% in basis points
    address public feeReceiver;
    
    // Group creation settings
    uint256 public minimumContribution = 1000 * 10**18; // 1000 tokens minimum
    uint256 public maximumMembers = 50;
    uint256 public emergencyFundPercentage = 500; // 5% of contributions go to emergency fund

    constructor(address _feeReceiver) {
        feeReceiver = _feeReceiver;
    }

    modifier onlyGroupMember(uint256 _groupId) {
        require(savingsGroups[_groupId].members[msg.sender].isActive, "Not a group member");
        _;
    }

    modifier onlyGroupCreator(uint256 _groupId) {
        require(savingsGroups[_groupId].creator == msg.sender, "Not group creator");
        _;
    }

    modifier groupExists(uint256 _groupId) {
        require(_groupId > 0 && _groupId < nextGroupId, "Group does not exist");
        _;
    }

    /**
     * @dev Create a new savings group
     */
    function createGroup(
        string memory _name,
        string memory _description,
        address _token,
        uint256 _contributionAmount,
        uint256 _maxMembers,
        ContributionFrequency _frequency,
        bool _emergencyFundEnabled
    ) external whenNotPaused returns (uint256) {
        require(bytes(_name).length > 0, "Group name required");
        require(_contributionAmount >= minimumContribution, "Contribution too low");
        require(_maxMembers >= 3 && _maxMembers <= maximumMembers, "Invalid member count");
        require(_token != address(0), "Invalid token address");

        uint256 groupId = nextGroupId++;
        SavingsGroup storage group = savingsGroups[groupId];
        
        group.groupId = groupId;
        group.name = _name;
        group.description = _description;
        group.creator = msg.sender;
        group.token = _token;
        group.contributionAmount = _contributionAmount;
        group.maxMembers = _maxMembers;
        group.currentMembers = 1;
        group.frequency = _frequency;
        group.startTime = block.timestamp;
        group.status = GroupStatus.Active;
        group.emergencyFundEnabled = _emergencyFundEnabled;
        
        // Add creator as first member
        group.members[msg.sender] = Member({
            isActive: true,
            joinTime: block.timestamp,
            position: 1,
            totalContributions: 0,
            missedContributions: 0,
            lastContributionTime: 0,
            hasReceivedPayout: false,
            payoutRound: 0,
            emergencyLoanAmount: 0,
            hasEmergencyLoan: false
        });
        
        group.memberList.push(msg.sender);
        group.payoutOrder[1] = msg.sender; // Creator gets first payout
        userGroups[msg.sender].push(groupId);

        emit GroupCreated(groupId, msg.sender, _name, _contributionAmount);
        return groupId;
    }

    /**
     * @dev Join an existing savings group
     */
    function joinGroup(uint256 _groupId) external whenNotPaused groupExists(_groupId) {
        SavingsGroup storage group = savingsGroups[_groupId];
        
        require(group.status == GroupStatus.Active, "Group not active");
        require(!group.members[msg.sender].isActive, "Already a member");
        require(group.currentMembers < group.maxMembers, "Group is full");
        
        group.currentMembers++;
        uint256 position = group.currentMembers;
        
        group.members[msg.sender] = Member({
            isActive: true,
            joinTime: block.timestamp,
            position: position,
            totalContributions: 0,
            missedContributions: 0,
            lastContributionTime: 0,
            hasReceivedPayout: false,
            payoutRound: 0,
            emergencyLoanAmount: 0,
            hasEmergencyLoan: false
        });
        
        group.memberList.push(msg.sender);
        group.payoutOrder[position] = msg.sender;
        userGroups[msg.sender].push(_groupId);

        emit MemberJoined(_groupId, msg.sender, position);
    }

    /**
     * @dev Make a contribution to the savings group
     */
    function contribute(uint256 _groupId) external nonReentrant whenNotPaused onlyGroupMember(_groupId) {
        SavingsGroup storage group = savingsGroups[_groupId];
        require(group.status == GroupStatus.Active, "Group not active");
        
        uint256 amount = group.contributionAmount;
        uint256 emergencyFundAmount = 0;
        
        if (group.emergencyFundEnabled) {
            emergencyFundAmount = amount.mul(emergencyFundPercentage).div(10000);
            amount = amount.sub(emergencyFundAmount);
            group.emergencyFundBalance = group.emergencyFundBalance.add(emergencyFundAmount);
        }
        
        // Transfer tokens from user
        IERC20(group.token).safeTransferFrom(msg.sender, address(this), group.contributionAmount);
        
        // Update member contribution data
        Member storage member = group.members[msg.sender];
        member.totalContributions = member.totalContributions.add(group.contributionAmount);
        member.lastContributionTime = block.timestamp;
        
        // Update group totals
        group.totalContributions = group.totalContributions.add(amount);
        
        emit ContributionMade(_groupId, msg.sender, group.contributionAmount, group.currentRound);
        
        // Check if it's time for payout
        _checkAndProcessPayout(_groupId);
    }

    /**
     * @dev Process payout for the current round
     */
    function _checkAndProcessPayout(uint256 _groupId) internal {
        SavingsGroup storage group = savingsGroups[_groupId];
        
        // Check if all members have contributed for this round
        uint256 contributionsThisRound = 0;
        for (uint256 i = 0; i < group.memberList.length; i++) {
            address memberAddr = group.memberList[i];
            if (_hasContributedThisRound(_groupId, memberAddr)) {
                contributionsThisRound++;
            }
        }
        
        if (contributionsThisRound == group.currentMembers) {
            _processPayout(_groupId);
        }
    }

    /**
     * @dev Process payout to the next member in line
     */
    function _processPayout(uint256 _groupId) internal {
        SavingsGroup storage group = savingsGroups[_groupId];
        
        group.currentRound++;
        address payoutRecipient = group.payoutOrder[group.currentRound];
        
        require(payoutRecipient != address(0), "Invalid payout recipient");
        
        uint256 payoutAmount = group.totalContributions;
        
        // Calculate and deduct platform fee
        uint256 fee = payoutAmount.mul(platformFee).div(10000);
        uint256 finalPayout = payoutAmount.sub(fee);
        
        // Transfer payout to recipient
        IERC20(group.token).safeTransfer(payoutRecipient, finalPayout);
        
        // Transfer fee to platform
        if (fee > 0) {
            IERC20(group.token).safeTransfer(feeReceiver, fee);
        }
        
        // Update member payout status
        Member storage member = group.members[payoutRecipient];
        member.hasReceivedPayout = true;
        member.payoutRound = group.currentRound;
        
        // Reset total contributions for next round
        group.totalContributions = 0;
        group.lastPayoutTime = block.timestamp;
        
        emit PayoutDistributed(_groupId, payoutRecipient, finalPayout, group.currentRound);
        
        // Check if group is completed
        if (group.currentRound >= group.currentMembers) {
            group.status = GroupStatus.Completed;
            emit GroupCompleted(_groupId, group.currentRound);
        }
    }

    /**
     * @dev Check if member has contributed in current round
     */
    function _hasContributedThisRound(uint256 _groupId, address _member) internal view returns (bool) {
        SavingsGroup storage group = savingsGroups[_groupId];
        Member storage member = group.members[_member];
        
        uint256 frequencyInSeconds = _getFrequencyInSeconds(group.frequency);
        uint256 roundStartTime = group.lastPayoutTime > 0 ? group.lastPayoutTime : group.startTime;
        
        return member.lastContributionTime >= roundStartTime && 
               member.lastContributionTime < roundStartTime.add(frequencyInSeconds);
    }

    /**
     * @dev Get frequency in seconds
     */
    function _getFrequencyInSeconds(ContributionFrequency _frequency) internal pure returns (uint256) {
        if (_frequency == ContributionFrequency.Daily) return 86400; // 1 day
        if (_frequency == ContributionFrequency.Weekly) return 604800; // 7 days
        if (_frequency == ContributionFrequency.Monthly) return 2592000; // 30 days
        return 604800; // Default to weekly
    }

    /**
     * @dev Request emergency loan from group fund
     */
    function requestEmergencyLoan(uint256 _groupId, uint256 _amount, string memory _reason) 
        external 
        whenNotPaused 
        onlyGroupMember(_groupId) 
        returns (uint256) 
    {
        SavingsGroup storage group = savingsGroups[_groupId];
        require(group.emergencyFundEnabled, "Emergency fund not enabled");
        require(_amount <= group.emergencyFundBalance, "Insufficient emergency fund");
        require(!group.members[msg.sender].hasEmergencyLoan, "Already has active loan");
        
        uint256 loanId = nextLoanId++;
        EmergencyLoan storage loan = emergencyLoans[loanId];
        
        loan.groupId = _groupId;
        loan.borrower = msg.sender;
        loan.amount = _amount;
        loan.requestTime = block.timestamp;
        loan.approvalCount = 0;
        loan.isApproved = false;
        loan.isRepaid = false;
        
        emit EmergencyLoanRequested(_groupId, msg.sender, _amount);
        return loanId;
    }

    /**
     * @dev Approve emergency loan (requires majority approval)
     */
    function approveEmergencyLoan(uint256 _loanId) external {
        EmergencyLoan storage loan = emergencyLoans[_loanId];
        require(loan.borrower != address(0), "Loan does not exist");
        require(!loan.approvals[msg.sender], "Already approved");
        
        SavingsGroup storage group = savingsGroups[loan.groupId];
        require(group.members[msg.sender].isActive, "Not a group member");
        require(!loan.isApproved, "Loan already approved");
        
        loan.approvals[msg.sender] = true;
        loan.approvalCount++;
        
        // Check if majority approval reached (>50% of members)
        uint256 requiredApprovals = group.currentMembers.div(2).add(1);
        if (loan.approvalCount >= requiredApprovals) {
            _processEmergencyLoan(_loanId);
        }
    }

    /**
     * @dev Process emergency loan disbursement
     */
    function _processEmergencyLoan(uint256 _loanId) internal {
        EmergencyLoan storage loan = emergencyLoans[_loanId];
        SavingsGroup storage group = savingsGroups[loan.groupId];
        
        loan.isApproved = true;
        group.emergencyFundBalance = group.emergencyFundBalance.sub(loan.amount);
        group.members[loan.borrower].hasEmergencyLoan = true;
        group.members[loan.borrower].emergencyLoanAmount = loan.amount;
        
        // Transfer loan amount to borrower
        IERC20(group.token).safeTransfer(loan.borrower, loan.amount);
        
        emit EmergencyLoanApproved(loan.groupId, loan.borrower, loan.amount);
    }

    /**
     * @dev Repay emergency loan
     */
    function repayEmergencyLoan(uint256 _loanId) external nonReentrant whenNotPaused {
        EmergencyLoan storage loan = emergencyLoans[_loanId];
        require(loan.borrower == msg.sender, "Not the borrower");
        require(loan.isApproved, "Loan not approved");
        require(!loan.isRepaid, "Loan already repaid");
        
        SavingsGroup storage group = savingsGroups[loan.groupId];
        
        // Transfer repayment amount
        IERC20(group.token).safeTransferFrom(msg.sender, address(this), loan.amount);
        
        // Update loan and member status
        loan.isRepaid = true;
        group.emergencyFundBalance = group.emergencyFundBalance.add(loan.amount);
        group.members[msg.sender].hasEmergencyLoan = false;
        group.members[msg.sender].emergencyLoanAmount = 0;
    }

    /**
     * @dev Get group information
     */
    function getGroupInfo(uint256 _groupId) external view groupExists(_groupId) returns (
        string memory name,
        string memory description,
        address creator,
        address token,
        uint256 contributionAmount,
        uint256 currentMembers,
        uint256 maxMembers,
        GroupStatus status,
        uint256 currentRound,
        uint256 emergencyFundBalance
    ) {
        SavingsGroup storage group = savingsGroups[_groupId];
        return (
            group.name,
            group.description,
            group.creator,
            group.token,
            group.contributionAmount,
            group.currentMembers,
            group.maxMembers,
            group.status,
            group.currentRound,
            group.emergencyFundBalance
        );
    }

    /**
     * @dev Get member information
     */
    function getMemberInfo(uint256 _groupId, address _member) external view groupExists(_groupId) returns (
        bool isActive,
        uint256 position,
        uint256 totalContributions,
        uint256 missedContributions,
        bool hasReceivedPayout,
        uint256 payoutRound
    ) {
        Member storage member = savingsGroups[_groupId].members[_member];
        return (
            member.isActive,
            member.position,
            member.totalContributions,
            member.missedContributions,
            member.hasReceivedPayout,
            member.payoutRound
        );
    }

    /**
     * @dev Get user's groups
     */
    function getUserGroups(address _user) external view returns (uint256[] memory) {
        return userGroups[_user];
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 1000, "Platform fee too high"); // Max 10%
        platformFee = _platformFee;
    }

    /**
     * @dev Update emergency fund percentage (only owner)
     */
    function updateEmergencyFundPercentage(uint256 _percentage) external onlyOwner {
        require(_percentage <= 1000, "Percentage too high"); // Max 10%
        emergencyFundPercentage = _percentage;
    }

    /**
     * @dev Pause the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
