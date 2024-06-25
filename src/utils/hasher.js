const bcrypt = require('bcryptjs');

async function hash(s) {
  return await bcrypt.hash(s, 10);
};

async function compare(s, hash) {
  return await bcrypt.compare(s, hash);
};

module.exports = {
  hash, compare
}