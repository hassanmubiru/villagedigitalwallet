// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MicroloanSystem
 * @dev Smart contract for managing microloans in the Village Digital Wallet platform
 */
contract MicroloanSystem is Ownable, ReentrancyGuard {
    // Token used for loans (e.g., cUSD)
    IERC20 public loanToken;
    
    // Loan status enum
    enum LoanStatus { Pending, Active, Repaid, Defaulted, Rejected }
    
    // Loan structure
    struct Loan {
        uint256 id;
        address borrower;
        uint256 amount;
        uint256 interestRate; // In basis points (1/100 of a percent)
        uint256 termDays;
        uint256 issuedTime;
        uint256 dueTime;
        uint256 repaidAmount;
        LoanStatus status;
        bool isGroupLoan; // Whether this is from a savings group or direct lender
        address groupAddress; // If it's a group loan, the address of the group contract
        string purpose; // Purpose of the loan
    }
    
    // Payment record
    struct Payment {
        uint256 loanId;
        uint256 amount;
        uint256 timestamp;
        address payer;
    }
    
    // Borrower history for credit scoring
    struct BorrowerProfile {
        uint256 totalBorrowed;
        uint256 totalRepaid;
        uint256 loansCompleted;
        uint256 loansDefaulted;
        uint256 creditScore; // 0-1000 scale
        uint256 lastLoanId;
    }
    
    // Lender structure (can be a savings group or a partner lender)
    struct Lender {
        address lenderAddress;
        string name;
        bool isActive;
        uint256 totalFundsAvailable;
        uint256 totalLoaned;
        uint256 totalRepaid;
        uint256 maxLoanAmount;
        uint256 baseInterestRate; // In basis points
    }
    
    // Contract state variables
    uint256 public nextLoanId;
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => Payment[]) public loanPayments;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => BorrowerProfile) public borrowerProfiles;
    mapping(address => bool) public approvedLenders;
    mapping(address => Lender) public lenders;
    address[] public lenderAddresses;
    
    // System settings
    uint256 public minLoanAmount;
    uint256 public maxLoanAmount;
    uint256 public minTermDays;
    uint256 public maxTermDays;
    uint256 public platformFeePercent; // In basis points
    address public feeCollector;
    
    // Events
    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanApproved(uint256 indexed loanId, address indexed lender);
    event LoanRejected(uint256 indexed loanId, string reason);
    event LoanRepayment(uint256 indexed loanId, address indexed payer, uint256 amount);
    event LoanFullyRepaid(uint256 indexed loanId);
    event LoanDefaulted(uint256 indexed loanId);
    event LenderAdded(address indexed lender, string name);
    event LenderRemoved(address indexed lender);
    event CreditScoreUpdated(address indexed borrower, uint256 newScore);
    
    /**
     * @dev Constructor for creating the microloan system
     */
    constructor(
        address initialOwner,
        address _loanTokenAddress,
        address _feeCollector,
        uint256 _platformFeePercent
    ) {
        _transferOwnership(initialOwner); // Use _transferOwnership instead of constructor parameter
        loanToken = IERC20(_loanTokenAddress);
        feeCollector = _feeCollector;
        platformFeePercent = _platformFeePercent;
        
        // Set default system parameters
        minLoanAmount = 10 * 10**18; // 10 tokens
        maxLoanAmount = 1000 * 10**18; // 1000 tokens
        minTermDays = 7; // 1 week
        maxTermDays = 365; // 1 year
        nextLoanId = 1;
    }
    
    /**
     * @dev Add a new lender to the system
     */
    function addLender(
        address _lenderAddress,
        string memory _name,
        uint256 _maxLoanAmount,
        uint256 _baseInterestRate
    ) public onlyOwner {
        require(!approvedLenders[_lenderAddress], "Lender already exists");
        
        approvedLenders[_lenderAddress] = true;
        lenderAddresses.push(_lenderAddress);
        
        lenders[_lenderAddress] = Lender({
            lenderAddress: _lenderAddress,
            name: _name,
            isActive: true,
            totalFundsAvailable: 0,
            totalLoaned: 0,
            totalRepaid: 0,
            maxLoanAmount: _maxLoanAmount,
            baseInterestRate: _baseInterestRate
        });
        
        emit LenderAdded(_lenderAddress, _name);
    }
    
    /**
     * @dev Remove a lender from the system
     */
    function removeLender(address _lenderAddress) public onlyOwner {
        require(approvedLenders[_lenderAddress], "Lender does not exist");
        
        approvedLenders[_lenderAddress] = false;
        lenders[_lenderAddress].isActive = false;
        
        emit LenderRemoved(_lenderAddress);
    }
    
    /**
     * @dev Allow a lender to deposit funds available for loans
     */
    function depositLenderFunds(uint256 _amount) public {
        require(approvedLenders[msg.sender], "Not an approved lender");
        require(lenders[msg.sender].isActive, "Lender is not active");
        
        // Transfer tokens from lender to contract
        require(loanToken.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");
        
        // Update lender's available funds
        lenders[msg.sender].totalFundsAvailable += _amount;
    }
    
    /**
     * @dev Allow a lender to withdraw funds
     */
    function withdrawLenderFunds(uint256 _amount) public nonReentrant {
        require(approvedLenders[msg.sender], "Not an approved lender");
        require(_amount <= lenders[msg.sender].totalFundsAvailable, "Insufficient available funds");
        
        // Update lender's available funds
        lenders[msg.sender].totalFundsAvailable -= _amount;
        
        // Transfer tokens from contract to lender
        require(loanToken.transfer(msg.sender, _amount), "Token transfer failed");
    }
    
    /**
     * @dev Request a loan from a specific lender
     */
    function requestLoan(
        address _lenderAddress,
        uint256 _amount,
        uint256 _termDays,
        string memory _purpose
    ) public returns (uint256) {
        require(_amount >= minLoanAmount && _amount <= maxLoanAmount, "Invalid loan amount");
        require(_termDays >= minTermDays && _termDays <= maxTermDays, "Invalid term length");
        require(approvedLenders[_lenderAddress], "Not an approved lender");
        require(lenders[_lenderAddress].isActive, "Lender is not active");
        require(_amount <= lenders[_lenderAddress].maxLoanAmount, "Amount exceeds lender's maximum");
        require(_amount <= lenders[_lenderAddress].totalFundsAvailable, "Insufficient lender funds");
        
        // Check if borrower has any defaulted loans
        require(!hasBorrowerDefaulted(msg.sender), "Cannot request with defaulted loans");
        
        // Create the loan request
        uint256 loanId = nextLoanId++;
        uint256 interestRate = calculateInterestRate(_lenderAddress, msg.sender, _amount, _termDays);
        
        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            amount: _amount,
            interestRate: interestRate,
            termDays: _termDays,
            issuedTime: block.timestamp,
            dueTime: block.timestamp + (_termDays * 1 days),
            repaidAmount: 0,
            status: LoanStatus.Pending,
            isGroupLoan: false,
            groupAddress: address(0),
            purpose: _purpose
        });
        
        borrowerLoans[msg.sender].push(loanId);
        
        emit LoanRequested(loanId, msg.sender, _amount);
        
        // For demonstration purposes, automatically approve the loan
        approveLoan(loanId);
        
        return loanId;
    }
    
    /**
     * @dev Request a group loan from a savings group
     */
    function requestGroupLoan(
        address _groupAddress,
        uint256 _amount,
        uint256 _termDays,
        string memory _purpose
    ) public returns (uint256) {
        // TODO: Implement group membership check
        require(_amount >= minLoanAmount && _amount <= maxLoanAmount, "Invalid loan amount");
        require(_termDays >= minTermDays && _termDays <= maxTermDays, "Invalid term length");
        
        // Check if the group has sufficient funds
        // TODO: Implement check against group balance
        
        // Check if borrower has any defaulted loans
        require(!hasBorrowerDefaulted(msg.sender), "Cannot request with defaulted loans");
        
        // Create the loan request
        uint256 loanId = nextLoanId++;
        uint256 interestRate = 500; // 5% interest rate for group loans
        
        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            amount: _amount,
            interestRate: interestRate,
            termDays: _termDays,
            issuedTime: block.timestamp,
            dueTime: block.timestamp + (_termDays * 1 days),
            repaidAmount: 0,
            status: LoanStatus.Pending,
            isGroupLoan: true,
            groupAddress: _groupAddress,
            purpose: _purpose
        });
        
        borrowerLoans[msg.sender].push(loanId);
        
        emit LoanRequested(loanId, msg.sender, _amount);
        
        // For group loans, would need approval from group governance
        // For demo, automatically approve
        approveLoan(loanId);
        
        return loanId;
    }
    
    /**
     * @dev Approve a loan request
     */
    function approveLoan(uint256 _loanId) public {
        Loan storage loan = loans[_loanId];
        
        // For regular loans, only the lender can approve
        if (!loan.isGroupLoan) {
            require(msg.sender == owner() || msg.sender == loan.groupAddress, "Not authorized to approve");
        }
        // For group loans, would need to implement group governance
        
        require(loan.status == LoanStatus.Pending, "Loan is not pending");
        
        // Update loan status
        loan.status = LoanStatus.Active;
        loan.issuedTime = block.timestamp;
        loan.dueTime = block.timestamp + (loan.termDays * 1 days);
        
        // Update lender's stats
        if (!loan.isGroupLoan) {
            address lenderAddress = loan.groupAddress == address(0) ? owner() : loan.groupAddress;
            lenders[lenderAddress].totalLoaned += loan.amount;
            lenders[lenderAddress].totalFundsAvailable -= loan.amount;
        }
        
        // Update borrower's stats
        borrowerProfiles[loan.borrower].totalBorrowed += loan.amount;
        borrowerProfiles[loan.borrower].lastLoanId = _loanId;
        
        // Transfer tokens from contract to borrower
        require(loanToken.transfer(loan.borrower, loan.amount), "Token transfer failed");
        
        emit LoanApproved(_loanId, msg.sender);
    }
    
    /**
     * @dev Reject a loan request
     */
    function rejectLoan(uint256 _loanId, string memory _reason) public {
        Loan storage loan = loans[_loanId];
        
        // For regular loans, only the lender can reject
        if (!loan.isGroupLoan) {
            require(msg.sender == owner() || msg.sender == loan.groupAddress, "Not authorized to reject");
        }
        // For group loans, would need to implement group governance
        
        require(loan.status == LoanStatus.Pending, "Loan is not pending");
        
        // Update loan status
        loan.status = LoanStatus.Rejected;
        
        emit LoanRejected(_loanId, _reason);
    }
    
    /**
     * @dev Make a loan repayment
     */
    function repayLoan(uint256 _loanId, uint256 _amount) public nonReentrant {
        Loan storage loan = loans[_loanId];
        
        require(loan.status == LoanStatus.Active, "Loan is not active");
        require(_amount > 0, "Amount must be greater than zero");
        
        // Calculate the total amount due
        uint256 totalDue = calculateTotalDue(loan);
        uint256 remainingDue = totalDue - loan.repaidAmount;
        
        // Cap repayment at the remaining balance due
        uint256 repayAmount = _amount > remainingDue ? remainingDue : _amount;
        
        // Transfer tokens from borrower to contract
        require(loanToken.transferFrom(msg.sender, address(this), repayAmount), "Token transfer failed");
        
        // Update loan status
        loan.repaidAmount += repayAmount;
        
        // Add payment record
        loanPayments[_loanId].push(Payment({
            loanId: _loanId,
            amount: repayAmount,
            timestamp: block.timestamp,
            payer: msg.sender
        }));
        
        // Calculate platform fee
        uint256 platformFee = (repayAmount * platformFeePercent) / 10000;
        uint256 lenderAmount = repayAmount - platformFee;
        
        // Transfer platform fee to fee collector
        if (platformFee > 0) {
            loanToken.transfer(feeCollector, platformFee);
        }
        
        // Transfer remainder to lender
        if (!loan.isGroupLoan) {
            address lenderAddress = loan.groupAddress == address(0) ? owner() : loan.groupAddress;
            lenders[lenderAddress].totalRepaid += lenderAmount;
            lenders[lenderAddress].totalFundsAvailable += lenderAmount;
            // Token transfer is handled by the contract
        } else {
            // For group loans, transfer to the group contract
            loanToken.transfer(loan.groupAddress, lenderAmount);
        }
        
        // Update borrower profile
        borrowerProfiles[loan.borrower].totalRepaid += repayAmount;
        
        // Emit repayment event
        emit LoanRepayment(_loanId, msg.sender, repayAmount);
        
        // Check if loan is fully repaid
        if (loan.repaidAmount >= totalDue) {
            loan.status = LoanStatus.Repaid;
            borrowerProfiles[loan.borrower].loansCompleted += 1;
            updateCreditScore(loan.borrower);
            emit LoanFullyRepaid(_loanId);
        }
    }
    
    /**
     * @dev Mark a loan as defaulted
     */
    function markAsDefaulted(uint256 _loanId) public onlyOwner {
        Loan storage loan = loans[_loanId];
        
        require(loan.status == LoanStatus.Active, "Loan is not active");
        require(block.timestamp > loan.dueTime, "Loan is not yet overdue");
        
        loan.status = LoanStatus.Defaulted;
        borrowerProfiles[loan.borrower].loansDefaulted += 1;
        
        // Update credit score
        updateCreditScore(loan.borrower);
        
        emit LoanDefaulted(_loanId);
    }
    
    /**
     * @dev Calculate the total amount due for a loan
     */
    function calculateTotalDue(Loan memory _loan) public pure returns (uint256) {
        uint256 interestAmount = (_loan.amount * _loan.interestRate) / 10000;
        return _loan.amount + interestAmount;
    }
    
    /**
     * @dev Calculate interest rate based on borrower's credit profile and loan details
     */
    function calculateInterestRate(
        address _lenderAddress,
        address _borrower,
        uint256 _amount,
        uint256 _termDays
    ) public view returns (uint256) {
        // Start with lender's base interest rate
        uint256 interestRate = lenders[_lenderAddress].baseInterestRate;
        
        // Adjust based on borrower's credit score
        uint256 creditScore = borrowerProfiles[_borrower].creditScore;
        if (creditScore > 0) {
            // Reduce interest rate for higher credit scores
            if (creditScore >= 800) {
                interestRate = interestRate * 80 / 100; // 20% reduction
            } else if (creditScore >= 650) {
                interestRate = interestRate * 90 / 100; // 10% reduction
            }
        } else {
            // No credit history, add a risk premium
            interestRate += 200; // Add 2%
        }
        
        // Adjust based on loan amount and term
        if (_amount > 500 * 10**18) {
            interestRate += 100; // Add 1% for larger loans
        }
        
        if (_termDays > 180) {
            interestRate += 150; // Add 1.5% for longer terms
        }
        
        return interestRate;
    }
    
    /**
     * @dev Check if a borrower has any defaulted loans
     */
    function hasBorrowerDefaulted(address _borrower) public view returns (bool) {
        uint256[] memory userLoans = borrowerLoans[_borrower];
        
        for (uint256 i = 0; i < userLoans.length; i++) {
            if (loans[userLoans[i]].status == LoanStatus.Defaulted) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Update a borrower's credit score based on loan history
     */
    function updateCreditScore(address _borrower) internal {
        BorrowerProfile storage profile = borrowerProfiles[_borrower];
        
        // Simple credit score calculation
        uint256 newScore = 500; // Base score
        
        // Increase score based on successful repayments
        if (profile.loansCompleted > 0) {
            newScore += profile.loansCompleted * 50;
        }
        
        // Decrease score for defaults
        if (profile.loansDefaulted > 0) {
            newScore -= profile.loansDefaulted * 100;
        }
        
        // Cap score between 0-1000
        if (newScore > 1000) newScore = 1000;
        if (newScore < 0) newScore = 0;
        
        profile.creditScore = newScore;
        
        emit CreditScoreUpdated(_borrower, newScore);
    }
    
    /**
     * @dev Get all loans for a borrower
     */
    function getBorrowerLoans(address _borrower) public view returns (uint256[] memory) {
        return borrowerLoans[_borrower];
    }
    
    /**
     * @dev Get loan details
     */
    function getLoanDetails(uint256 _loanId) public view returns (
        address borrower,
        uint256 amount,
        uint256 interestRate,
        uint256 termDays,
        uint256 issuedTime,
        uint256 dueTime,
        uint256 repaidAmount,
        LoanStatus status,
        bool isGroupLoan,
        address groupAddress,
        string memory purpose
    ) {
        Loan memory loan = loans[_loanId];
        return (
            loan.borrower,
            loan.amount,
            loan.interestRate,
            loan.termDays,
            loan.issuedTime,
            loan.dueTime,
            loan.repaidAmount,
            loan.status,
            loan.isGroupLoan,
            loan.groupAddress,
            loan.purpose
        );
    }
    
    /**
     * @dev Get loan payment history
     */
    function getLoanPayments(uint256 _loanId) public view returns (
        uint256[] memory amounts,
        uint256[] memory timestamps,
        address[] memory payers
    ) {
        Payment[] memory payments = loanPayments[_loanId];
        uint256 count = payments.length;
        
        amounts = new uint256[](count);
        timestamps = new uint256[](count);
        payers = new address[](count);
        
        for (uint256 i = 0; i < count; i++) {
            amounts[i] = payments[i].amount;
            timestamps[i] = payments[i].timestamp;
            payers[i] = payments[i].payer;
        }
        
        return (amounts, timestamps, payers);
    }
    
    /**
     * @dev Update system parameters (admin only)
     */
    function updateSystemParameters(
        uint256 _minLoanAmount,
        uint256 _maxLoanAmount,
        uint256 _minTermDays,
        uint256 _maxTermDays,
        uint256 _platformFeePercent
    ) public onlyOwner {
        minLoanAmount = _minLoanAmount;
        maxLoanAmount = _maxLoanAmount;
        minTermDays = _minTermDays;
        maxTermDays = _maxTermDays;
        platformFeePercent = _platformFeePercent;
    }
    
    /**
     * @dev Update fee collector address (admin only)
     */
    function updateFeeCollector(address _newFeeCollector) public onlyOwner {
        feeCollector = _newFeeCollector;
    }
    
    /**
     * @dev Emergency function to recover tokens accidentally sent to the contract
     */
    function recoverTokens(address _tokenAddress, uint256 _amount) public onlyOwner {
        IERC20(_tokenAddress).transfer(owner(), _amount);
    }
}
