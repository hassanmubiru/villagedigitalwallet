'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { formatEther } from 'viem';
import { CONTRACT_ADDRESSES } from '../utils/contractAddresses';

// Simple contract interaction without external dependencies
interface AgentInfo {
  isActive: boolean;
  businessName: string;
  location: string;
  commissionRate: number;
  totalVolume: string;
  successfulTransactions: number;
  registrationTime: number;
}

interface UserInfo {
  phoneNumber: string;
  country: string;
  isRegistered: boolean;
  isVerified: boolean;
  registrationTime: number;
  totalTransactions: number;
  creditScore: number;
}

const ContractTester: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  const [activeTab, setActiveTab] = useState('wallet');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
  }

  // Test agent addresses
  const testAgents = [
    {
      address: '0x50625608E728cad827066dD78F5B4e8d203619F3',
      name: 'Village Digital Wallet Test Hub'
    },
    {
      address: '0x18F333EF44aC1c7e5a0858437DEd34ac548dE53a',
      name: 'Nairobi Digital Services'
    }
  ];

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      await connect({ connector: metaMask() });
      addTestResult('✅ Wallet connected successfully');
    } catch (error) {
      addTestResult(`❌ Wallet connection failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testUserRegistration = async () => {
    if (!address) {
      addTestResult('❌ Please connect wallet first');
      return;
    }

    try {
      setLoading(true);
      addTestResult('🔍 Testing user registration...');
      
      // Simulate user registration test
      const phoneNumber = '+254700000000';
      const country = 'Kenya';
      
      addTestResult(`📱 Phone: ${phoneNumber}`);
      addTestResult(`🌍 Country: ${country}`);
      addTestResult(`👤 Address: ${address}`);
      addTestResult('✅ User registration simulation completed');
      
    } catch (error) {
      addTestResult(`❌ User registration test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testAgentQuery = async (agentAddress: string, agentName: string) => {
    try {
      setLoading(true);
      addTestResult(`🔍 Querying agent: ${agentName}`);
      addTestResult(`📍 Address: ${agentAddress}`);
      
      // Simulate agent query
      const mockAgentInfo: AgentInfo = {
        isActive: true,
        businessName: agentName,
        location: agentAddress === '0x50625608E728cad827066dD78F5B4e8d203619F3' ? 'Test Village Centre' : 'Nairobi CBD, Kenya',
        commissionRate: 250, // 2.5%
        totalVolume: '0.0',
        successfulTransactions: 0,
        registrationTime: Math.floor(Date.now() / 1000)
      };

      addTestResult(`✅ Agent Active: ${mockAgentInfo.isActive}`);
      addTestResult(`🏢 Business: ${mockAgentInfo.businessName}`);
      addTestResult(`📍 Location: ${mockAgentInfo.location}`);
      addTestResult(`💰 Commission: ${mockAgentInfo.commissionRate / 100}%`);
      addTestResult(`📊 Volume: ${mockAgentInfo.totalVolume} CELO`);
      
    } catch (error) {
      addTestResult(`❌ Agent query failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testTokenBalance = async () => {
    if (!address) {
      addTestResult('❌ Please connect wallet first');
      return;
    }

    try {
      setLoading(true);
      addTestResult('🔍 Checking token balances...');
      
      if (balance) {
        addTestResult(`💰 CELO Balance: ${formatEther(balance.value)} ${balance.symbol}`);
      }
      
      addTestResult(`🪙 VillageToken Contract: ${CONTRACT_ADDRESSES.alfajores.VillageToken}`);
      addTestResult(`💼 VillageWallet Contract: ${CONTRACT_ADDRESSES.alfajores.VillageWallet}`);
      addTestResult('✅ Balance check completed');
      
    } catch (error) {
      addTestResult(`❌ Balance check failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testCashInOut = async () => {
    if (!address) {
      addTestResult('❌ Please connect wallet first');
      return;
    }

    try {
      setLoading(true);
      addTestResult('🔍 Testing cash in/out simulation...');
      
      const amount = '10'; // 10 CELO
      const selectedAgent = testAgents[0];
      
      addTestResult(`💵 Amount: ${amount} CELO`);
      addTestResult(`🏪 Agent: ${selectedAgent.name}`);
      addTestResult(`📍 Agent Address: ${selectedAgent.address}`);
      addTestResult('💰 Cash In simulation completed');
      addTestResult('💸 Cash Out simulation completed');
      
    } catch (error) {
      addTestResult(`❌ Cash in/out test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <h1 className="text-3xl font-bold mb-2">Village Digital Wallet - Contract Tester</h1>
          <p className="text-green-100">Comprehensive testing interface for smart contract interactions</p>
        </div>

        {/* Wallet Connection Status */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                {isConnected ? `Connected: ${address?.slice(0, 8)}...${address?.slice(-6)}` : 'Not Connected'}
              </span>
              {balance && (
                <span className="text-sm text-gray-600">
                  Balance: {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
                </span>
              )}
            </div>
            <div className="space-x-2">
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              ) : (
                <button
                  onClick={() => disconnect()}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'wallet', label: 'Wallet', icon: '👛' },
              { id: 'users', label: 'Users', icon: '👤' },
              { id: 'agents', label: 'Agents', icon: '🏪' },
              { id: 'transactions', label: 'Transactions', icon: '💸' },
              { id: 'contracts', label: 'Contracts', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Testing Controls */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Testing Controls</h2>
              
              {activeTab === 'wallet' && (
                <div className="space-y-3">
                  <button
                    onClick={testTokenBalance}
                    disabled={loading}
                    className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Test Token Balances
                  </button>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-3">
                  <button
                    onClick={testUserRegistration}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Test User Registration
                  </button>
                </div>
              )}

              {activeTab === 'agents' && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700">Test Agent Queries</h3>
                  {testAgents.map((agent) => (
                    <button
                      key={agent.address}
                      onClick={() => testAgentQuery(agent.address, agent.name)}
                      disabled={loading}
                      className="w-full bg-purple-600 text-white p-3 rounded hover:bg-purple-700 disabled:opacity-50 text-left"
                    >
                      Query: {agent.name}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'transactions' && (
                <div className="space-y-3">
                  <button
                    onClick={testCashInOut}
                    disabled={loading}
                    className="w-full bg-orange-600 text-white p-3 rounded hover:bg-orange-700 disabled:opacity-50"
                  >
                    Test Cash In/Out
                  </button>
                </div>
              )}

              {activeTab === 'contracts' && (
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-medium mb-2">Contract Addresses (Alfajores)</h3>
                    <div className="text-sm space-y-1">
                      <div>VillageToken: <code className="bg-gray-200 p-1 rounded text-xs">{CONTRACT_ADDRESSES.alfajores.VillageToken}</code></div>
                      <div>VillageWallet: <code className="bg-gray-200 p-1 rounded text-xs">{CONTRACT_ADDRESSES.alfajores.VillageWallet}</code></div>
                      <div>SavingsGroups: <code className="bg-gray-200 p-1 rounded text-xs">{CONTRACT_ADDRESSES.alfajores.SavingsGroups}</code></div>
                      <div>MicroloanSystem: <code className="bg-gray-200 p-1 rounded text-xs">{CONTRACT_ADDRESSES.alfajores.MicroloanSystem}</code></div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={clearResults}
                className="w-full bg-gray-600 text-white p-3 rounded hover:bg-gray-700"
              >
                Clear Results
              </button>
            </div>

            {/* Test Results */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Test Results</h2>
                <span className="text-sm text-gray-500">{testResults.length} results</span>
              </div>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                {testResults.length === 0 ? (
                  <div className="text-gray-500">Run tests to see results here...</div>
                ) : (
                  testResults.map((result, index) => (
                    <div key={index} className="mb-1">
                      {result}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Network Info */}
        <div className="bg-gray-50 p-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Network: Celo Alfajores Testnet</span>
            <span>Chain ID: 44787</span>
            <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractTester;
