const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        minLength: [3, 'Product name must be at least 3 characters long'],
        maxLength: [100, 'Product name cannot exceed 100 characters'],
        trim: true,
    },

    description: {
        type: String,
        required: [true, 'Product description is required'],
        minLength: [10, 'Product description must be at least 10 characters long'],
        maxLength: [500, 'Product description cannot exceed 500 characters'],
        trim: true,
    },

    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price must be a positive number'],
        validate: {
            validator: function(v) {
                return v > 0;
            },
            message: 'Price must be greater than 0'
        }
    },

    category: {
        type: String,
        required: [true, 'Product category is required'],
        minLength: [3, 'Category must be at least 3 characters long'],
        maxLength: [50, 'Category cannot exceed 50 characters'],
        trim: true,
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator information is required'],
    },

    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

    isActive: {
        type: Boolean,
        default: true
    },

    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },

    tags: {
        type: [String],
        validate: {
            validator: function(v) {
                return v.length <= 10;
            },
            message: 'Cannot have more than 10 tags'
        }
    },

    imageURL: {
        type: String,
        default: null
    }

}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'products'
});

// Indexes for better performance
productSchema.index({ createdBy: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' }); // Text search
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
    return `$${this.price.toFixed(2)}`;
});

// Virtual populate for creator info
productSchema.virtual('creator', {
    ref: 'User',
    localField: 'createdBy',
    foreignField: '_id',
    justOne: true
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.__v;
        return ret;
    }
});

// Static method to find products by category
productSchema.statics.findByCategory = function(category) {
    return this.find({ category: new RegExp(category, 'i'), isActive: true });
};

// Static method to find products by price range
productSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
    return this.find({
        price: { $gte: minPrice, $lte: maxPrice },
        isActive: true
    });
};

// Instance method to check if user is owner
productSchema.methods.isOwnedBy = function(userId) {
    return this.createdBy.toString() === userId.toString();
};

const Product = mongoose.model('Product', productSchema);

module.exports = { Product };