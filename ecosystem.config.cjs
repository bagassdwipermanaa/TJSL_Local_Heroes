const path = require('path');

module.exports = {
  apps: [
    {
      name: 'tjsl-backend',
      script: './index.js',
      cwd: path.resolve(__dirname, 'server'),
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
        PORT: 8012
      }
    },
    {
      name: 'tjsl-frontend',
      script: './node_modules/vite/bin/vite.js',
      args: 'preview --host 0.0.0.0 --port 3012',
      cwd: path.resolve(__dirname, 'client'),
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
