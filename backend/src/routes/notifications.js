const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const notificationController = require('../controllers/notificationController');

// Validation middleware
const validateSendNotification = [
  body('userId').optional().isInt().withMessage('Invalid user ID'),
  body('type').isIn(['transaction', 'savings', 'loan', 'security', 'promotion', 'system', 'kyc']).withMessage('Invalid notification type'),
  body('title').notEmpty().withMessage('Notification title is required'),
  body('message').notEmpty().withMessage('Notification message is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('channels').optional().isArray(),
  body('scheduledFor').optional().isISO8601(),
  body('expiresAt').optional().isISO8601(),
];

const validateBulkNotification = [
  body('userIds').optional().isArray().withMessage('User IDs must be an array'),
  body('criteria').optional().isObject(),
  body('type').isIn(['transaction', 'savings', 'loan', 'security', 'promotion', 'system', 'kyc']).withMessage('Invalid notification type'),
  body('title').notEmpty().withMessage('Notification title is required'),
  body('message').notEmpty().withMessage('Notification message is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('channels').optional().isArray(),
];

const validateNotificationSettings = [
  body('emailEnabled').optional().isBoolean(),
  body('smsEnabled').optional().isBoolean(),
  body('pushEnabled').optional().isBoolean(),
  body('types.transaction').optional().isBoolean(),
  body('types.savings').optional().isBoolean(),
  body('types.loan').optional().isBoolean(),
  body('types.security').optional().isBoolean(),
  body('types.promotion').optional().isBoolean(),
  body('types.system').optional().isBoolean(),
  body('quietHours.enabled').optional().isBoolean(),
  body('quietHours.start').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('quietHours.end').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
];

const validateTemplate = [
  body('name').notEmpty().withMessage('Template name is required'),
  body('type').isIn(['transaction', 'savings', 'loan', 'security', 'promotion', 'system', 'kyc']).withMessage('Invalid template type'),
  body('title').notEmpty().withMessage('Template title is required'),
  body('message').notEmpty().withMessage('Template message is required'),
  body('variables').optional().isArray(),
  body('channels').optional().isArray(),
];

// Routes

// User notifications
router.get('/my-notifications', query('limit').optional().isInt({ min: 1, max: 100 }), notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.post('/:notificationId/mark-read', param('notificationId').isInt(), notificationController.markAsRead);
router.post('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:notificationId', param('notificationId').isInt(), notificationController.deleteNotification);
router.delete('/clear-all', notificationController.clearAllNotifications);

// Notification preferences
router.get('/settings', notificationController.getNotificationSettings);
router.put('/settings', validateNotificationSettings, notificationController.updateNotificationSettings);
router.post('/test', notificationController.sendTestNotification);

// Device and push notification management
router.post('/register-device', body('deviceToken').notEmpty(), body('platform').isIn(['ios', 'android', 'web']), notificationController.registerDevice);
router.post('/unregister-device', body('deviceToken').notEmpty(), notificationController.unregisterDevice);
router.get('/devices', notificationController.getUserDevices);
router.delete('/devices/:deviceId', param('deviceId').isInt(), notificationController.removeDevice);

// Subscription management
router.get('/subscriptions', notificationController.getSubscriptions);
router.post('/subscribe', body('topic').notEmpty(), notificationController.subscribeToTopic);
router.post('/unsubscribe', body('topic').notEmpty(), notificationController.unsubscribeFromTopic);

// Admin notification management
router.post('/send', validateSendNotification, notificationController.sendNotification);
router.post('/send-bulk', validateBulkNotification, notificationController.sendBulkNotification);
router.get('/all', query('limit').optional().isInt({ min: 1, max: 100 }), notificationController.getAllNotifications);
router.get('/pending', notificationController.getPendingNotifications);
router.get('/failed', notificationController.getFailedNotifications);
router.post('/:notificationId/retry', param('notificationId').isInt(), notificationController.retryNotification);

// Template management
router.get('/templates', notificationController.getTemplates);
router.post('/templates', validateTemplate, notificationController.createTemplate);
router.get('/templates/:templateId', param('templateId').isInt(), notificationController.getTemplate);
router.put('/templates/:templateId', param('templateId').isInt(), validateTemplate, notificationController.updateTemplate);
router.delete('/templates/:templateId', param('templateId').isInt(), notificationController.deleteTemplate);
router.post('/templates/:templateId/send', param('templateId').isInt(), notificationController.sendFromTemplate);

// Campaign management
router.get('/campaigns', notificationController.getCampaigns);
router.post('/campaigns', body('name').notEmpty(), body('templateId').isInt(), notificationController.createCampaign);
router.get('/campaigns/:campaignId', param('campaignId').isInt(), notificationController.getCampaign);
router.post('/campaigns/:campaignId/start', param('campaignId').isInt(), notificationController.startCampaign);
router.post('/campaigns/:campaignId/pause', param('campaignId').isInt(), notificationController.pauseCampaign);
router.get('/campaigns/:campaignId/analytics', param('campaignId').isInt(), notificationController.getCampaignAnalytics);

// Analytics and reporting
router.get('/analytics/delivery', notificationController.getDeliveryAnalytics);
router.get('/analytics/engagement', notificationController.getEngagementAnalytics);
router.get('/analytics/channels', notificationController.getChannelAnalytics);
router.get('/analytics/types', notificationController.getTypeAnalytics);

// System notifications and alerts
router.post('/system-alert', body('message').notEmpty(), body('severity').isIn(['info', 'warning', 'error', 'critical']), notificationController.createSystemAlert);
router.get('/system-alerts', notificationController.getSystemAlerts);
router.post('/maintenance-notice', body('message').notEmpty(), body('startTime').isISO8601(), notificationController.sendMaintenanceNotice);

// Webhook and external integrations
router.post('/webhooks/delivery-status', notificationController.handleDeliveryWebhook);
router.get('/webhook-logs', notificationController.getWebhookLogs);

module.exports = router;
