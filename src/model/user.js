// model/user.js
const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  lastName: { type: String, trim: true, minlength: 0, maxlength: 50 },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 }, // hashed password stored here
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  about: { type: String, default: 'This is default about section' },
  photoURL: {
    type: String,
    default:
      'https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg',
  },
}, {
  collection: 'users',
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = { User };
