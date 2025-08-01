// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MicroloanSystem
 * @dev Smart contract for managing microloans with credit scoring and automated repayments
 */
contract MicroloanSystem is ReentrancyGuard, Pausable, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Events
    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 duration);
    event LoanApproved(uint256 indexed loanId, address indexed lender, uint256 amount, uint256 interestRate);
    event LoanFunded(uint256 indexed loanId, uint256 amount);
    event RepaymentMade(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 installment);
    event LoanCompleted(uint256 indexed loanId, address indexed borrower);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);
    event LenderRegistered(address indexed lender, uint256 fundingCapacity);
    event CollateralDeposited(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event CollateralReleased(uint256 indexed loanId, address indexed borrower, uint256 amount);

    // Enums
    enum LoanStatus { Requested, Approved, Funded, Active, Completed, Defaulted }
    enum LoanType { Personal, Business, Agricultural, Educational }

    // Structs
    struct Loan {
        uint256 loanId;
        address borrower;
        address lender;
        address token;
        uint256 principalAmount;
        uint256 interestRate; // Annual interest rate in basis points (100 = 1%)
        uint256 duration; // Loan duration in days
        uint256 installmentAmount;
        uint256 installmentsPaid;
        uint256 totalInstallments;
        uint256 startTime;
        uint256 nextPaymentDue;
        LoanStatus status;
        LoanType loanType;
        string purpose;
        uint256 collateralAmount;
        bool requiresCollateral;
        uint256 creditScoreRequired;
        uint256 totalRepaid;
        uint256 penaltyAmount;
    }

    struct Borrower {
        uint256 creditScore;
        uint256 totalBorrowed;
        uint256 totalRepaid;
        uint256 activeLoans;
        uint256 completedLoans;
        uint256 defaultedLoans;
        uint256 lastLoanTime;
        bool isBlacklisted;
    }

    struct Lender {
        bool isRegistered;
        uint256 fundingCapacity;
        uint256 totalLent;
        uint256 activeLoans;
        uint256 completedLoans;
        uint256 defaultRate; // in basis points
        uint256 averageReturn;
        address[] supportedTokens;
        mapping(address => uint256) availableFunds;
    }

    struct LoanOffer {
        address lender;
        uint256 maxAmount;
        uint256 interestRate;
        uint256 maxDuration;
        uint256 minCreditScore;
        LoanType[] supportedTypes;
        bool isActive;
    }

    // State variables
    mapping(uint256 => Loan) public loans;
    mapping(address => Borrower) public borrowers;
    mapping(address => Lender) public lenders;
    mapping(uint256 => LoanOffer) public loanOffers;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => uint256[]) public lenderLoans;
    
    uint256 public nextLoanId = 1;
    uint256 public nextOfferId = 1;
    uint256 public platformFee = 200; // 2% platform fee in basis points
    uint256 public latePenaltyRate = 500; // 5% penalty for late payments
    uint256 public maxLoanAmount = 50000 * 10**18; // 50,000 tokens
    uint256 public minCreditScore = 400;
    uint256 public installmentPeriod = 30 days; // Monthly installments
    
    address public feeReceiver;
    address public creditScoringOracle;

    constructor(address _feeReceiver, address _creditScoringOracle) {
        feeReceiver = _feeReceiver;
        creditScoringOracle = _creditScoringOracle;
    }

    modifier onlyRegisteredLender() {
        require(lenders[msg.sender].isRegistered, "Not a registered lender");
        _;
    }

    modifier onlyCreditOracle() {
        require(msg.sender == creditScoringOracle, "Only credit oracle");
        _;
    }

    modifier loanExists(uint256 _loanId) {
        require(_loanId > 0 && _loanId < nextLoanId, "Loan does not exist");
        _;
    }

    /**
     * @dev Register as a lender
     */
    function registerLender(uint256 _fundingCapacity, address[] memory _supportedTokens) external {
        require(!lenders[msg.sender].isRegistered, "Already registered");
        require(_fundingCapacity > 0, "Invalid funding capacity");
        
        Lender storage lender = lenders[msg.sender];
        lender.isRegistered = true;
        lender.fundingCapacity = _fundingCapacity;
        lender.supportedTokens = _supportedTokens;
        
        emit LenderRegistered(msg.sender, _fundingCapacity);
    }

    /**
     * @dev Deposit funds for lending
     */
    function depositFunds(address _token, uint256 _amount) external nonReentrant onlyRegisteredLender {
        require(_amount > 0, "Amount must be greater than 0");
        
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        lenders[msg.sender].availableFunds[_token] = lenders[msg.sender].availableFunds[_token].add(_amount);
    }

    /**
     * @dev Withdraw available funds
     */
    function withdrawFunds(address _token, uint256 _amount) external nonReentrant onlyRegisteredLender {
        require(_amount > 0, "Amount must be greater than 0");
        require(lenders[msg.sender].availableFunds[_token] >= _amount, "Insufficient funds");
        
        lenders[msg.sender].availableFunds[_token] = lenders[msg.sender].availableFunds[_token].sub(_amount);
        IERC20(_token).safeTransfer(msg.sender, _amount);
    }

    /**
     * @dev Create a loan offer
     */
    function createLoanOffer(
        uint256 _maxAmount,
        uint256 _interestRate,
        uint256 _maxDuration,
        uint256 _minCreditScore,
        LoanType[] memory _supportedTypes
    ) external onlyRegisteredLender returns (uint256) {
        require(_maxAmount > 0 && _maxAmount <= maxLoanAmount, "Invalid loan amount");
        require(_interestRate > 0 && _interestRate <= 5000, "Invalid interest rate"); // Max 50%
        require(_maxDuration > 0 && _maxDuration <= 365, "Invalid duration");
        require(_minCreditScore >= 300 && _minCreditScore <= 850, "Invalid credit score");
        
        uint256 offerId = nextOfferId++;
        LoanOffer storage offer = loanOffers[offerId];
        
        offer.lender = msg.sender;
        offer.maxAmount = _maxAmount;
        offer.interestRate = _interestRate;
        offer.maxDuration = _maxDuration;
        offer.minCreditScore = _minCreditScore;
        offer.supportedTypes = _supportedTypes;
        offer.isActive = true;
        
        return offerId;
    }

    /**
     * @dev Request a loan
     */
    function requestLoan(
        address _token,
        uint256 _amount,
        uint256 _duration,
        LoanType _loanType,
        string memory _purpose,
        bool _requiresCollateral
    ) external whenNotPaused returns (uint256) {
        require(_amount > 0 && _amount <= maxLoanAmount, "Invalid loan amount");
        require(_duration > 0 && _duration <= 365, "Invalid duration");
        require(!borrowers[msg.sender].isBlacklisted, "Borrower blacklisted");
        
        // Check borrower's credit score
        require(borrowers[msg.sender].creditScore >= minCreditScore, "Credit score too low");
        
        uint256 loanId = nextLoanId++;
        
        // Calculate installment details
        uint256 totalInstallments = _duration.div(30).add(1); // Monthly installments
        uint256 totalAmount = _amount.add(_amount.mul(1000).div(10000)); // Add base interest
        uint256 installmentAmount = totalAmount.div(totalInstallments);
        
        Loan storage loan = loans[loanId];
        loan.loanId = loanId;
        loan.borrower = msg.sender;
        loan.token = _token;
        loan.principalAmount = _amount;
        loan.duration = _duration;
        loan.status = LoanStatus.Requested;
        loan.loanType = _loanType;
        loan.purpose = _purpose;
        loan.requiresCollateral = _requiresCollateral;
        loan.creditScoreRequired = minCreditScore;
        loan.totalInstallments = totalInstallments;
        loan.installmentAmount = installmentAmount;
        
        borrowerLoans[msg.sender].push(loanId);
        borrowers[msg.sender].activeLoans++;
        
        emit LoanRequested(loanId, msg.sender, _amount, _duration);
        return loanId;
    }

    /**
     * @dev Approve a loan (lender action)
     */
    function approveLoan(uint256 _loanId, uint256 _interestRate) external loanExists(_loanId) onlyRegisteredLender {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Requested, "Loan not in requested status");
        require(_interestRate > 0 && _interestRate <= 5000, "Invalid interest rate");
        
        // Check if lender has sufficient funds
        require(lenders[msg.sender].availableFunds[loan.token] >= loan.principalAmount, "Insufficient lender funds");
        
        loan.lender = msg.sender;
        loan.interestRate = _interestRate;
        loan.status = LoanStatus.Approved;
        
        // Recalculate installment amount with actual interest rate
        uint256 totalInterest = loan.principalAmount.mul(_interestRate).mul(loan.duration).div(365).div(10000);
        uint256 totalAmount = loan.principalAmount.add(totalInterest);
        loan.installmentAmount = totalAmount.div(loan.totalInstallments);
        
        lenderLoans[msg.sender].push(_loanId);
        lenders[msg.sender].activeLoans++;
        
        emit LoanApproved(_loanId, msg.sender, loan.principalAmount, _interestRate);
    }

    /**
     * @dev Deposit collateral for loan
     */
    function depositCollateral(uint256 _loanId, uint256 _amount) external nonReentrant loanExists(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "Not the borrower");
        require(loan.status == LoanStatus.Approved, "Loan not approved");
        require(loan.requiresCollateral, "Collateral not required");
        require(_amount > 0, "Invalid collateral amount");
        
        IERC20(loan.token).safeTransferFrom(msg.sender, address(this), _amount);
        loan.collateralAmount = loan.collateralAmount.add(_amount);
        
        emit CollateralDeposited(_loanId, msg.sender, _amount);
        
        // Auto-fund loan if sufficient collateral
        if (loan.collateralAmount >= loan.principalAmount.mul(120).div(100)) { // 120% collateral
            _fundLoan(_loanId);
        }
    }

    /**
     * @dev Fund the loan (transfer money to borrower)
     */
    function fundLoan(uint256 _loanId) external loanExists(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.lender == msg.sender, "Not the lender");
        require(loan.status == LoanStatus.Approved, "Loan not approved");
        
        _fundLoan(_loanId);
    }

    /**
     * @dev Internal function to fund loan
     */
    function _fundLoan(uint256 _loanId) internal {
        Loan storage loan = loans[_loanId];
        
        // Deduct funds from lender's available balance
        lenders[loan.lender].availableFunds[loan.token] = 
            lenders[loan.lender].availableFunds[loan.token].sub(loan.principalAmount);
        
        // Calculate platform fee
        uint256 fee = loan.principalAmount.mul(platformFee).div(10000);
        uint256 amountToBorrower = loan.principalAmount.sub(fee);
        
        // Transfer funds
        IERC20(loan.token).safeTransfer(loan.borrower, amountToBorrower);
        if (fee > 0) {
            IERC20(loan.token).safeTransfer(feeReceiver, fee);
        }
        
        // Update loan status
        loan.status = LoanStatus.Active;
        loan.startTime = block.timestamp;
        loan.nextPaymentDue = block.timestamp.add(installmentPeriod);
        
        // Update borrower stats
        borrowers[loan.borrower].totalBorrowed = borrowers[loan.borrower].totalBorrowed.add(loan.principalAmount);
        borrowers[loan.borrower].lastLoanTime = block.timestamp;
        
        // Update lender stats
        lenders[loan.lender].totalLent = lenders[loan.lender].totalLent.add(loan.principalAmount);
        
        emit LoanFunded(_loanId, amountToBorrower);
    }

    /**
     * @dev Make loan repayment
     */
    function makeRepayment(uint256 _loanId) external nonReentrant loanExists(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "Not the borrower");
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(loan.installmentsPaid < loan.totalInstallments, "Loan already completed");
        
        uint256 paymentAmount = loan.installmentAmount;
        
        // Add penalty if payment is late
        if (block.timestamp > loan.nextPaymentDue) {
            uint256 daysLate = (block.timestamp - loan.nextPaymentDue) / 86400;
            uint256 penalty = loan.installmentAmount.mul(latePenaltyRate).mul(daysLate).div(10000).div(365);
            paymentAmount = paymentAmount.add(penalty);
            loan.penaltyAmount = loan.penaltyAmount.add(penalty);
        }
        
        // Transfer payment
        IERC20(loan.token).safeTransferFrom(msg.sender, address(this), paymentAmount);
        
        // Distribute payment (90% to lender, 10% platform fee on interest portion)
        uint256 principalPortion = loan.principalAmount.div(loan.totalInstallments);
        uint256 interestPortion = paymentAmount.sub(principalPortion);
        uint256 platformFeeAmount = interestPortion.mul(1000).div(10000); // 10% of interest
        uint256 lenderAmount = paymentAmount.sub(platformFeeAmount);
        
        lenders[loan.lender].availableFunds[loan.token] = 
            lenders[loan.lender].availableFunds[loan.token].add(lenderAmount);
        
        if (platformFeeAmount > 0) {
            IERC20(loan.token).safeTransfer(feeReceiver, platformFeeAmount);
        }
        
        // Update loan details
        loan.installmentsPaid++;
        loan.totalRepaid = loan.totalRepaid.add(paymentAmount);
        loan.nextPaymentDue = loan.nextPaymentDue.add(installmentPeriod);
        
        // Update borrower stats
        borrowers[loan.borrower].totalRepaid = borrowers[loan.borrower].totalRepaid.add(paymentAmount);
        
        emit RepaymentMade(_loanId, msg.sender, paymentAmount, loan.installmentsPaid);
        
        // Check if loan is completed
        if (loan.installmentsPaid >= loan.totalInstallments) {
            _completeLoan(_loanId);
        }
    }

    /**
     * @dev Complete loan and release collateral
     */
    function _completeLoan(uint256 _loanId) internal {
        Loan storage loan = loans[_loanId];
        
        loan.status = LoanStatus.Completed;
        
        // Release collateral if any
        if (loan.collateralAmount > 0) {
            IERC20(loan.token).safeTransfer(loan.borrower, loan.collateralAmount);
            emit CollateralReleased(_loanId, loan.borrower, loan.collateralAmount);
        }
        
        // Update stats
        borrowers[loan.borrower].activeLoans--;
        borrowers[loan.borrower].completedLoans++;
        lenders[loan.lender].activeLoans--;
        lenders[loan.lender].completedLoans++;
        
        // Improve credit score for successful completion
        _updateCreditScore(loan.borrower, 10);
        
        emit LoanCompleted(_loanId, loan.borrower);
    }

    /**
     * @dev Mark loan as defaulted (can be called by lender or oracle)
     */
    function markLoanDefaulted(uint256 _loanId) external loanExists(_loanId) {
        Loan storage loan = loans[_loanId];
        require(
            msg.sender == loan.lender || 
            msg.sender == owner() || 
            msg.sender == creditScoringOracle, 
            "Not authorized"
        );
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(block.timestamp > loan.nextPaymentDue.add(7 days), "Grace period not over");
        
        loan.status = LoanStatus.Defaulted;
        
        // Transfer collateral to lender if available
        if (loan.collateralAmount > 0) {
            IERC20(loan.token).safeTransfer(loan.lender, loan.collateralAmount);
        }
        
        // Update stats
        borrowers[loan.borrower].activeLoans--;
        borrowers[loan.borrower].defaultedLoans++;
        lenders[loan.lender].activeLoans--;
        
        // Severely impact credit score
        _updateCreditScore(loan.borrower, -50);
        
        // Blacklist borrower if multiple defaults
        if (borrowers[loan.borrower].defaultedLoans >= 2) {
            borrowers[loan.borrower].isBlacklisted = true;
        }
        
        emit LoanDefaulted(_loanId, loan.borrower);
    }

    /**
     * @dev Update credit score (only oracle or automated)
     */
    function updateCreditScore(address _borrower, uint256 _newScore) external onlyCreditOracle {
        require(_newScore >= 300 && _newScore <= 850, "Invalid credit score");
        borrowers[_borrower].creditScore = _newScore;
    }

    /**
     * @dev Internal function to update credit score
     */
    function _updateCreditScore(address _borrower, int256 _change) internal {
        Borrower storage borrower = borrowers[_borrower];
        
        if (_change > 0) {
            borrower.creditScore = borrower.creditScore.add(uint256(_change));
            if (borrower.creditScore > 850) borrower.creditScore = 850;
        } else {
            uint256 decrease = uint256(-_change);
            if (decrease >= borrower.creditScore) {
                borrower.creditScore = 300; // Minimum score
            } else {
                borrower.creditScore = borrower.creditScore.sub(decrease);
            }
        }
    }

    /**
     * @dev Get loan details
     */
    function getLoanDetails(uint256 _loanId) external view loanExists(_loanId) returns (
        address borrower,
        address lender,
        uint256 principalAmount,
        uint256 interestRate,
        uint256 installmentAmount,
        uint256 installmentsPaid,
        uint256 totalInstallments,
        LoanStatus status,
        uint256 nextPaymentDue
    ) {
        Loan storage loan = loans[_loanId];
        return (
            loan.borrower,
            loan.lender,
            loan.principalAmount,
            loan.interestRate,
            loan.installmentAmount,
            loan.installmentsPaid,
            loan.totalInstallments,
            loan.status,
            loan.nextPaymentDue
        );
    }

    /**
     * @dev Get borrower information
     */
    function getBorrowerInfo(address _borrower) external view returns (
        uint256 creditScore,
        uint256 totalBorrowed,
        uint256 totalRepaid,
        uint256 activeLoans,
        uint256 completedLoans,
        uint256 defaultedLoans,
        bool isBlacklisted
    ) {
        Borrower storage borrower = borrowers[_borrower];
        return (
            borrower.creditScore,
            borrower.totalBorrowed,
            borrower.totalRepaid,
            borrower.activeLoans,
            borrower.completedLoans,
            borrower.defaultedLoans,
            borrower.isBlacklisted
        );
    }

    /**
     * @dev Get lender available funds
     */
    function getLenderFunds(address _lender, address _token) external view returns (uint256) {
        return lenders[_lender].availableFunds[_token];
    }

    /**
     * @dev Update platform settings (only owner)
     */
    function updateSettings(
        uint256 _platformFee,
        uint256 _latePenaltyRate,
        uint256 _maxLoanAmount,
        uint256 _minCreditScore
    ) external onlyOwner {
        require(_platformFee <= 1000, "Platform fee too high");
        require(_latePenaltyRate <= 2000, "Penalty rate too high");
        
        platformFee = _platformFee;
        latePenaltyRate = _latePenaltyRate;
        maxLoanAmount = _maxLoanAmount;
        minCreditScore = _minCreditScore;
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
