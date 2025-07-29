// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title VillageAutomation
 * @dev Automated systems for village wallet operations including savings, loans, and governance
 */
contract VillageAutomation is ReentrancyGuard, AccessControl {
    using SafeMath for uint256;

    bytes32 public constant AUTOMATION_ADMIN_ROLE = keccak256("AUTOMATION_ADMIN_ROLE");
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");

    IERC20 public immutable celoToken;

    // Automation types
    enum AutomationType {
        SAVINGS_CONTRIBUTION,
        LOAN_REPAYMENT,
        INTEREST_CALCULATION,
        GOVERNANCE_EXECUTION,
        REPUTATION_UPDATE,
        EMERGENCY_LIQUIDATION
    }

    struct AutomationTask {
        uint256 taskId;
        AutomationType taskType;
        address target;
        uint256 amount;
        uint256 frequency; // In seconds
        uint256 nextExecution;
        bool isActive;
        bool isRecurring;
        bytes taskData;
        address creator;
        uint256 createdAt;
    }

    struct SavingsAutomation {
        address member;
        uint256 contributionAmount;
        uint256 frequency; // Daily, weekly, monthly
        uint256 nextContribution;
        bool isActive;
        uint256 totalContributed;
    }

    struct LoanRepaymentAutomation {
        uint256 loanId;
        address borrower;
        uint256 installmentAmount;
        uint256 frequency;
        uint256 nextPayment;
        uint256 remainingPayments;
        bool isActive;
    }

    struct InterestCalculation {
        address target; // Savings group or loan contract
        uint256 rate;
        uint256 frequency;
        uint256 lastCalculation;
        bool isActive;
        bool isCompounding;
    }

    // Storage
    mapping(uint256 => AutomationTask) public automationTasks;
    mapping(address => SavingsAutomation) public savingsAutomations;
    mapping(uint256 => LoanRepaymentAutomation) public loanRepaymentAutomations;
    mapping(address => InterestCalculation) public interestCalculations;
    
    uint256 public nextTaskId;
    uint256[] public activeTasks;
    
    // Emergency controls
    bool public emergencyPaused;
    uint256 public emergencyThreshold; // Maximum amount for emergency actions
    
    // Events
    event AutomationTaskCreated(
        uint256 indexed taskId,
        AutomationType taskType,
        address indexed target,
        address indexed creator
    );
    event AutomationTaskExecuted(
        uint256 indexed taskId,
        AutomationType taskType,
        bool success,
        bytes result
    );
    event SavingsAutomationStarted(
        address indexed member,
        uint256 amount,
        uint256 frequency
    );
    event LoanRepaymentAutomationStarted(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 installmentAmount
    );
    event InterestCalculationStarted(
        address indexed target,
        uint256 rate,
        uint256 frequency
    );
    event EmergencyAction(
        AutomationType actionType,
        address indexed target,
        uint256 amount
    );

    modifier onlyAutomationAdmin() {
        require(hasRole(AUTOMATION_ADMIN_ROLE, msg.sender), "Not an automation admin");
        _;
    }

    modifier onlyKeeper() {
        require(hasRole(KEEPER_ROLE, msg.sender), "Not a keeper");
        _;
    }

    modifier whenNotPaused() {
        require(!emergencyPaused, "Automation is paused");
        _;
    }

    constructor(address _celoToken, address admin) {
        celoToken = IERC20(_celoToken);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(AUTOMATION_ADMIN_ROLE, admin);
        _grantRole(KEEPER_ROLE, admin);
        
        emergencyThreshold = 10000 * 10**18; // 10,000 CELO
    }

    /**
     * @dev Check if any tasks need execution (simplified version without Chainlink)
     */
    function checkUpkeep() external view returns (bool upkeepNeeded, bytes memory performData) {
        if (emergencyPaused) {
            return (false, "");
        }

        // Check for tasks that need execution
        uint256[] memory tasksToExecute = new uint256[](activeTasks.length);
        uint256 taskCount = 0;

        for (uint256 i = 0; i < activeTasks.length; i++) {
            uint256 taskId = activeTasks[i];
            AutomationTask storage task = automationTasks[taskId];
            
            if (task.isActive && block.timestamp >= task.nextExecution) {
                tasksToExecute[taskCount] = taskId;
                taskCount++;
            }
        }

        if (taskCount > 0) {
            // Encode tasks to execute
            uint256[] memory tasksArray = new uint256[](taskCount);
            for (uint256 i = 0; i < taskCount; i++) {
                tasksArray[i] = tasksToExecute[i];
            }
            return (true, abi.encode(tasksArray));
        }

        return (false, "");
    }

    /**
     * @dev Execute automation tasks (simplified version without Chainlink)
     */
    function performUpkeep(bytes calldata performData) external onlyKeeper {
        uint256[] memory tasksToExecute = abi.decode(performData, (uint256[]));
        
        for (uint256 i = 0; i < tasksToExecute.length; i++) {
            _executeTask(tasksToExecute[i]);
        }
    }

    /**
     * @dev Create automated savings contributions
     */
    function createSavingsAutomation(
        uint256 contributionAmount,
        uint256 frequency // 1 day = 86400, 1 week = 604800, 1 month = 2629746
    ) external whenNotPaused {
        require(contributionAmount > 0, "Contribution amount must be positive");
        require(frequency >= 86400, "Frequency must be at least 1 day");

        savingsAutomations[msg.sender] = SavingsAutomation({
            member: msg.sender,
            contributionAmount: contributionAmount,
            frequency: frequency,
            nextContribution: block.timestamp + frequency,
            isActive: true,
            totalContributed: 0
        });

        uint256 taskId = _createTask(
            AutomationType.SAVINGS_CONTRIBUTION,
            msg.sender,
            contributionAmount,
            frequency,
            true,
            abi.encode(msg.sender, contributionAmount)
        );

        emit SavingsAutomationStarted(msg.sender, contributionAmount, frequency);
    }

    /**
     * @dev Create automated loan repayments
     */
    function createLoanRepaymentAutomation(
        uint256 loanId,
        uint256 installmentAmount,
        uint256 frequency,
        uint256 totalPayments
    ) external whenNotPaused {
        require(installmentAmount > 0, "Installment amount must be positive");
        require(totalPayments > 0, "Total payments must be positive");

        loanRepaymentAutomations[loanId] = LoanRepaymentAutomation({
            loanId: loanId,
            borrower: msg.sender,
            installmentAmount: installmentAmount,
            frequency: frequency,
            nextPayment: block.timestamp + frequency,
            remainingPayments: totalPayments,
            isActive: true
        });

        uint256 taskId = _createTask(
            AutomationType.LOAN_REPAYMENT,
            msg.sender,
            installmentAmount,
            frequency,
            true,
            abi.encode(loanId, installmentAmount)
        );

        emit LoanRepaymentAutomationStarted(loanId, msg.sender, installmentAmount);
    }

    /**
     * @dev Create automated interest calculations
     */
    function createInterestCalculation(
        address target,
        uint256 interestRate, // Basis points
        uint256 frequency,
        bool isCompounding
    ) external onlyAutomationAdmin {
        require(target != address(0), "Invalid target address");
        require(interestRate > 0, "Interest rate must be positive");

        interestCalculations[target] = InterestCalculation({
            target: target,
            rate: interestRate,
            frequency: frequency,
            lastCalculation: block.timestamp,
            isActive: true,
            isCompounding: isCompounding
        });

        uint256 taskId = _createTask(
            AutomationType.INTEREST_CALCULATION,
            target,
            interestRate,
            frequency,
            true,
            abi.encode(target, interestRate, isCompounding)
        );

        emit InterestCalculationStarted(target, interestRate, frequency);
    }

    /**
     * @dev Execute a specific automation task
     */
    function executeTask(uint256 taskId) external onlyKeeper whenNotPaused {
        _executeTask(taskId);
    }

    /**
     * @dev Internal function to execute tasks
     */
    function _executeTask(uint256 taskId) internal {
        AutomationTask storage task = automationTasks[taskId];
        require(task.isActive, "Task is not active");
        require(block.timestamp >= task.nextExecution, "Task not ready for execution");

        bool success = false;
        bytes memory result;

        if (task.taskType == AutomationType.SAVINGS_CONTRIBUTION) {
            (success, result) = _executeSavingsContribution(task);
        } else if (task.taskType == AutomationType.LOAN_REPAYMENT) {
            (success, result) = _executeLoanRepayment(task);
        } else if (task.taskType == AutomationType.INTEREST_CALCULATION) {
            (success, result) = _executeInterestCalculation(task);
        } else if (task.taskType == AutomationType.GOVERNANCE_EXECUTION) {
            (success, result) = _executeGovernanceAction(task);
        }

        // Update next execution time
        if (task.isRecurring && success) {
            task.nextExecution = block.timestamp + task.frequency;
        } else if (!task.isRecurring) {
            task.isActive = false;
        }

        emit AutomationTaskExecuted(taskId, task.taskType, success, result);
    }

    /**
     * @dev Execute savings contribution
     */
    function _executeSavingsContribution(AutomationTask storage task) 
        internal 
        returns (bool success, bytes memory result) 
    {
        (address member, uint256 amount) = abi.decode(task.taskData, (address, uint256));
        
        // Check if member has sufficient balance
        if (celoToken.balanceOf(member) >= amount) {
            // Transfer tokens to savings group (simplified)
            try celoToken.transferFrom(member, address(this), amount) {
                savingsAutomations[member].totalContributed += amount;
                savingsAutomations[member].nextContribution = block.timestamp + task.frequency;
                return (true, abi.encode("Savings contribution successful"));
            } catch {
                return (false, abi.encode("Transfer failed"));
            }
        }
        return (false, abi.encode("Insufficient balance"));
    }

    /**
     * @dev Execute loan repayment
     */
    function _executeLoanRepayment(AutomationTask storage task) 
        internal 
        returns (bool success, bytes memory result) 
    {
        (uint256 loanId, uint256 amount) = abi.decode(task.taskData, (uint256, uint256));
        
        LoanRepaymentAutomation storage automation = loanRepaymentAutomations[loanId];
        address borrower = automation.borrower;
        
        if (celoToken.balanceOf(borrower) >= amount) {
            try celoToken.transferFrom(borrower, address(this), amount) {
                automation.remainingPayments--;
                automation.nextPayment = block.timestamp + automation.frequency;
                
                if (automation.remainingPayments == 0) {
                    automation.isActive = false;
                    task.isActive = false;
                }
                
                return (true, abi.encode("Loan repayment successful"));
            } catch {
                return (false, abi.encode("Repayment transfer failed"));
            }
        }
        return (false, abi.encode("Insufficient balance for repayment"));
    }

    /**
     * @dev Execute interest calculation
     */
    function _executeInterestCalculation(AutomationTask storage task) 
        internal 
        returns (bool success, bytes memory result) 
    {
        (address target, uint256 rate, bool isCompounding) = abi.decode(
            task.taskData, 
            (address, uint256, bool)
        );
        
        InterestCalculation storage calc = interestCalculations[target];
        calc.lastCalculation = block.timestamp;
        
        // Interest calculation logic would be implemented here
        // This is a simplified version
        return (true, abi.encode("Interest calculated"));
    }

    /**
     * @dev Execute governance action
     */
    function _executeGovernanceAction(AutomationTask storage task) 
        internal 
        returns (bool success, bytes memory result) 
    {
        // Governance execution logic would be implemented here
        return (true, abi.encode("Governance action executed"));
    }

    /**
     * @dev Create a new automation task
     */
    function _createTask(
        AutomationType taskType,
        address target,
        uint256 amount,
        uint256 frequency,
        bool isRecurring,
        bytes memory taskData
    ) internal returns (uint256) {
        uint256 taskId = nextTaskId++;
        
        automationTasks[taskId] = AutomationTask({
            taskId: taskId,
            taskType: taskType,
            target: target,
            amount: amount,
            frequency: frequency,
            nextExecution: block.timestamp + frequency,
            isActive: true,
            isRecurring: isRecurring,
            taskData: taskData,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        activeTasks.push(taskId);

        emit AutomationTaskCreated(taskId, taskType, target, msg.sender);
        return taskId;
    }

    /**
     * @dev Emergency pause all automation
     */
    function emergencyPause() external onlyAutomationAdmin {
        emergencyPaused = true;
    }

    /**
     * @dev Resume automation after emergency
     */
    function emergencyResume() external onlyAutomationAdmin {
        emergencyPaused = false;
    }

    /**
     * @dev Cancel a specific automation task
     */
    function cancelTask(uint256 taskId) external {
        AutomationTask storage task = automationTasks[taskId];
        require(
            task.creator == msg.sender || hasRole(AUTOMATION_ADMIN_ROLE, msg.sender),
            "Not authorized to cancel task"
        );
        
        task.isActive = false;
        
        // Remove from active tasks array
        for (uint256 i = 0; i < activeTasks.length; i++) {
            if (activeTasks[i] == taskId) {
                activeTasks[i] = activeTasks[activeTasks.length - 1];
                activeTasks.pop();
                break;
            }
        }
    }

    /**
     * @dev Get task details
     */
    function getTask(uint256 taskId) external view returns (
        AutomationType taskType,
        address target,
        uint256 amount,
        uint256 frequency,
        uint256 nextExecution,
        bool isActive,
        bool isRecurring
    ) {
        AutomationTask storage task = automationTasks[taskId];
        return (
            task.taskType,
            task.target,
            task.amount,
            task.frequency,
            task.nextExecution,
            task.isActive,
            task.isRecurring
        );
    }

    /**
     * @dev Get all active tasks
     */
    function getActiveTasks() external view returns (uint256[] memory) {
        return activeTasks;
    }

    /**
     * @dev Get savings automation for a member
     */
    function getSavingsAutomation(address member) external view returns (
        uint256 contributionAmount,
        uint256 frequency,
        uint256 nextContribution,
        bool isActive,
        uint256 totalContributed
    ) {
        SavingsAutomation storage automation = savingsAutomations[member];
        return (
            automation.contributionAmount,
            automation.frequency,
            automation.nextContribution,
            automation.isActive,
            automation.totalContributed
        );
    }
}
