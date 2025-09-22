const mongoose = require('mongoose');
const validator = require('validator');

const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        minLength: [3, 'First name must be at least 3 characters long'],
        maxLength: [30, 'First name cannot exceed 30 characters'],
        trim: true,
    },

    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        minLength: [3, 'Last name must be at least 3 characters long'],
        maxLength: [30, 'Last name cannot exceed 30 characters'],
        trim: true,
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return validator.isEmail(v);
            },
            message: 'Please provide a valid email address'
        }
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [8, 'Password must be at least 8 characters long'],
        validate: {
            validator: function(v) {
                // Only validate on creation/update if password is being modified
                if (!this.isModified('password')) return true;
                return validator.isStrongPassword(v, {
                    minLength: 8,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1
                });
            },
            message: 'Password must contain at least 8 characters with 1 uppercase, 1 lowercase, 1 number and 1 symbol'
        }
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    age: {
        type: Number,
        min: [10, 'Age must be at least 10'],
        max: [100, 'Age cannot exceed 100']
    },

    gender: {
        type: String,
        enum: {
            values: ['male', 'female', 'other'],
            message: 'Gender must be either male, female, or other'
        }
    },

    about: {
        type: String,
        maxLength: [500, 'About section cannot exceed 500 characters'],
        default: 'This is the default about section'
    },

    skills: {
        type: [String],
        validate: {
            validator: function(v) {
                return v.length <= 10;
            },
            message: 'Cannot have more than 10 skills'
        }
    },

    photoURL: {
        type: String,
        default: "https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg",
        validate: {
            validator: function(v) {
                return validator.isURL(v);
            },
            message: 'Please provide a valid URL for photo'
        }
    },

    isActive: {
        type: Boolean,
        default: true
    },

    lastLogin: {
        type: Date
    }

}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'users'
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to update lastLogin
userSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('lastLogin')) {
        this.lastLogin = new Date();
    }
    next();
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
    }
});

const User = mongoose.model('User', userSchema);

module.exports = { User };