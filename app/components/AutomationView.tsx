import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  CreditCard, 
  Calculator,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit
} from 'lucide-react';

interface AutomationTask {
  id: number;
  type: 'SAVINGS_CONTRIBUTION' | 'LOAN_REPAYMENT' | 'INTEREST_CALCULATION' | 'GOVERNANCE_EXECUTION';
  title: string;
  description: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  nextExecution: Date;
  isActive: boolean;
  amount?: number;
  target?: string;
  status: 'RUNNING' | 'PAUSED' | 'FAILED' | 'COMPLETED';
}

interface AutomationProps {
  onClose: () => void;
  walletAddress?: string;
}

const AutomationView: React.FC<AutomationProps> = ({ onClose, walletAddress }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'savings' | 'loans' | 'settings'>('dashboard');
  const [automationTasks, setAutomationTasks] = useState<AutomationTask[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockTasks: AutomationTask[] = [
      {
        id: 1,
        type: 'SAVINGS_CONTRIBUTION',
        title: 'Weekly Savings Contribution',
        description: 'Automatically contribute 25 cUSD to savings group every week',
        frequency: 'WEEKLY',
        nextExecution: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        isActive: true,
        amount: 25,
        status: 'RUNNING'
      },
      {
        id: 2,
        type: 'LOAN_REPAYMENT',
        title: 'Loan Repayment - Agricultural Loan',
        description: 'Monthly repayment of 50 cUSD for agricultural loan #123',
        frequency: 'MONTHLY',
        nextExecution: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        isActive: true,
        amount: 50,
        target: 'Loan #123',
        status: 'RUNNING'
      },
      {
        id: 3,
        type: 'INTEREST_CALCULATION',
        title: 'Interest Calculation',
        description: 'Calculate compound interest on savings group balance',
        frequency: 'MONTHLY',
        nextExecution: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        isActive: true,
        status: 'RUNNING'
      },
      {
        id: 4,
        type: 'SAVINGS_CONTRIBUTION',
        title: 'Emergency Fund Contribution',
        description: 'Contribute 10 cUSD to emergency fund monthly',
        frequency: 'MONTHLY',
        nextExecution: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        isActive: false,
        amount: 10,
        status: 'PAUSED'
      }
    ];
    
    setAutomationTasks(mockTasks);
  }, []);

  const getTaskIcon = (type: AutomationTask['type']) => {
    switch (type) {
      case 'SAVINGS_CONTRIBUTION': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'LOAN_REPAYMENT': return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'INTEREST_CALCULATION': return <Calculator className="w-5 h-5 text-purple-600" />;
      case 'GOVERNANCE_EXECUTION': return <Settings className="w-5 h-5 text-orange-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: AutomationTask['status']) => {
    switch (status) {
      case 'RUNNING': return 'text-green-600 bg-green-100';
      case 'PAUSED': return 'text-yellow-600 bg-yellow-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      case 'COMPLETED': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getFrequencyColor = (frequency: AutomationTask['frequency']) => {
    switch (frequency) {
      case 'DAILY': return 'bg-red-100 text-red-800';
      case 'WEEKLY': return 'bg-blue-100 text-blue-800';
      case 'MONTHLY': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleTask = (taskId: number) => {
    setAutomationTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          isActive: !task.isActive,
          status: !task.isActive ? 'RUNNING' : 'PAUSED'
        };
      }
      return task;
    }));
  };

  const renderDashboard = () => {
    const activeTasks = automationTasks.filter(task => task.isActive);
    const upcomingTasks = activeTasks
      .sort((a, b) => a.nextExecution.getTime() - b.nextExecution.getTime())
      .slice(0, 3);

    return (
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{activeTasks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Execution</p>
                <p className="text-lg font-bold text-gray-900">
                  {upcomingTasks.length > 0 
                    ? new Date(Math.min(...upcomingTasks.map(t => t.nextExecution.getTime()))).toLocaleDateString()
                    : 'None'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Savings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {automationTasks
                    .filter(t => t.type === 'SAVINGS_CONTRIBUTION' && t.isActive)
                    .reduce((sum, t) => sum + (t.amount || 0), 0)} cUSD
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Repayments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {automationTasks
                    .filter(t => t.type === 'LOAN_REPAYMENT' && t.isActive)
                    .reduce((sum, t) => sum + (t.amount || 0), 0)} cUSD
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Executions</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getTaskIcon(task.type)}
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600">
                      Next: {task.nextExecution.toLocaleDateString()} at {task.nextExecution.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {task.amount && (
                    <span className="text-sm font-medium text-gray-700">{task.amount} cUSD</span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(task.frequency)}`}>
                    {task.frequency}
                  </span>
                </div>
              </div>
            ))}

            {upcomingTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No upcoming automated tasks</p>
                <p className="text-sm">Create your first automation to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAllTasks = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">All Automation Tasks</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {automationTasks.map((task) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getTaskIcon(task.type)}
              <div>
                <h4 className="font-semibold text-gray-900">{task.title}</h4>
                <p className="text-sm text-gray-600">{task.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <button
                onClick={() => toggleTask(task.id)}
                className={`p-2 rounded-lg transition-colors ${
                  task.isActive 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                {task.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Frequency:</span>
              <p className="font-medium">{task.frequency}</p>
            </div>
            <div>
              <span className="text-gray-500">Next Execution:</span>
              <p className="font-medium">{task.nextExecution.toLocaleDateString()}</p>
            </div>
            {task.amount && (
              <div>
                <span className="text-gray-500">Amount:</span>
                <p className="font-medium">{task.amount} cUSD</p>
              </div>
            )}
            {task.target && (
              <div>
                <span className="text-gray-500">Target:</span>
                <p className="font-medium">{task.target}</p>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderCreateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Automation Task</h3>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="SAVINGS_CONTRIBUTION">Savings Contribution</option>
              <option value="LOAN_REPAYMENT">Loan Repayment</option>
              <option value="INTEREST_CALCULATION">Interest Calculation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (cUSD)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Automation Center</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'savings'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Tasks
          </button>
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'savings' && renderAllTasks()}

        {showCreateModal && renderCreateModal()}
      </div>
    </div>
  );
};

export default AutomationView;
