const express = require('express');
const { connectDB } = require('./config/database');
const { User } = require('./model/user');
const { Product } = require('./model/product');
const { ActivityLog } = require('./model/activityLog');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const { userAuth } = require('./middleware/user');
const Joi = require('joi');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Validation Schemas
const signupSchema = Joi.object({
    firstName: Joi.string().min(3).max(30).required(),
    lastName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('user', 'admin').default('user')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const productSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    price: Joi.number().positive().required(),
    category: Joi.string().min(3).max(50).required()
});

// Helper function to log user activity
const logActivity = async (userId, action, details = '') => {
    try {
        const log = new ActivityLog({
            userId,
            action,
            details,
            timestamp: new Date()
        });
        await log.save();
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

// Authentication APIs
app.post('/api/auth/signup', async (req, res) => {
    try {
        // Validate input
        const { error, value } = signupSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.details[0].message
            });
        }

        const { firstName, lastName, email, password, role } = value;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        await user.save();

        // Log activity
        await logActivity(user._id, 'USER_SIGNUP', `New user registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        // Validate input
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.details[0].message
            });
        }

        const { email, password } = value;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Compare password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Log activity
        await logActivity(user._id, 'USER_LOGIN', `User logged in: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

app.post('/api/auth/logout', async (req, res) => {
    try {
        res.clearCookie('token');
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Profile API
app.get('/api/users/profile', userAuth, async (req, res) => {
    try {
        const user = req.user;
        
        // Log activity
        await logActivity(user._id, 'PROFILE_ACCESS', 'User accessed their profile');

        res.json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                age: user.age,
                gender: user.gender,
                about: user.about,
                skills: user.skills,
                photoURL: user.photoURL,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Product APIs
app.post('/api/products', userAuth, async (req, res) => {
    try {
        // Validate input
        const { error, value } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.details[0].message
            });
        }

        const { name, description, price, category } = value;
        const userId = req.user._id;

        // Create product
        const product = new Product({
            name,
            description,
            price,
            category,
            createdBy: userId,
            createdAt: new Date()
        });

        await product.save();

        // Log activity
        await logActivity(userId, 'PRODUCT_CREATE', `Created product: ${name}`);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: {
                id: product._id,
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                createdBy: product.createdBy,
                createdAt: product.createdAt
            }
        });

    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

app.get('/api/products', userAuth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch all products
        const products = await Product.find()
            .populate('createdBy', 'firstName lastName email')
            .sort({ createdAt: -1 });

        // Log activity
        await logActivity(userId, 'PRODUCTS_ACCESS', 'User accessed products list');

        res.json({
            success: true,
            count: products.length,
            products: products
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

app.put('/api/products/:id', userAuth, async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user._id;

        // Find product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check ownership
        if (product.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only update your own products'
            });
        }

        // Validate input
        const { error, value } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.details[0].message
            });
        }

        // Update product
        const { name, description, price, category } = value;
        product.name = name;
        product.description = description;
        product.price = price;
        product.category = category;
        product.updatedAt = new Date();
        product.updatedBy = userId;

        await product.save();

        // Log activity
        await logActivity(userId, 'PRODUCT_UPDATE', `Updated product: ${name}`);

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: product
        });

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

app.delete('/api/products/:id', userAuth, async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user._id;

        // Find product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check ownership
        if (product.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete your own products'
            });
        }

        // Delete product
        await Product.findByIdAndDelete(productId);

        // Log activity
        await logActivity(userId, 'PRODUCT_DELETE', `Deleted product: ${product.name}`);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        console.log('✅ Database connected successfully!');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📱 Frontend: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    });