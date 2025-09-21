// config/database.js
const mongoose = require('mongoose');

const uri = 'mongodb+srv://ijan80348:shinryuken80348@cluster0.jtbtbsl.mongodb.net/'; // your provided URI

async function connectDB() {
  // options to avoid deprecation warnings
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB connected');
}

module.exports = { connectDB };
