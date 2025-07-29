import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Vote, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  FileText,
  Gavel,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface Proposal {
  id: number;
  title: string;
  description: string;
  category: 'SAVINGS_MANAGEMENT' | 'LOAN_APPROVAL' | 'INTEREST_RATE_CHANGE' | 'MEMBER_MANAGEMENT' | 'TREASURY_MANAGEMENT' | 'SYSTEM_UPGRADE';
  proposer: string;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  status: 'ACTIVE' | 'PASSED' | 'FAILED' | 'EXECUTED';
  endTime: Date;
  executed: boolean;
}

interface GovernanceProps {
  onClose: () => void;
  walletAddress?: string;
}

const GovernanceView: React.FC<GovernanceProps> = ({ onClose, walletAddress }) => {
  const [activeTab, setActiveTab] = useState<'proposals' | 'create' | 'voting-power'>('proposals');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [userVotingPower, setUserVotingPower] = useState<number>(0);
  const [userReputation, setUserReputation] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockProposals: Proposal[] = [
      {
        id: 1,
        title: "Increase Minimum Savings Contribution",
        description: "Proposal to increase the minimum monthly savings contribution from 10 cUSD to 15 cUSD to build stronger group reserves.",
        category: 'SAVINGS_MANAGEMENT',
        proposer: '0x1234...5678',
        forVotes: 75,
        againstVotes: 25,
        abstainVotes: 10,
        status: 'ACTIVE',
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        executed: false
      },
      {
        id: 2,
        title: "Approve Emergency Loan for Village School",
        description: "Emergency loan of 500 cUSD for village school infrastructure repairs after recent storm damage.",
        category: 'LOAN_APPROVAL',
        proposer: '0x8765...4321',
        forVotes: 120,
        againstVotes: 15,
        abstainVotes: 5,
        status: 'PASSED',
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        executed: false
      },
      {
        id: 3,
        title: "Reduce Interest Rate for Agricultural Loans",
        description: "Reduce interest rate for agricultural loans from 5% to 3% to support farming season.",
        category: 'INTEREST_RATE_CHANGE',
        proposer: '0x9876...1234',
        forVotes: 90,
        againstVotes: 40,
        abstainVotes: 20,
        status: 'ACTIVE',
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        executed: false
      }
    ];
    
    setProposals(mockProposals);
    setUserVotingPower(1250); // Mock voting power
    setUserReputation(85); // Mock reputation score
  }, []);

  const getCategoryIcon = (category: Proposal['category']) => {
    switch (category) {
      case 'SAVINGS_MANAGEMENT': return <TrendingUp className="w-4 h-4" />;
      case 'LOAN_APPROVAL': return <FileText className="w-4 h-4" />;
      case 'INTEREST_RATE_CHANGE': return <AlertTriangle className="w-4 h-4" />;
      case 'MEMBER_MANAGEMENT': return <Users className="w-4 h-4" />;
      case 'TREASURY_MANAGEMENT': return <TrendingUp className="w-4 h-4" />;
      case 'SYSTEM_UPGRADE': return <Gavel className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'ACTIVE': return 'text-blue-600 bg-blue-100';
      case 'PASSED': return 'text-green-600 bg-green-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      case 'EXECUTED': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleVote = (proposalId: number, support: 'for' | 'against' | 'abstain') => {
    // Mock voting function
    setLoading(true);
    setTimeout(() => {
      setProposals(prev => prev.map(p => {
        if (p.id === proposalId) {
          const updatedProposal = { ...p };
          switch (support) {
            case 'for':
              updatedProposal.forVotes += userVotingPower;
              break;
            case 'against':
              updatedProposal.againstVotes += userVotingPower;
              break;
            case 'abstain':
              updatedProposal.abstainVotes += userVotingPower;
              break;
          }
          return updatedProposal;
        }
        return p;
      }));
      setLoading(false);
    }, 1000);
  };

  const renderProposals = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Active Proposals</h3>
        <button
          onClick={() => setActiveTab('create')}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Proposal</span>
        </button>
      </div>

      {proposals.map((proposal) => (
        <motion.div
          key={proposal.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getCategoryIcon(proposal.category)}
              <div>
                <h4 className="font-semibold text-gray-900">{proposal.title}</h4>
                <p className="text-sm text-gray-600">by {proposal.proposer}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
              {proposal.status}
            </span>
          </div>

          <p className="text-gray-700 mb-4">{proposal.description}</p>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">For</span>
              <span className="font-medium text-green-600">{proposal.forVotes} votes</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ 
                  width: `${(proposal.forVotes / (proposal.forVotes + proposal.againstVotes + proposal.abstainVotes)) * 100}%` 
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Against</span>
              <span className="font-medium text-red-600">{proposal.againstVotes} votes</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full"
                style={{ 
                  width: `${(proposal.againstVotes / (proposal.forVotes + proposal.againstVotes + proposal.abstainVotes)) * 100}%` 
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Abstain</span>
              <span className="font-medium text-gray-600">{proposal.abstainVotes} votes</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-400 h-2 rounded-full"
                style={{ 
                  width: `${(proposal.abstainVotes / (proposal.forVotes + proposal.againstVotes + proposal.abstainVotes)) * 100}%` 
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                {proposal.status === 'ACTIVE' 
                  ? `Ends ${proposal.endTime.toLocaleDateString()}`
                  : `Ended ${proposal.endTime.toLocaleDateString()}`
                }
              </span>
            </div>

            {proposal.status === 'ACTIVE' && walletAddress && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleVote(proposal.id, 'for')}
                  disabled={loading}
                  className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>For</span>
                </button>
                <button
                  onClick={() => handleVote(proposal.id, 'against')}
                  disabled={loading}
                  className="flex items-center space-x-1 bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Against</span>
                </button>
                <button
                  onClick={() => handleVote(proposal.id, 'abstain')}
                  disabled={loading}
                  className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <Vote className="w-4 h-4" />
                  <span>Abstain</span>
                </button>
              </div>
            )}

            {proposal.status === 'PASSED' && !proposal.executed && (
              <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
                Execute
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderCreateProposal = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Create New Proposal</h3>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter proposal title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
            <option value="SAVINGS_MANAGEMENT">Savings Management</option>
            <option value="LOAN_APPROVAL">Loan Approval</option>
            <option value="INTEREST_RATE_CHANGE">Interest Rate Change</option>
            <option value="MEMBER_MANAGEMENT">Member Management</option>
            <option value="TREASURY_MANAGEMENT">Treasury Management</option>
            <option value="SYSTEM_UPGRADE">System Upgrade</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Describe your proposal in detail"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Proposal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('proposals')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const renderVotingPower = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Voting Power</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <Vote className="w-6 h-6 text-green-600" />
            <h4 className="font-semibold text-green-800">Voting Power</h4>
          </div>
          <p className="text-2xl font-bold text-green-900">{userVotingPower.toLocaleString()}</p>
          <p className="text-sm text-green-700">Based on your contributions and governance tokens</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h4 className="font-semibold text-blue-800">Reputation Score</h4>
          </div>
          <p className="text-2xl font-bold text-blue-900">{userReputation}/100</p>
          <p className="text-sm text-blue-700">Based on your participation and loan history</p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold text-gray-900 mb-3">How to Increase Voting Power</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Make regular savings contributions</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Participate in governance voting</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Maintain good loan repayment history</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Help other members and contribute to discussions</span>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Village Governance</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveTab('proposals')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'proposals'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Proposals
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create Proposal
          </button>
          <button
            onClick={() => setActiveTab('voting-power')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'voting-power'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Voting Power
          </button>
        </div>

        {activeTab === 'proposals' && renderProposals()}
        {activeTab === 'create' && renderCreateProposal()}
        {activeTab === 'voting-power' && renderVotingPower()}
      </div>
    </div>
  );
};

export default GovernanceView;
