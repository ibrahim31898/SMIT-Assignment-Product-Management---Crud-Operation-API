// app.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const { connectDB } = require('./config/database');
const { User } = require('./model/user');
const { Product } = require('./model/product');
const { Log } = require('./model/log');
const { userAuth } = require('./middleware/user');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Config / secrets
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'Ali@4321';
const JWT_EXPIRES = '1d';

// --- Validation Schemas ---
const signupSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().allow('').max(50),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin').default('user'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const productSchema = Joi.object({
  name: Joi.string().min(1).required(),
  description: Joi.string().allow(''),
  price: Joi.number().min(0).default(0),
  category: Joi.string().default('general'),
});

// --- Utility: create log entry ---
async function createLog({ userId, action, resourceType, resourceId, meta = {} }) {
  try {
    const log = new Log({ userId, action, resourceType, resourceId, meta });
    await log.save();
  } catch (err) {
    console.error('Failed to create log', err);
  }
}

// --- Auth Routes ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { firstName, lastName, email, password, role } = value;

    // check existing
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'User with that email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, email, password: hashed, role });
    await user.save();

    await createLog({ userId: user._id, action: 'SIGNUP', resourceType: 'User', resourceId: user._id });

    res.status(201).json({ message: 'User signup successfully', data: { id: user._id, email: user.email, firstName: user.firstName, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup error', error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      // secure: true in production with https
      maxAge: 24 * 60 * 60 * 1000,
    });

    await createLog({ userId: user._id, action: 'LOGIN', resourceType: 'User', resourceId: user._id });

    const userSafe = { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role };
    res.json({ message: 'Login successful', user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login error', error: err.message });
  }
});

app.post('/api/auth/logout', userAuth, async (req, res) => {
  try {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    await createLog({ userId: req.user._id, action: 'LOGOUT', resourceType: 'User', resourceId: req.user._id });
    res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Logout error', error: err.message });
  }
});

// --- Profile ---
app.get('/api/users/profile', userAuth, async (req, res) => {
  try {
    // userAuth attached user without password
    await createLog({ userId: req.user._id, action: 'GET_PROFILE', resourceType: 'User', resourceId: req.user._id });
    res.json({ user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Profile error', error: err.message });
  }
});

// --- Products ---
// Create
app.post('/api/products', userAuth, async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, description, price, category } = value;
    const product = new Product({
      name,
      description,
      price,
      category,
      createdBy: req.user._id,
    });
    await product.save();

    await createLog({ userId: req.user._id, action: 'CREATE_PRODUCT', resourceType: 'Product', resourceId: product._id, meta: { name } });

    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Create product error', error: err.message });
  }
});

// Read all
app.get('/api/products', userAuth, async (req, res) => {
  try {
    const products = await Product.find().populate('createdBy', 'firstName lastName email');
    await createLog({ userId: req.user._id, action: 'GET_PRODUCTS', resourceType: 'Product', meta: { count: products.length } });
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Get products error', error: err.message });
  }
});

// Update
app.put('/api/products/:id', userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = productSchema.validate(req.body, { presence: 'optional' });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: not the product owner' });
    }

    const changes = {};
    ['name', 'description', 'price', 'category'].forEach((k) => {
      if (value[k] !== undefined && value[k] !== product[k]) {
        changes[k] = { from: product[k], to: value[k] };
        product[k] = value[k];
      }
    });

    if (Object.keys(changes).length > 0) {
      product.updateHistory.push({ userId: req.user._id, changes, updatedAt: new Date() });
    }

    await product.save();

    await createLog({ userId: req.user._id, action: 'UPDATE_PRODUCT', resourceType: 'Product', resourceId: product._id, meta: { changes } });

    res.json({ message: 'Product updated', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update product error', error: err.message });
  }
});

// Delete
app.delete('/api/products/:id', userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: not the product owner' });
    }

    await product.remove();

    await createLog({ userId: req.user._id, action: 'DELETE_PRODUCT', resourceType: 'Product', resourceId: product._id, meta: { name: product.name } });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete product error', error: err.message });
  }
});

// --- Global 404 ---
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// --- Boot ---
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed', err);
    process.exit(1);
  });
