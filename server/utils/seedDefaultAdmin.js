const bcrypt = require('bcrypt');
const { Admin } = require('../models/Admin');

async function seedDefaultAdmin() {
  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;

  if (!email || !password) return;

  const existing = await Admin.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.create({ email, passwordHash });
  console.log('Default admin seeded');
}

module.exports = { seedDefaultAdmin };
