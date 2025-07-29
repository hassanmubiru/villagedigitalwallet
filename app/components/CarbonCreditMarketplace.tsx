// Phase 4: Carbon Credit Marketplace Component
// Interface for monetizing environmental conservation efforts

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Leaf, 
  TreePine as Tree, 
  BarChart3 as BarChart, 
  Plus, 
  Check, 
  Search, 
  PlaneTakeoff, 
  Car, 
  Home, 
  ShoppingBag,
  Award,
  LineChart,
  Info,
  Download,
  Share2,
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';

import { 
  carbonCreditService, 
  CarbonProject, 
  CarbonCredit, 
  CarbonFootprint 
} from '../lib/carbonCreditService';
import { useLanguage } from '../providers/LanguageProvider';
import { translations } from '../utils/translations';

interface CarbonCreditMarketplaceProps {
  userId: string;
}

export default function CarbonCreditMarketplace({ userId }: CarbonCreditMarketplaceProps) {
  const { language } = useLanguage();
  // Fix type safety by checking if key exists in translations
  const t = (key: string) => {
    const translationsForLang = translations[language as keyof typeof translations];
    return translationsForLang && key in translationsForLang 
      ? translationsForLang[key as keyof typeof translationsForLang] 
      : key;
  };

  const [activeTab, setActiveTab] = useState<'browse' | 'footprint' | 'portfolio' | 'impact'>('browse');
  const [projects, setProjects] = useState<CarbonProject[]>([]);
  const [userCredits, setUserCredits] = useState<CarbonCredit[]>([]);
  const [userFootprint, setUserFootprint] = useState<CarbonFootprint | undefined>(undefined);
  const [selectedProject, setSelectedProject] = useState<CarbonProject | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [footprintInputs, setFootprintInputs] = useState({
    transportKm: 5000,
    energyKwh: 2400,
    meatConsumption: 'medium' as 'high' | 'medium' | 'low' | 'none',
    flightsPerYear: 2
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const availableProjects = carbonCreditService.getAvailableProjects();
      setProjects(availableProjects);

      const credits = carbonCreditService.getUserCredits(userId);
      setUserCredits(credits);

      const footprint = carbonCreditService.getUserFootprint(userId);
      setUserFootprint(footprint);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePurchase = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    try {
      const purchase = carbonCreditService.purchaseCredits(
        userId, 
        selectedProject.id, 
        creditAmount
      );
      
      if (purchase) {
        // Reload data after purchase
        await loadData();
        // Close project details
        setSelectedProject(null);
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateFootprint = () => {
    const footprint = carbonCreditService.calculateUserFootprint(
      userId,
      footprintInputs
    );
    setUserFootprint(footprint);
    setShowCalculator(false);
  };

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = searchTerm === '' || 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = !filterType || project.projectType === filterType;
      
      return matchesSearch && matchesFilter;
    });

  const getTotalOffset = () => {
    return userCredits.reduce((total, credit) => total + credit.amount, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Carbon Credit Marketplace</h1>
              <p className="text-gray-600">Invest in environmental projects and offset your carbon footprint</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'browse', label: 'Browse Projects', icon: Tree },
            { id: 'footprint', label: 'Carbon Footprint', icon: BarChart },
            { id: 'portfolio', label: 'My Portfolio', icon: Award },
            { id: 'impact', label: 'Impact Dashboard', icon: LineChart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'browse' && (
          <BrowseProjectsTab 
            projects={filteredProjects}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterType={filterType}
            onFilterChange={setFilterType}
            onSelectProject={setSelectedProject}
            loading={loading}
          />
        )}
        
        {activeTab === 'footprint' && (
          <FootprintTab 
            footprint={userFootprint}
            showCalculator={showCalculator}
            toggleCalculator={() => setShowCalculator(!showCalculator)}
            footprintInputs={footprintInputs}
            onInputChange={(field, value) => 
              setFootprintInputs(prev => ({ ...prev, [field]: value }))
            }
            onCalculate={handleCalculateFootprint}
            offsetAmount={getTotalOffset()}
            loading={loading}
          />
        )}
        
        {activeTab === 'portfolio' && (
          <PortfolioTab 
            userCredits={userCredits}
            projects={projects}
            loading={loading}
          />
        )}
        
        {activeTab === 'impact' && (
          <ImpactTab 
            userCredits={userCredits}
            projects={projects}
            loading={loading}
          />
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          creditAmount={creditAmount}
          onChangeCreditAmount={setCreditAmount}
          onPurchase={handlePurchase}
          onClose={() => setSelectedProject(null)}
          loading={loading}
        />
      )}
    </div>
  );
}

// Browse Projects Tab
function BrowseProjectsTab({ 
  projects,
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  onSelectProject,
  loading
}: {
  projects: CarbonProject[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterType: string | null;
  onFilterChange: (type: string | null) => void;
  onSelectProject: (project: CarbonProject) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search projects by name, description or location..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 flex items-center">
            <Filter className="h-4 w-4 mr-1" />
            Filter:
          </span>
          <select
            value={filterType || ''}
            onChange={(e) => onFilterChange(e.target.value || null)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
          >
            <option value="">All Types</option>
            <option value="reforestation">Reforestation</option>
            <option value="conservation">Conservation</option>
            <option value="renewable">Renewable Energy</option>
            <option value="methane">Methane Reduction</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-80"></div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div 
              key={project.id} 
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectProject(project)}
            >
              <div className="h-40 bg-gray-200 relative">
                {project.images && project.images[0] ? (
                  <img 
                    src={project.images[0]} 
                    alt={project.name} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Project+Image';
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <Tree className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 left-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  {project.projectType.charAt(0).toUpperCase() + project.projectType.slice(1)}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{project.name}</h3>
                  <img 
                    src={project.organization.logo} 
                    alt={project.organization.name} 
                    className="h-8 w-8 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32?text=Logo';
                    }}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{project.description}</p>
                <div className="mt-3 flex items-center text-sm text-gray-600">
                  <span>{project.location}</span>
                  <span className="mx-2">•</span>
                  <span>{project.carbonReduction.toLocaleString()} tons CO₂</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium text-green-600">${project.pricePerCredit}</p>
                    <p className="text-xs text-gray-500">per credit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{project.availableCredits.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">credits available</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-600">Verified by {project.verificationStandard}</span>
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <span>View details</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Tree className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

// Carbon Footprint Tab
function FootprintTab({ 
  footprint, 
  showCalculator,
  toggleCalculator,
  footprintInputs,
  onInputChange,
  onCalculate,
  offsetAmount,
  loading
}: {
  footprint: CarbonFootprint | undefined;
  showCalculator: boolean;
  toggleCalculator: () => void;
  footprintInputs: {
    transportKm: number;
    energyKwh: number;
    meatConsumption: 'high' | 'medium' | 'low' | 'none';
    flightsPerYear: number;
  };
  onInputChange: (field: string, value: any) => void;
  onCalculate: () => void;
  offsetAmount: number;
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Main Footprint Display */}
      {!showCalculator && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Your Carbon Footprint</h3>
              <button 
                onClick={toggleCalculator}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {footprint ? 'Recalculate' : 'Calculate Now'}
              </button>
            </div>

            {footprint ? (
              <div className="mt-6">
                {/* Carbon Score Card */}
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="relative inline-block">
                    <div className="h-40 w-40 rounded-full border-8 border-green-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {footprint.totalEmissions.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">tons CO₂/year</div>
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 h-12 w-12 bg-green-100 rounded-full border-4 border-white flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-sm font-bold text-green-600">
                          {offsetAmount}
                        </div>
                        <div className="text-xs text-green-800">offset</div>
                      </div>
                    </div>
                  </div>
                
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      {footprint.remainingFootprint > 0
                        ? `You still have ${footprint.remainingFootprint.toFixed(1)} tons of CO₂ to offset`
                        : "Congratulations! You've offset your entire footprint"
                      }
                    </p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Footprint Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <Car className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-lg font-medium">{footprint.transportEmissions.toFixed(1)}</p>
                      <p className="text-xs text-gray-600">tons CO₂ from transport</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <Home className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                      <p className="text-lg font-medium">{footprint.energyEmissions.toFixed(1)}</p>
                      <p className="text-xs text-gray-600">tons CO₂ from energy</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <ShoppingBag className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                      <p className="text-lg font-medium">{footprint.foodEmissions.toFixed(1)}</p>
                      <p className="text-xs text-gray-600">tons CO₂ from food</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <PlaneTakeoff className="h-6 w-6 text-red-500 mx-auto mb-2" />
                      <p className="text-lg font-medium">{footprint.goodsEmissions.toFixed(1)}</p>
                      <p className="text-xs text-gray-600">tons CO₂ from other sources</p>
                    </div>
                  </div>
                </div>

                {/* Offset Suggestions */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">Offset Recommendations</h4>
                    <div className="text-sm text-gray-600">
                      {footprint.remainingFootprint.toFixed(1)} tons needed to offset
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 mt-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <Tree className="h-10 w-10 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium">Purchase Carbon Credits</p>
                        <p className="text-sm text-gray-600">Support verified climate projects</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                      Browse Projects
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Calculate Your Carbon Footprint</h3>
                <p className="text-gray-600 mt-2">
                  Understand your environmental impact and find ways to reduce it
                </p>
                <button 
                  onClick={toggleCalculator}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Start Calculation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Carbon Calculator Form */}
      {showCalculator && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Carbon Footprint Calculator</h3>
            <p className="text-sm text-gray-600">Answer a few questions to calculate your carbon footprint</p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transportation: How many kilometers do you travel by car each year?
                </label>
                <input
                  type="number"
                  value={footprintInputs.transportKm}
                  onChange={(e) => onInputChange('transportKm', parseInt(e.target.value) || 0)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Average car: ~5,000 km/year
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Energy: Estimate your annual electricity consumption (kWh)
                </label>
                <input
                  type="number"
                  value={footprintInputs.energyKwh}
                  onChange={(e) => onInputChange('energyKwh', parseInt(e.target.value) || 0)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Average household: ~2,400 kWh/year
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diet: What is your meat consumption?
                </label>
                <select
                  value={footprintInputs.meatConsumption}
                  onChange={(e) => onInputChange('meatConsumption', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="high">High (meat at almost every meal)</option>
                  <option value="medium">Medium (meat a few times a week)</option>
                  <option value="low">Low (occasional meat, mostly plant-based)</option>
                  <option value="none">None (vegetarian/vegan)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Travel: How many flights do you take per year?
                </label>
                <input
                  type="number"
                  value={footprintInputs.flightsPerYear}
                  onChange={(e) => onInputChange('flightsPerYear', parseInt(e.target.value) || 0)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={toggleCalculator}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onCalculate}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Calculate My Footprint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Portfolio Tab
function PortfolioTab({ 
  userCredits,
  projects,
  loading
}: {
  userCredits: CarbonCredit[];
  projects: CarbonProject[];
  loading: boolean;
}) {
  // Group credits by project
  const creditsByProject = userCredits.reduce((acc, credit) => {
    if (!acc[credit.projectId]) {
      acc[credit.projectId] = {
        projectId: credit.projectId,
        totalCredits: 0,
        totalCost: 0,
        transactions: []
      };
    }
    acc[credit.projectId].totalCredits += credit.amount;
    acc[credit.projectId].totalCost += credit.totalCost;
    acc[credit.projectId].transactions.push(credit);
    return acc;
  }, {} as Record<string, { projectId: string, totalCredits: number, totalCost: number, transactions: CarbonCredit[] }>);

  const getProjectById = (id: string) => projects.find(p => p.id === id);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-green-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total Carbon Credits</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {userCredits.reduce((sum, credit) => sum + credit.amount, 0)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total Investment</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              ${userCredits.reduce((sum, credit) => sum + credit.totalCost, 0).toFixed(2)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Projects Supported</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {Object.keys(creditsByProject).length}
            </p>
          </div>
        </div>
      </div>

      {/* Project Investments */}
      <div>
        <h3 className="text-xl font-medium text-gray-900 mb-4">Your Carbon Project Investments</h3>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-24"></div>
            ))}
          </div>
        ) : Object.values(creditsByProject).length > 0 ? (
          <div className="space-y-4">
            {Object.values(creditsByProject).map(item => {
              const project = getProjectById(item.projectId);
              return project ? (
                <div 
                  key={item.projectId} 
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 flex">
                    <div className="h-24 w-24 bg-gray-100 rounded-lg flex-shrink-0 mr-4">
                      {project.images && project.images[0] ? (
                        <img 
                          src={project.images[0]} 
                          alt={project.name} 
                          className="h-full w-full object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96?text=Project+Image';
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Tree className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">{project.name}</h4>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                          {project.projectType.charAt(0).toUpperCase() + project.projectType.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{project.location}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <span className="text-xs text-gray-500">Credits purchased:</span>
                          <span className="ml-1 font-medium">{item.totalCredits}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Total investment:</span>
                          <span className="ml-1 font-medium">${item.totalCost.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Transactions:</span>
                        <span className="ml-1 text-xs">{item.transactions.length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      Latest purchase: {new Date(
                        Math.max(...item.transactions.map(t => t.transactionDate.getTime()))
                      ).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button className="text-xs text-green-600 hover:text-green-800 flex items-center">
                        <Download className="h-3 w-3 mr-1" />
                        Certificate
                      </button>
                      <button className="text-xs text-green-600 hover:text-green-800 flex items-center">
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No carbon credits yet</h3>
            <p className="text-gray-600">Start by browsing available carbon projects</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Impact Dashboard Tab
function ImpactTab({ 
  userCredits,
  projects,
  loading
}: {
  userCredits: CarbonCredit[];
  projects: CarbonProject[];
  loading: boolean;
}) {
  const totalCredits = userCredits.reduce((sum, credit) => sum + credit.amount, 0);
  const statistics = carbonCreditService.getImpactStatistics();

  // Calculate user impact
  const getImpactMetric = (credits: number) => {
    const trees = credits * 15; // 15 trees per ton of CO2
    const carKm = credits * 5000; // 5000 km driving per ton of CO2
    const flightHours = credits * 2.5; // 2.5 flight hours per ton of CO2
    
    return {
      trees,
      carKm,
      flightHours
    };
  };

  const impact = getImpactMetric(totalCredits);

  return (
    <div className="space-y-6">
      {/* Impact Summary */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-white p-6">
        <h3 className="text-xl font-medium">Your Environmental Impact</h3>
        <p className="mt-1 text-green-100">
          You have offset {totalCredits} tons of CO₂ emissions
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center justify-center">
              <Tree className="h-8 w-8 text-white" />
            </div>
            <p className="text-center mt-2 text-2xl font-bold">{Math.round(impact.trees).toLocaleString()}</p>
            <p className="text-center text-sm text-green-100">Equivalent trees planted</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center justify-center">
              <Car className="h-8 w-8 text-white" />
            </div>
            <p className="text-center mt-2 text-2xl font-bold">{Math.round(impact.carKm).toLocaleString()}</p>
            <p className="text-center text-sm text-green-100">Kilometers not driven</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center justify-center">
              <PlaneTakeoff className="h-8 w-8 text-white" />
            </div>
            <p className="text-center mt-2 text-2xl font-bold">{Math.round(impact.flightHours).toLocaleString()}</p>
            <p className="text-center text-sm text-green-100">Flight hours offset</p>
          </div>
        </div>
      </div>

      {/* Global Impact */}
      <div>
        <h3 className="text-xl font-medium text-gray-900 mb-4">Global Impact Statistics</h3>
        
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Carbon Reduction</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.totalCarbonReduction.toLocaleString()} tons
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.activeProjects}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Tree className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Price per Credit</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${statistics.averagePricePerCredit.toFixed(2)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.totalProjects}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <BarChart className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4">
            <p className="text-center text-sm text-gray-600 flex items-center justify-center">
              <Info className="h-4 w-4 mr-1 text-gray-400" />
              Impact data is updated daily
            </p>
          </div>
        </div>
      </div>
      
      {/* Impact Timeline */}
      <div>
        <h3 className="text-xl font-medium text-gray-900 mb-4">Your Impact Timeline</h3>
        
        {loading ? (
          <div className="animate-pulse bg-gray-100 rounded-lg h-64"></div>
        ) : userCredits.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-64 flex items-center justify-center">
              <LineChart className="h-16 w-16 text-gray-300" />
              <span className="ml-4 text-gray-600">Impact chart visualization will appear here</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No impact data yet</h3>
            <p className="text-gray-600">Purchase carbon credits to start tracking your impact</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Project Detail Modal
function ProjectDetailModal({ 
  project, 
  creditAmount, 
  onChangeCreditAmount,
  onPurchase,
  onClose,
  loading
}: {
  project: CarbonProject;
  creditAmount: number;
  onChangeCreditAmount: (amount: number) => void;
  onPurchase: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {/* Project Images */}
          <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
            {project.images && project.images[0] ? (
              <img 
                src={project.images[0]} 
                alt={project.name} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Project+Image';
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <Tree className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Project Details */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  {project.projectType.charAt(0).toUpperCase() + project.projectType.slice(1)}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {project.location}
                </span>
              </div>
              <div className="flex items-center">
                <img 
                  src={project.organization.logo} 
                  alt={project.organization.name} 
                  className="h-6 w-6 rounded-full mr-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/24?text=Logo';
                  }}
                />
                <span className="text-sm">{project.organization.name}</span>
              </div>
            </div>
            
            <p className="text-gray-700">{project.description}</p>
            
            <div className="flex items-center justify-between border-t border-b border-gray-200 py-3">
              <div>
                <p className="text-sm text-gray-600">Verification Standard</p>
                <p className="font-medium">{project.verificationStandard}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Carbon Reduction</p>
                <p className="font-medium">{project.carbonReduction.toLocaleString()} tons CO₂</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Project Timeline</p>
                <p className="font-medium">
                  {project.startDate.getFullYear()} - {project.endDate.getFullYear()}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Purchase Carbon Credits</h4>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Credits Available</p>
                  <p className="font-medium">{project.availableCredits.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price per Credit</p>
                  <p className="font-medium text-green-600">${project.pricePerCredit.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Credits to Purchase
                </label>
                <div className="flex">
                  <button 
                    onClick={() => onChangeCreditAmount(Math.max(1, creditAmount - 1))}
                    className="px-3 py-2 border border-gray-300 bg-gray-100 text-gray-600 rounded-l-md"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={project.availableCredits}
                    value={creditAmount}
                    onChange={(e) => onChangeCreditAmount(parseInt(e.target.value) || 1)}
                    className="block flex-1 text-center border-y border-gray-300"
                  />
                  <button 
                    onClick={() => onChangeCreditAmount(Math.min(project.availableCredits, creditAmount + 1))}
                    className="px-3 py-2 border border-gray-300 bg-gray-100 text-gray-600 rounded-r-md"
                  >
                    +
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <p className="text-gray-700">Total Cost:</p>
                  <p className="text-xl font-bold text-green-600">
                    ${(creditAmount * project.pricePerCredit).toFixed(2)}
                  </p>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={onPurchase}
                    disabled={loading || creditAmount < 1}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Purchase {creditAmount} Carbon {creditAmount === 1 ? 'Credit' : 'Credits'}
                      </>
                    )}
                  </button>
                </div>
                
                <p className="mt-2 text-xs text-gray-500 text-center">
                  You will receive a certificate for your carbon credit purchase
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
