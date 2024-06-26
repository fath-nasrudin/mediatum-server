const { database } = require('../utils/db');

const Schema = database.Schema;

const userSchema = new Schema({
  first_name: { type: String },
  last_name: { type: String },
  username: { type: String },
  password: { type: String },
  is_admin: { type: Boolean, default: false },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports = database.model('User', userSchema)