// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title SavingsGroup
 * @dev Smart contract for managing village savings groups with automated contributions and loans
 */
contract SavingsGroup is ReentrancyGuard, AccessControl {
    using SafeMath for uint256;

    bytes32 public constant GROUP_ADMIN_ROLE = keccak256("GROUP_ADMIN_ROLE");
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

    IERC20 public immutable celoToken;
    
    struct Member {
        address memberAddress;
        uint256 totalContributions;
        uint256 totalLoans;
        uint256 totalRepayments;
        bool isActive;
        uint256 joinDate;
        uint256 creditScore;
    }

    struct Loan {
        uint256 loanId;
        address borrower;
        uint256 amount;
        uint256 interestRate; // Basis points (e.g., 500 = 5%)
        uint256 duration; // In days
        uint256 startDate;
        uint256 repaidAmount;
        bool isActive;
        bool isApproved;
        uint256 collateralAmount;
    }

    struct ContributionCycle {
        uint256 cycleId;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
        mapping(address => uint256) memberContributions;
    }

    // Group information
    string public groupName;
    uint256 public creationDate;
    uint256 public minimumContribution;
    uint256 public maxLoanAmount;
    uint256 public defaultInterestRate;
    uint256 public groupBalance;
    
    // Member management
    mapping(address => Member) public members;
    address[] public memberAddresses;
    uint256 public memberCount;
    
    // Loan management
    mapping(uint256 => Loan) public loans;
    uint256 public nextLoanId;
    uint256 public totalLoansIssued;
    uint256 public totalLoansRepaid;
    
    // Contribution cycles
    mapping(uint256 => ContributionCycle) public contributionCycles;
    uint256 public currentCycleId;
    
    // Events
    event MemberAdded(address indexed member, uint256 timestamp);
    event MemberRemoved(address indexed member, uint256 timestamp);
    event ContributionMade(address indexed member, uint256 amount, uint256 cycleId);
    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanApproved(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanRepayment(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event CycleStarted(uint256 indexed cycleId, uint256 targetAmount, uint256 duration);
    event CycleCompleted(uint256 indexed cycleId, uint256 totalCollected);

    modifier onlyGroupAdmin() {
        require(hasRole(GROUP_ADMIN_ROLE, msg.sender), "Not a group admin");
        _;
    }

    modifier onlyMember() {
        require(hasRole(MEMBER_ROLE, msg.sender), "Not a group member");
        _;
    }

    modifier onlyActiveMember() {
        require(members[msg.sender].isActive, "Member is not active");
        _;
    }

    constructor(
        string memory _groupName,
        address _celoToken,
        uint256 _minimumContribution,
        uint256 _maxLoanAmount,
        uint256 _defaultInterestRate,
        address _groupAdmin
    ) {
        groupName = _groupName;
        celoToken = IERC20(_celoToken);
        minimumContribution = _minimumContribution;
        maxLoanAmount = _maxLoanAmount;
        defaultInterestRate = _defaultInterestRate;
        creationDate = block.timestamp;
        
        _grantRole(DEFAULT_ADMIN_ROLE, _groupAdmin);
        _grantRole(GROUP_ADMIN_ROLE, _groupAdmin);
        
        nextLoanId = 1;
        currentCycleId = 0;
    }

    /**
     * @dev Add a new member to the savings group
     * @param _member Address of the new member
     */
    function addMember(address _member) external onlyGroupAdmin {
        require(_member != address(0), "Invalid member address");
        require(!members[_member].isActive, "Member already exists");
        
        members[_member] = Member({
            memberAddress: _member,
            totalContributions: 0,
            totalLoans: 0,
            totalRepayments: 0,
            isActive: true,
            joinDate: block.timestamp,
            creditScore: 500 // Default credit score
        });
        
        memberAddresses.push(_member);
        memberCount++;
        
        _grantRole(MEMBER_ROLE, _member);
        
        emit MemberAdded(_member, block.timestamp);
    }

    /**
     * @dev Start a new contribution cycle
     * @param _targetAmount Target amount for this cycle
     * @param _duration Duration in days
     */
    function startContributionCycle(uint256 _targetAmount, uint256 _duration) external onlyGroupAdmin {
        require(_targetAmount > 0, "Target amount must be positive");
        require(_duration > 0, "Duration must be positive");
        
        // Complete current cycle if active
        if (currentCycleId > 0 && contributionCycles[currentCycleId].isActive) {
            contributionCycles[currentCycleId].isActive = false;
            emit CycleCompleted(currentCycleId, contributionCycles[currentCycleId].currentAmount);
        }
        
        currentCycleId++;
        ContributionCycle storage newCycle = contributionCycles[currentCycleId];
        newCycle.cycleId = currentCycleId;
        newCycle.targetAmount = _targetAmount;
        newCycle.currentAmount = 0;
        newCycle.startDate = block.timestamp;
        newCycle.endDate = block.timestamp + (_duration * 1 days);
        newCycle.isActive = true;
        
        emit CycleStarted(currentCycleId, _targetAmount, _duration);
    }

    /**
     * @dev Make a contribution to the current cycle
     * @param _amount Amount to contribute
     */
    function makeContribution(uint256 _amount) external onlyActiveMember nonReentrant {
        require(_amount >= minimumContribution, "Amount below minimum contribution");
        require(currentCycleId > 0, "No active contribution cycle");
        require(contributionCycles[currentCycleId].isActive, "Cycle is not active");
        require(block.timestamp <= contributionCycles[currentCycleId].endDate, "Cycle has ended");
        
        require(celoToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        ContributionCycle storage cycle = contributionCycles[currentCycleId];
        cycle.memberContributions[msg.sender] += _amount;
        cycle.currentAmount += _amount;
        
        members[msg.sender].totalContributions += _amount;
        groupBalance += _amount;
        
        // Update credit score based on consistent contributions
        _updateCreditScore(msg.sender, true);
        
        emit ContributionMade(msg.sender, _amount, currentCycleId);
    }

    /**
     * @dev Request a loan from the group funds
     * @param _amount Loan amount requested
     * @param _duration Loan duration in days
     * @param _collateralAmount Collateral amount (if any)
     */
    function requestLoan(
        uint256 _amount,
        uint256 _duration,
        uint256 _collateralAmount
    ) external onlyActiveMember returns (uint256) {
        require(_amount > 0 && _amount <= maxLoanAmount, "Invalid loan amount");
        require(_duration > 0, "Invalid duration");
        require(_amount <= groupBalance, "Insufficient group funds");
        
        uint256 loanId = nextLoanId++;
        
        loans[loanId] = Loan({
            loanId: loanId,
            borrower: msg.sender,
            amount: _amount,
            interestRate: _calculateInterestRate(msg.sender, _amount),
            duration: _duration,
            startDate: 0, // Set when approved
            repaidAmount: 0,
            isActive: false,
            isApproved: false,
            collateralAmount: _collateralAmount
        });
        
        if (_collateralAmount > 0) {
            require(celoToken.transferFrom(msg.sender, address(this), _collateralAmount), "Collateral transfer failed");
        }
        
        emit LoanRequested(loanId, msg.sender, _amount);
        return loanId;
    }

    /**
     * @dev Approve a loan (requires group admin approval)
     * @param _loanId ID of the loan to approve
     */
    function approveLoan(uint256 _loanId) external onlyGroupAdmin {
        Loan storage loan = loans[_loanId];
        require(loan.borrower != address(0), "Loan does not exist");
        require(!loan.isApproved, "Loan already approved");
        require(loan.amount <= groupBalance, "Insufficient group funds");
        
        loan.isApproved = true;
        loan.isActive = true;
        loan.startDate = block.timestamp;
        
        groupBalance -= loan.amount;
        members[loan.borrower].totalLoans += loan.amount;
        totalLoansIssued += loan.amount;
        
        require(celoToken.transfer(loan.borrower, loan.amount), "Loan transfer failed");
        
        emit LoanApproved(_loanId, loan.borrower, loan.amount);
    }

    /**
     * @dev Repay a loan
     * @param _loanId ID of the loan to repay
     * @param _amount Amount to repay
     */
    function repayLoan(uint256 _loanId, uint256 _amount) external nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "Not the borrower");
        require(loan.isActive, "Loan is not active");
        require(_amount > 0, "Amount must be positive");
        
        uint256 totalOwed = _calculateTotalOwed(_loanId);
        uint256 remainingDebt = totalOwed - loan.repaidAmount;
        require(_amount <= remainingDebt, "Amount exceeds remaining debt");
        
        require(celoToken.transferFrom(msg.sender, address(this), _amount), "Repayment transfer failed");
        
        loan.repaidAmount += _amount;
        members[msg.sender].totalRepayments += _amount;
        groupBalance += _amount;
        
        if (loan.repaidAmount >= totalOwed) {
            loan.isActive = false;
            totalLoansRepaid += loan.amount;
            
            // Return collateral if any
            if (loan.collateralAmount > 0) {
                require(celoToken.transfer(msg.sender, loan.collateralAmount), "Collateral return failed");
            }
        }
        
        // Update credit score based on repayment
        _updateCreditScore(msg.sender, false);
        
        emit LoanRepayment(_loanId, msg.sender, _amount);
    }

    /**
     * @dev Calculate total amount owed for a loan including interest
     * @param _loanId ID of the loan
     */
    function _calculateTotalOwed(uint256 _loanId) internal view returns (uint256) {
        Loan storage loan = loans[_loanId];
        if (!loan.isActive) return 0;
        
        uint256 daysPassed = (block.timestamp - loan.startDate) / 1 days;
        uint256 interest = loan.amount.mul(loan.interestRate).mul(daysPassed).div(10000).div(365);
        
        return loan.amount.add(interest);
    }

    /**
     * @dev Calculate interest rate based on member's credit score
     * @param _member Address of the member
     * Note: Loan amount parameter is commented out as it's not used currently
     */
    function _calculateInterestRate(address _member, uint256 /* _amount */) internal view returns (uint256) {
        uint256 creditScore = members[_member].creditScore;
        uint256 baseRate = defaultInterestRate;
        
        // Adjust rate based on credit score (500-850 range)
        if (creditScore >= 700) {
            return baseRate.mul(80).div(100); // 20% discount
        } else if (creditScore >= 600) {
            return baseRate.mul(90).div(100); // 10% discount
        } else if (creditScore < 500) {
            return baseRate.mul(120).div(100); // 20% premium
        }
        
        return baseRate;
    }

    /**
     * @dev Update member's credit score based on activity
     * @param _member Address of the member
     * @param _isContribution True if contribution, false if loan repayment
     */
    function _updateCreditScore(address _member, bool _isContribution) internal {
        Member storage member = members[_member];
        
        if (_isContribution) {
            // Increase score for consistent contributions
            if (member.creditScore < 850) {
                member.creditScore += 5;
            }
        } else {
            // Increase score for loan repayments
            if (member.creditScore < 850) {
                member.creditScore += 10;
            }
        }
    }

    // View functions
    function getMemberInfo(address _member) external view returns (Member memory) {
        return members[_member];
    }

    function getLoanInfo(uint256 _loanId) external view returns (Loan memory) {
        return loans[_loanId];
    }

    function getCurrentCycleInfo() external view returns (
        uint256 cycleId,
        uint256 targetAmount,
        uint256 currentAmount,
        uint256 startDate,
        uint256 endDate,
        bool isActive
    ) {
        if (currentCycleId == 0) return (0, 0, 0, 0, 0, false);
        
        ContributionCycle storage cycle = contributionCycles[currentCycleId];
        return (
            cycle.cycleId,
            cycle.targetAmount,
            cycle.currentAmount,
            cycle.startDate,
            cycle.endDate,
            cycle.isActive
        );
    }

    function getMemberContributionInCycle(address _member, uint256 _cycleId) external view returns (uint256) {
        return contributionCycles[_cycleId].memberContributions[_member];
    }
}
