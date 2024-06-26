module.exports = {
  port: process.env.PORT || '3000',
  db: {
    stringConnection: process.env.MONGODB_URI || 'mongodb://localhost:27017/mediatum'
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET,
      exp: process.env.JWT_REFRESH_EXP,
    },
    access: {
      secret: process.env.JWT_ACCESS_SECRET,
      exp: process.env.JWT_ACCESS_EXP,
    },
  }
}