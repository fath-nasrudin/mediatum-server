module.exports = {
  port: process.env.PORT || '3000',
  db: {
    stringConnection: process.env.MONGODB_URI || 'mongodb://localhost:27017'
  }
}