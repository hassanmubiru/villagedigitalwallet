// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title VillageWallet
 * @dev Main contract for Village Digital Wallet system
 * Manages user accounts, balances, and core wallet functionality
 */
contract VillageWallet is ReentrancyGuard, Pausable, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Events
    event UserRegistered(address indexed user, string phoneNumber, string country);
    event DepositMade(address indexed user, address indexed token, uint256 amount);
    event WithdrawalMade(address indexed user, address indexed token, uint256 amount);
    event TransferMade(address indexed from, address indexed to, address indexed token, uint256 amount);
    event AgentRegistered(address indexed agent, string location, uint256 commission);
    event CashInOutCompleted(address indexed user, address indexed agent, uint256 amount, bool isCashIn);

    // Structs
    struct User {
        string phoneNumber;
        string country;
        bool isRegistered;
        bool isVerified;
        uint256 registrationTime;
        uint256 totalTransactions;
        uint256 creditScore;
    }

    struct Agent {
        string location;
        string businessName;
        uint256 commissionRate; // in basis points (100 = 1%)
        bool isActive;
        uint256 totalVolume;
        uint256 successfulTransactions;
        uint256 registrationTime;
    }

    struct Balance {
        uint256 available;
        uint256 locked; // for pending transactions
    }

    // State variables
    mapping(address => User) public users;
    mapping(address => Agent) public agents;
    mapping(address => mapping(address => Balance)) public balances; // user => token => balance
    mapping(string => address) public phoneToAddress; // phone number to address mapping
    
    // Supported tokens
    mapping(address => bool) public supportedTokens;
    address[] public tokenList;
    
    // Platform settings
    uint256 public platformFee = 50; // 0.5% in basis points
    uint256 public agentCommission = 100; // 1% in basis points
    address public feeReceiver;
    
    // Transaction limits
    uint256 public dailyLimit = 10000 * 10**18; // 10,000 tokens
    uint256 public monthlyLimit = 100000 * 10**18; // 100,000 tokens
    mapping(address => mapping(uint256 => uint256)) public dailySpent; // user => day => amount
    mapping(address => mapping(uint256 => uint256)) public monthlySpent; // user => month => amount

    constructor(address _feeReceiver) {
        feeReceiver = _feeReceiver;
    }

    modifier onlyRegisteredUser() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }

    modifier onlyVerifiedUser() {
        require(users[msg.sender].isVerified, "User not verified");
        _;
    }

    modifier onlyActiveAgent() {
        require(agents[msg.sender].isActive, "Agent not active");
        _;
    }

    modifier supportedToken(address token) {
        require(supportedTokens[token], "Token not supported");
        _;
    }

    /**
     * @dev Register a new user
     */
    function registerUser(string memory _phoneNumber, string memory _country) external {
        require(!users[msg.sender].isRegistered, "User already registered");
        require(phoneToAddress[_phoneNumber] == address(0), "Phone number already registered");
        
        users[msg.sender] = User({
            phoneNumber: _phoneNumber,
            country: _country,
            isRegistered: true,
            isVerified: false,
            registrationTime: block.timestamp,
            totalTransactions: 0,
            creditScore: 500 // Starting credit score
        });
        
        phoneToAddress[_phoneNumber] = msg.sender;
        
        emit UserRegistered(msg.sender, _phoneNumber, _country);
    }

    /**
     * @dev Verify user (only owner can verify)
     */
    function verifyUser(address _user) external onlyOwner {
        require(users[_user].isRegistered, "User not registered");
        users[_user].isVerified = true;
    }

    /**
     * @dev Register a new agent
     */
    function registerAgent(
        string memory _location,
        string memory _businessName,
        uint256 _commissionRate
    ) external {
        require(!agents[msg.sender].isActive, "Agent already registered");
        require(_commissionRate <= 1000, "Commission rate too high"); // Max 10%
        
        agents[msg.sender] = Agent({
            location: _location,
            businessName: _businessName,
            commissionRate: _commissionRate,
            isActive: true,
            totalVolume: 0,
            successfulTransactions: 0,
            registrationTime: block.timestamp
        });
        
        emit AgentRegistered(msg.sender, _location, _commissionRate);
    }

    /**
     * @dev Add supported token (only owner)
     */
    function addSupportedToken(address _token) external onlyOwner {
        require(!supportedTokens[_token], "Token already supported");
        supportedTokens[_token] = true;
        tokenList.push(_token);
    }

    /**
     * @dev Remove supported token (only owner)
     */
    function removeSupportedToken(address _token) external onlyOwner {
        require(supportedTokens[_token], "Token not supported");
        supportedTokens[_token] = false;
        
        // Remove from tokenList
        for (uint i = 0; i < tokenList.length; i++) {
            if (tokenList[i] == _token) {
                tokenList[i] = tokenList[tokenList.length - 1];
                tokenList.pop();
                break;
            }
        }
    }

    /**
     * @dev Deposit tokens to wallet
     */
    function deposit(address _token, uint256 _amount) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyRegisteredUser 
        supportedToken(_token) 
    {
        require(_amount > 0, "Amount must be greater than 0");
        
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        balances[msg.sender][_token].available = balances[msg.sender][_token].available.add(_amount);
        
        emit DepositMade(msg.sender, _token, _amount);
    }

    /**
     * @dev Withdraw tokens from wallet
     */
    function withdraw(address _token, uint256 _amount) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyVerifiedUser 
        supportedToken(_token) 
    {
        require(_amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender][_token].available >= _amount, "Insufficient balance");
        require(_checkLimits(msg.sender, _amount), "Transaction limit exceeded");
        
        balances[msg.sender][_token].available = balances[msg.sender][_token].available.sub(_amount);
        
        // Calculate and deduct platform fee
        uint256 fee = _amount.mul(platformFee).div(10000);
        uint256 amountAfterFee = _amount.sub(fee);
        
        IERC20(_token).safeTransfer(msg.sender, amountAfterFee);
        if (fee > 0) {
            IERC20(_token).safeTransfer(feeReceiver, fee);
        }
        
        _updateSpentAmounts(msg.sender, _amount);
        users[msg.sender].totalTransactions++;
        
        emit WithdrawalMade(msg.sender, _token, amountAfterFee);
    }

    /**
     * @dev Transfer tokens between users
     */
    function transfer(address _to, address _token, uint256 _amount) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyVerifiedUser 
        supportedToken(_token) 
    {
        require(_to != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be greater than 0");
        require(users[_to].isRegistered, "Recipient not registered");
        require(balances[msg.sender][_token].available >= _amount, "Insufficient balance");
        require(_checkLimits(msg.sender, _amount), "Transaction limit exceeded");
        
        // Calculate fee
        uint256 fee = _amount.mul(platformFee).div(10000);
        uint256 amountAfterFee = _amount.sub(fee);
        
        // Update balances
        balances[msg.sender][_token].available = balances[msg.sender][_token].available.sub(_amount);
        balances[_to][_token].available = balances[_to][_token].available.add(amountAfterFee);
        
        // Transfer fee to platform
        if (fee > 0) {
            balances[feeReceiver][_token].available = balances[feeReceiver][_token].available.add(fee);
        }
        
        _updateSpentAmounts(msg.sender, _amount);
        users[msg.sender].totalTransactions++;
        users[_to].totalTransactions++;
        
        // Update credit scores
        _updateCreditScore(msg.sender, true);
        _updateCreditScore(_to, true);
        
        emit TransferMade(msg.sender, _to, _token, amountAfterFee);
    }

    /**
     * @dev Cash-in operation (agent to user)
     */
    function cashIn(address _user, address _token, uint256 _amount) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyActiveAgent 
        supportedToken(_token) 
    {
        require(_user != address(0), "Invalid user");
        require(_amount > 0, "Amount must be greater than 0");
        require(users[_user].isRegistered, "User not registered");
        require(balances[msg.sender][_token].available >= _amount, "Insufficient agent balance");
        
        // Calculate agent commission
        uint256 commission = _amount.mul(agents[msg.sender].commissionRate).div(10000);
        uint256 userAmount = _amount.sub(commission);
        
        // Update balances
        balances[msg.sender][_token].available = balances[msg.sender][_token].available.sub(_amount);
        balances[_user][_token].available = balances[_user][_token].available.add(userAmount);
        if (commission > 0) {
            balances[msg.sender][_token].available = balances[msg.sender][_token].available.add(commission);
        }
        
        // Update agent stats
        agents[msg.sender].totalVolume = agents[msg.sender].totalVolume.add(_amount);
        agents[msg.sender].successfulTransactions++;
        
        emit CashInOutCompleted(_user, msg.sender, userAmount, true);
    }

    /**
     * @dev Cash-out operation (user to agent)
     */
    function cashOut(address _agent, address _token, uint256 _amount) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyVerifiedUser 
        supportedToken(_token) 
    {
        require(_agent != address(0), "Invalid agent");
        require(_amount > 0, "Amount must be greater than 0");
        require(agents[_agent].isActive, "Agent not active");
        require(balances[msg.sender][_token].available >= _amount, "Insufficient balance");
        require(_checkLimits(msg.sender, _amount), "Transaction limit exceeded");
        
        // Calculate agent commission
        uint256 commission = _amount.mul(agents[_agent].commissionRate).div(10000);
        uint256 agentAmount = _amount.sub(commission);
        
        // Update balances
        balances[msg.sender][_token].available = balances[msg.sender][_token].available.sub(_amount);
        balances[_agent][_token].available = balances[_agent][_token].available.add(agentAmount);
        if (commission > 0) {
            balances[_agent][_token].available = balances[_agent][_token].available.add(commission);
        }
        
        _updateSpentAmounts(msg.sender, _amount);
        users[msg.sender].totalTransactions++;
        
        // Update agent stats
        agents[_agent].totalVolume = agents[_agent].totalVolume.add(_amount);
        agents[_agent].successfulTransactions++;
        
        emit CashInOutCompleted(msg.sender, _agent, agentAmount, false);
    }

    /**
     * @dev Get user balance for a specific token
     */
    function getBalance(address _user, address _token) external view returns (uint256 available, uint256 locked) {
        return (balances[_user][_token].available, balances[_user][_token].locked);
    }

    /**
     * @dev Get user by phone number
     */
    function getUserByPhone(string memory _phoneNumber) external view returns (address) {
        return phoneToAddress[_phoneNumber];
    }

    /**
     * @dev Get supported tokens list
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return tokenList;
    }

    /**
     * @dev Check transaction limits
     */
    function _checkLimits(address _user, uint256 _amount) internal view returns (bool) {
        uint256 currentDay = block.timestamp / 86400; // seconds in a day
        uint256 currentMonth = block.timestamp / (86400 * 30); // approximate month
        
        return (
            dailySpent[_user][currentDay].add(_amount) <= dailyLimit &&
            monthlySpent[_user][currentMonth].add(_amount) <= monthlyLimit
        );
    }

    /**
     * @dev Update spent amounts for limits
     */
    function _updateSpentAmounts(address _user, uint256 _amount) internal {
        uint256 currentDay = block.timestamp / 86400;
        uint256 currentMonth = block.timestamp / (86400 * 30);
        
        dailySpent[_user][currentDay] = dailySpent[_user][currentDay].add(_amount);
        monthlySpent[_user][currentMonth] = monthlySpent[_user][currentMonth].add(_amount);
    }

    /**
     * @dev Update user credit score
     */
    function _updateCreditScore(address _user, bool isPositive) internal {
        if (isPositive && users[_user].creditScore < 850) {
            users[_user].creditScore = users[_user].creditScore.add(1);
        } else if (!isPositive && users[_user].creditScore > 300) {
            users[_user].creditScore = users[_user].creditScore.sub(5);
        }
    }

    /**
     * @dev Update transaction limits (only owner)
     */
    function updateLimits(uint256 _dailyLimit, uint256 _monthlyLimit) external onlyOwner {
        dailyLimit = _dailyLimit;
        monthlyLimit = _monthlyLimit;
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 1000, "Platform fee too high"); // Max 10%
        platformFee = _platformFee;
    }

    /**
     * @dev Update fee receiver (only owner)
     */
    function updateFeeReceiver(address _feeReceiver) external onlyOwner {
        require(_feeReceiver != address(0), "Invalid fee receiver");
        feeReceiver = _feeReceiver;
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

    /**
     * @dev Emergency withdrawal (only owner, when paused)
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner whenPaused {
        IERC20(_token).safeTransfer(owner(), _amount);
    }
}
