// model/log.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const logSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  action: { type: String, required: true }, // e.g., 'CREATE_PRODUCT', 'GET_PRODUCTS'
  resourceType: { type: String }, // e.g., 'Product'
  resourceId: { type: Schema.Types.ObjectId, required: false },
  meta: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now },
}, {
  collection: 'logs',
});

const Log = mongoose.model('Log', logSchema);
module.exports = { Log };
