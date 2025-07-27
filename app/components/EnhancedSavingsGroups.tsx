/**
 * Enhanced Savings Groups Component with Smart Contract Integration
 * Phase 2 upgrade with automated contributions, smart loans, and governance
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, TrendingUp, Shield, Vote, 
  Clock, DollarSign, AlertTriangle, CheckCircle,
  Settings, BarChart3, Zap, Lock
} from 'lucide-react';

interface SmartSavingsGroup {
  id: string;
  name: string;
  contractAddress: string;
  members: number;
  totalSavings: number;
  currentCycle: {
    id: number;
    targetAmount: number;
    currentAmount: number;
    progress: number;
    daysLeft: number;
  };
  automationEnabled: boolean;
  governanceActive: boolean;
  smartLoansAvailable: number;
  averageCreditScore: number;
}

interface SmartContract {
  address: string;
  status: 'deployed' | 'deploying' | 'failed';
  gasUsed?: number;
  deploymentHash?: string;
}

interface AutomationRule {
  id: string;
  type: 'contribution' | 'loan_approval' | 'interest_calculation';
  enabled: boolean;
  trigger: string;
  action: string;
}

export default function EnhancedSavingsGroups() {
  const [groups, setGroups] = useState<SmartSavingsGroup[]>([]);
  const [selectedTab, setSelectedTab] = useState<'groups' | 'smart-contracts' | 'automation' | 'governance'>('groups');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [deployingContract, setDeployingContract] = useState(false);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);

  useEffect(() => {
    loadEnhancedGroups();
    loadAutomationRules();
  }, []);

  const loadEnhancedGroups = () => {
    // Mock data with smart contract integration
    const mockGroups: SmartSavingsGroup[] = [
      {
        id: '1',
        name: 'Village Farmers Cooperative',
        contractAddress: '0x742d35Cc6634C0532925a3b8D93e7DC6d9E8b1234',
        members: 25,
        totalSavings: 15000000,
        currentCycle: {
          id: 12,
          targetAmount: 2500000,
          currentAmount: 1875000,
          progress: 75,
          daysLeft: 8
        },
        automationEnabled: true,
        governanceActive: true,
        smartLoansAvailable: 3,
        averageCreditScore: 685
      },
      {
        id: '2',
        name: 'Women\'s Empowerment Circle',
        contractAddress: '0x742d35Cc6634C0532925a3b8D93e7DC6d9E8b5678',
        members: 18,
        totalSavings: 8500000,
        currentCycle: {
          id: 8,
          targetAmount: 1800000,
          currentAmount: 1260000,
          progress: 70,
          daysLeft: 12
        },
        automationEnabled: false,
        governanceActive: false,
        smartLoansAvailable: 1,
        averageCreditScore: 642
      }
    ];

    setGroups(mockGroups);
  };

  const loadAutomationRules = () => {
    const rules: AutomationRule[] = [
      {
        id: '1',
        type: 'contribution',
        enabled: true,
        trigger: 'Every 1st of month',
        action: 'Auto-deduct 120,000 UGX from linked mobile money'
      },
      {
        id: '2',
        type: 'loan_approval',
        enabled: true,
        trigger: 'Credit score > 650 AND amount < 500,000 UGX',
        action: 'Auto-approve loan without manual review'
      },
      {
        id: '3',
        type: 'interest_calculation',
        enabled: true,
        trigger: 'Daily at 00:00 UTC',
        action: 'Calculate and apply interest to active loans'
      }
    ];

    setAutomationRules(rules);
  };

  const deploySmartContract = async (groupName: string) => {
    setDeployingContract(true);
    
    try {
      // Simulate smart contract deployment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newGroup: SmartSavingsGroup = {
        id: Date.now().toString(),
        name: groupName,
        contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        members: 1,
        totalSavings: 0,
        currentCycle: {
          id: 1,
          targetAmount: 1000000,
          currentAmount: 0,
          progress: 0,
          daysLeft: 30
        },
        automationEnabled: false,
        governanceActive: false,
        smartLoansAvailable: 0,
        averageCreditScore: 500
      };

      setGroups(prev => [...prev, newGroup]);
      setShowCreateGroup(false);
      
      alert(`Smart contract deployed successfully!\nAddress: ${newGroup.contractAddress}`);
    } catch (error) {
      alert('Failed to deploy smart contract. Please try again.');
    } finally {
      setDeployingContract(false);
    }
  };

  const enableAutomation = async (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, automationEnabled: true }
        : group
    ));
    
    alert('Automation enabled! Smart contract will now handle contributions and loan approvals automatically.');
  };

  const enableGovernance = async (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, governanceActive: true }
        : group
    ));
    
    alert('Governance tokens issued! Members can now vote on group decisions.');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Savings Groups</h1>
            <p className="text-gray-600">Automated savings with smart contracts and governance</p>
          </div>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            <span>Deploy New Group</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {(['groups', 'smart-contracts', 'automation', 'governance'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  selectedTab === tab
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'groups' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{group.members} members</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Shield className="h-4 w-4" />
                        <span>Score: {group.averageCreditScore}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {group.automationEnabled && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        <Zap className="h-3 w-3 inline mr-1" />
                        Automated
                      </span>
                    )}
                    {group.governanceActive && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        <Vote className="h-3 w-3 inline mr-1" />
                        Governed
                      </span>
                    )}
                  </div>
                </div>

                {/* Contract Address */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Smart Contract</p>
                  <p className="text-sm font-mono text-gray-900">{group.contractAddress}</p>
                </div>

                {/* Current Cycle Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Cycle {group.currentCycle.id} Progress</span>
                    <span className="font-medium">{group.currentCycle.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${group.currentCycle.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatCurrency(group.currentCycle.currentAmount)}</span>
                    <span>{group.currentCycle.daysLeft} days left</span>
                    <span>{formatCurrency(group.currentCycle.targetAmount)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(group.totalSavings)}</p>
                    <p className="text-sm text-green-700">Total Savings</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{group.smartLoansAvailable}</p>
                    <p className="text-sm text-blue-700">Smart Loans Available</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {!group.automationEnabled && (
                    <button
                      onClick={() => enableAutomation(group.id)}
                      className="flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
                    >
                      <Zap className="h-4 w-4" />
                      <span className="text-sm">Enable Automation</span>
                    </button>
                  )}
                  
                  {!group.governanceActive && (
                    <button
                      onClick={() => enableGovernance(group.id)}
                      className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
                    >
                      <Vote className="h-4 w-4" />
                      <span className="text-sm">Enable Governance</span>
                    </button>
                  )}
                  
                  <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm">View Analytics</span>
                  </button>
                  
                  <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Manage</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'automation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Automation Rules</h3>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          rule.type === 'contribution' ? 'bg-green-100 text-green-800' :
                          rule.type === 'loan_approval' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {rule.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.enabled ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Trigger:</strong> {rule.trigger}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Action:</strong> {rule.action}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={rule.enabled}
                        onChange={() => {
                          setAutomationRules(prev => prev.map(r => 
                            r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                          ));
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Deploy Smart Savings Group</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const groupName = formData.get('groupName') as string;
                if (groupName) {
                  deploySmartContract(groupName);
                }
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name
                  </label>
                  <input
                    type="text"
                    name="groupName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter group name"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Smart Contract Features</h4>
                      <ul className="text-sm text-blue-800 mt-1 space-y-1">
                        <li>• Automated contribution collection</li>
                        <li>• AI-powered loan approvals</li>
                        <li>• Transparent fund management</li>
                        <li>• Governance token distribution</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateGroup(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={deployingContract}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {deployingContract ? 'Deploying...' : 'Deploy Contract'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
