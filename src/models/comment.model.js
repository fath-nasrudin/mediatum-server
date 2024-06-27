const { database } = require('../utils/db');

const Schema = database.Schema;

const commentSchema = new Schema({
  content: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  article: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports = database.model('Comment', commentSchema)