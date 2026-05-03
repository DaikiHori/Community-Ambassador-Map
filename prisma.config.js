// prisma.config.js
const { defineConfig } = require('@prisma/config');
const path = require('path');

module.exports = defineConfig({
  datasource: {
    url: `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`,
  },
});