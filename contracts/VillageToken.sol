// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title VillageToken
 * @dev ERC20 token for Village Digital Wallet rewards and governance
 */
contract VillageToken is ERC20, ERC20Burnable, Pausable, Ownable, ERC20Permit {
    
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100000000 * 10**18; // 100 million initial
    
    // Reward distribution rates (in tokens per action)
    uint256 public savingsReward = 10 * 10**18; // 10 tokens per savings contribution
    uint256 public loanRepaymentReward = 5 * 10**18; // 5 tokens per loan repayment
    uint256 public referralReward = 25 * 10**18; // 25 tokens per referral
    uint256 public agentCommissionReward = 2 * 10**18; // 2 tokens per transaction
    
    // Reward pools
    mapping(string => uint256) public rewardPools;
    mapping(address => bool) public rewardDistributors;
    
    // Staking for governance
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingTimestamp;
    uint256 public totalStaked;
    uint256 public stakingRewardRate = 100; // 1% annual reward in basis points
    
    // Events
    event RewardDistributed(address indexed recipient, uint256 amount, string rewardType);
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    event StakingRewardClaimed(address indexed user, uint256 amount);

    constructor() 
        ERC20("Village Token", "VILLAGE") 
        ERC20Permit("Village Token")
    {
        _mint(msg.sender, INITIAL_SUPPLY);
        
        // Initialize reward pools
        rewardPools["savings"] = 50000000 * 10**18; // 50M for savings rewards
        rewardPools["loans"] = 30000000 * 10**18; // 30M for loan rewards
        rewardPools["referrals"] = 15000000 * 10**18; // 15M for referrals
        rewardPools["agents"] = 20000000 * 10**18; // 20M for agent rewards
        rewardPools["staking"] = 10000000 * 10**18; // 10M for staking rewards
    }

    modifier onlyRewardDistributor() {
        require(rewardDistributors[msg.sender], "Not authorized to distribute rewards");
        _;
    }

    /**
     * @dev Add authorized reward distributor
     */
    function addRewardDistributor(address _distributor) external onlyOwner {
        rewardDistributors[_distributor] = true;
    }

    /**
     * @dev Remove reward distributor
     */
    function removeRewardDistributor(address _distributor) external onlyOwner {
        rewardDistributors[_distributor] = false;
    }

    /**
     * @dev Distribute savings reward
     */
    function distributeSavingsReward(address _recipient) external onlyRewardDistributor {
        require(rewardPools["savings"] >= savingsReward, "Insufficient savings reward pool");
        
        rewardPools["savings"] -= savingsReward;
        _mint(_recipient, savingsReward);
        
        emit RewardDistributed(_recipient, savingsReward, "savings");
    }

    /**
     * @dev Distribute loan repayment reward
     */
    function distributeLoanReward(address _recipient) external onlyRewardDistributor {
        require(rewardPools["loans"] >= loanRepaymentReward, "Insufficient loan reward pool");
        
        rewardPools["loans"] -= loanRepaymentReward;
        _mint(_recipient, loanRepaymentReward);
        
        emit RewardDistributed(_recipient, loanRepaymentReward, "loan_repayment");
    }

    /**
     * @dev Distribute referral reward
     */
    function distributeReferralReward(address _recipient) external onlyRewardDistributor {
        require(rewardPools["referrals"] >= referralReward, "Insufficient referral reward pool");
        
        rewardPools["referrals"] -= referralReward;
        _mint(_recipient, referralReward);
        
        emit RewardDistributed(_recipient, referralReward, "referral");
    }

    /**
     * @dev Distribute agent commission reward
     */
    function distributeAgentReward(address _recipient) external onlyRewardDistributor {
        require(rewardPools["agents"] >= agentCommissionReward, "Insufficient agent reward pool");
        
        rewardPools["agents"] -= agentCommissionReward;
        _mint(_recipient, agentCommissionReward);
        
        emit RewardDistributed(_recipient, agentCommissionReward, "agent_commission");
    }

    /**
     * @dev Stake tokens for governance voting
     */
    function stakeTokens(uint256 _amount) external whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        // Claim any pending staking rewards before staking more
        if (stakedBalance[msg.sender] > 0) {
            _claimStakingReward();
        }
        
        _transfer(msg.sender, address(this), _amount);
        stakedBalance[msg.sender] += _amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        totalStaked += _amount;
        
        emit TokensStaked(msg.sender, _amount);
    }

    /**
     * @dev Unstake tokens
     */
    function unstakeTokens(uint256 _amount) external whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        require(stakedBalance[msg.sender] >= _amount, "Insufficient staked balance");
        require(block.timestamp >= stakingTimestamp[msg.sender] + 7 days, "Tokens locked for 7 days");
        
        // Claim staking rewards before unstaking
        _claimStakingReward();
        
        stakedBalance[msg.sender] -= _amount;
        totalStaked -= _amount;
        _transfer(address(this), msg.sender, _amount);
        
        // Update staking timestamp for remaining tokens
        if (stakedBalance[msg.sender] > 0) {
            stakingTimestamp[msg.sender] = block.timestamp;
        }
        
        emit TokensUnstaked(msg.sender, _amount);
    }

    /**
     * @dev Claim staking rewards
     */
    function claimStakingReward() external whenNotPaused {
        require(stakedBalance[msg.sender] > 0, "No tokens staked");
        _claimStakingReward();
    }

    /**
     * @dev Internal function to calculate and distribute staking rewards
     */
    function _claimStakingReward() internal {
        uint256 stakingDuration = block.timestamp - stakingTimestamp[msg.sender];
        uint256 reward = (stakedBalance[msg.sender] * stakingRewardRate * stakingDuration) / (365 days * 10000);
        
        if (reward > 0 && reward <= rewardPools["staking"]) {
            rewardPools["staking"] -= reward;
            _mint(msg.sender, reward);
            stakingTimestamp[msg.sender] = block.timestamp;
            
            emit StakingRewardClaimed(msg.sender, reward);
        }
    }

    /**
     * @dev Get pending staking reward
     */
    function getPendingStakingReward(address _user) external view returns (uint256) {
        if (stakedBalance[_user] == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - stakingTimestamp[_user];
        return (stakedBalance[_user] * stakingRewardRate * stakingDuration) / (365 days * 10000);
    }

    /**
     * @dev Get voting power (staked tokens)
     */
    function getVotingPower(address _user) external view returns (uint256) {
        return stakedBalance[_user];
    }

    /**
     * @dev Update reward rates (only owner)
     */
    function updateRewardRates(
        uint256 _savingsReward,
        uint256 _loanRepaymentReward,
        uint256 _referralReward,
        uint256 _agentCommissionReward
    ) external onlyOwner {
        savingsReward = _savingsReward;
        loanRepaymentReward = _loanRepaymentReward;
        referralReward = _referralReward;
        agentCommissionReward = _agentCommissionReward;
    }

    /**
     * @dev Update staking reward rate (only owner)
     */
    function updateStakingRewardRate(uint256 _stakingRewardRate) external onlyOwner {
        require(_stakingRewardRate <= 2000, "Staking reward rate too high"); // Max 20%
        stakingRewardRate = _stakingRewardRate;
    }

    /**
     * @dev Add tokens to reward pool (only owner)
     */
    function addToRewardPool(string memory _poolName, uint256 _amount) external onlyOwner {
        require(totalSupply() + _amount <= MAX_SUPPLY, "Would exceed max supply");
        rewardPools[_poolName] += _amount;
        _mint(address(this), _amount);
    }

    /**
     * @dev Mint tokens for ecosystem growth (only owner, limited)
     */
    function mintForEcosystem(address _recipient, uint256 _amount) external onlyOwner {
        require(totalSupply() + _amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(_recipient, _amount);
    }

    /**
     * @dev Override transfer to handle staked tokens
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Pause token transfers (only owner)
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers (only owner)
     */
    function unpause() public onlyOwner {
        _unpause();
    }
}
