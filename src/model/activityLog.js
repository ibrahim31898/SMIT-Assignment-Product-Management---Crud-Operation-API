const mongoose = require('mongoose');

const { Schema } = mongoose;

const activityLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required for activity log'],
    },

    action: {
        type: String,
        required: [true, 'Action is required'],
        enum: [
            'USER_SIGNUP',
            'USER_LOGIN',
            'USER_LOGOUT',
            'PROFILE_ACCESS',
            'PROFILE_UPDATE',
            'PRODUCT_CREATE',
            'PRODUCT_UPDATE',
            'PRODUCT_DELETE',
            'PRODUCTS_ACCESS'
        ],
        uppercase: true
    },

    details: {
        type: String,
        maxLength: [500, 'Details cannot exceed 500 characters'],
        default: ''
    },

    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },

    ipAddress: {
        type: String,
        default: null
    },

    userAgent: {
        type: String,
        default: null
    },

    sessionId: {
        type: String,
        default: null
    }

}, {
    collection: 'activity_logs'
});

// Indexes for better performance
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });

// TTL index to automatically delete logs older than 90 days (optional)
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Static method to get user activity summary
activityLogSchema.statics.getUserActivitySummary = function(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$action',
                count: { $sum: 1 },
                lastActivity: { $max: '$timestamp' }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);
};

// Static method to get recent activities
activityLogSchema.statics.getRecentActivities = function(userId, limit = 20) {
    return this.find({ userId })
        .populate('userId', 'firstName lastName email')
        .sort({ timestamp: -1 })
        .limit(limit);
};

// Static method to get system-wide activity stats
activityLogSchema.statics.getSystemStats = function(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.aggregate([
        {
            $match: {
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    action: '$action',
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$timestamp'
                        }
                    }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.date': -1, '_id.action': 1 }
        }
    ]);
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = { ActivityLog };