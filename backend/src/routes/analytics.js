const express = require('express');
const router = express.Router();
const { query, param } = require('express-validator');
const analyticsController = require('../controllers/analyticsController');

// Validation middleware
const validateDateRange = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('period').optional().isIn(['day', 'week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
];

const validateUserSegment = [
  query('segment').optional().isIn(['new', 'active', 'inactive', 'premium', 'agent', 'verified']).withMessage('Invalid user segment'),
  query('country').optional().isLength({ max: 3 }).withMessage('Invalid country code'),
  query('ageGroup').optional().isIn(['18-25', '26-35', '36-45', '46-55', '55+']).withMessage('Invalid age group'),
];

const validateTransactionFilter = [
  query('type').optional().isIn(['deposit', 'withdrawal', 'transfer', 'loan', 'savings']).withMessage('Invalid transaction type'),
  query('currency').optional().isIn(['CUSD', 'CELO', 'VWT']).withMessage('Invalid currency'),
  query('minAmount').optional().isNumeric().withMessage('Invalid minimum amount'),
  query('maxAmount').optional().isNumeric().withMessage('Invalid maximum amount'),
];

// Dashboard and overview
router.get('/dashboard', analyticsController.getDashboardMetrics);
router.get('/overview', validateDateRange, analyticsController.getOverview);
router.get('/kpis', validateDateRange, analyticsController.getKPIs);
router.get('/real-time', analyticsController.getRealTimeMetrics);

// User analytics
router.get('/users/acquisition', validateDateRange, analyticsController.getUserAcquisition);
router.get('/users/retention', validateDateRange, analyticsController.getUserRetention);
router.get('/users/engagement', validateDateRange, validateUserSegment, analyticsController.getUserEngagement);
router.get('/users/demographics', analyticsController.getUserDemographics);
router.get('/users/behavior', validateDateRange, analyticsController.getUserBehavior);
router.get('/users/churn', validateDateRange, analyticsController.getChurnAnalysis);
router.get('/users/lifetime-value', analyticsController.getLifetimeValue);
router.get('/users/segmentation', analyticsController.getUserSegmentation);

// Transaction analytics
router.get('/transactions/volume', validateDateRange, validateTransactionFilter, analyticsController.getTransactionVolume);
router.get('/transactions/value', validateDateRange, validateTransactionFilter, analyticsController.getTransactionValue);
router.get('/transactions/success-rate', validateDateRange, analyticsController.getTransactionSuccessRate);
router.get('/transactions/trends', validateDateRange, analyticsController.getTransactionTrends);
router.get('/transactions/patterns', validateDateRange, analyticsController.getTransactionPatterns);
router.get('/transactions/fees', validateDateRange, analyticsController.getFeeAnalysis);
router.get('/transactions/cross-border', validateDateRange, analyticsController.getCrossBorderAnalysis);

// Financial analytics
router.get('/financial/revenue', validateDateRange, analyticsController.getRevenueAnalytics);
router.get('/financial/costs', validateDateRange, analyticsController.getCostAnalysis);
router.get('/financial/profitability', validateDateRange, analyticsController.getProfitabilityAnalysis);
router.get('/financial/liquidity', analyticsController.getLiquidityAnalysis);
router.get('/financial/float-management', analyticsController.getFloatManagement);
router.get('/financial/reconciliation', validateDateRange, analyticsController.getReconciliationReport);

// Savings and loans analytics
router.get('/savings/performance', validateDateRange, analyticsController.getSavingsPerformance);
router.get('/savings/groups', validateDateRange, analyticsController.getSavingsGroupAnalytics);
router.get('/savings/participation', validateDateRange, analyticsController.getSavingsParticipation);
router.get('/loans/portfolio', validateDateRange, analyticsController.getLoanPortfolio);
router.get('/loans/performance', validateDateRange, analyticsController.getLoanPerformance);
router.get('/loans/default-risk', analyticsController.getDefaultRiskAnalysis);
router.get('/loans/credit-scoring', analyticsController.getCreditScoringAnalytics);

// Agent analytics
router.get('/agents/performance', validateDateRange, analyticsController.getAgentPerformance);
router.get('/agents/distribution', analyticsController.getAgentDistribution);
router.get('/agents/utilization', validateDateRange, analyticsController.getAgentUtilization);
router.get('/agents/commissions', validateDateRange, analyticsController.getAgentCommissions);
router.get('/agents/customer-satisfaction', analyticsController.getAgentSatisfaction);

// Mobile money analytics
router.get('/mobile-money/usage', validateDateRange, analyticsController.getMobileMoneyUsage);
router.get('/mobile-money/providers', validateDateRange, analyticsController.getProviderAnalytics);
router.get('/mobile-money/success-rates', validateDateRange, analyticsController.getMobileMoneySuccessRates);
router.get('/mobile-money/costs', validateDateRange, analyticsController.getMobileMoneyCosts);

// Geographic analytics
router.get('/geographic/usage', validateDateRange, analyticsController.getGeographicUsage);
router.get('/geographic/penetration', analyticsController.getMarketPenetration);
router.get('/geographic/growth', validateDateRange, analyticsController.getGeographicGrowth);
router.get('/geographic/agent-coverage', analyticsController.getAgentCoverage);

// Risk and fraud analytics
router.get('/risk/overview', analyticsController.getRiskOverview);
router.get('/risk/fraud-detection', validateDateRange, analyticsController.getFraudAnalytics);
router.get('/risk/suspicious-patterns', analyticsController.getSuspiciousPatterns);
router.get('/risk/compliance', validateDateRange, analyticsController.getComplianceMetrics);
router.get('/risk/aml-screening', analyticsController.getAMLScreening);

// Technology and performance analytics
router.get('/technology/system-health', analyticsController.getSystemHealth);
router.get('/technology/api-performance', validateDateRange, analyticsController.getAPIPerformance);
router.get('/technology/error-rates', validateDateRange, analyticsController.getErrorRates);
router.get('/technology/uptime', validateDateRange, analyticsController.getUptimeAnalytics);
router.get('/technology/usage-patterns', validateDateRange, analyticsController.getTechnologyUsage);

// Marketing and growth analytics
router.get('/marketing/campaigns', validateDateRange, analyticsController.getCampaignAnalytics);
router.get('/marketing/channels', validateDateRange, analyticsController.getMarketingChannels);
router.get('/marketing/conversion', validateDateRange, analyticsController.getConversionAnalytics);
router.get('/marketing/customer-acquisition-cost', validateDateRange, analyticsController.getCustomerAcquisitionCost);
router.get('/marketing/referrals', validateDateRange, analyticsController.getReferralAnalytics);

// Predictive analytics and forecasting
router.get('/predictions/user-growth', analyticsController.getUserGrowthForecast);
router.get('/predictions/transaction-volume', analyticsController.getTransactionVolumeForecast);
router.get('/predictions/churn-risk', analyticsController.getChurnRiskPrediction);
router.get('/predictions/demand-forecast', analyticsController.getDemandForecast);
router.get('/predictions/liquidity-needs', analyticsController.getLiquidityForecast);

// Custom reports and exports
router.get('/reports/custom', analyticsController.generateCustomReport);
router.get('/reports/scheduled', analyticsController.getScheduledReports);
router.post('/reports/schedule', analyticsController.scheduleReport);
router.get('/export/data', validateDateRange, analyticsController.exportAnalyticsData);
router.get('/export/dashboard', analyticsController.exportDashboard);

// Cohort analysis
router.get('/cohorts/user-retention', analyticsController.getCohortRetention);
router.get('/cohorts/revenue', analyticsController.getRevenueCohorts);
router.get('/cohorts/behavior', analyticsController.getBehaviorCohorts);

// A/B testing and experiments
router.get('/experiments/active', analyticsController.getActiveExperiments);
router.get('/experiments/:experimentId/results', param('experimentId').isInt(), analyticsController.getExperimentResults);
router.get('/experiments/statistical-significance', analyticsController.getStatisticalSignificance);

module.exports = router;
