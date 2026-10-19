module.exports = {
  apps: [
    {
      name: 'tjsl-backend',
      script: './index.js',
      cwd: '/var/www/TJSL_Local_Heroes/server',
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
        PORT: 8002
      }
    },
    {
      name: 'tjsl-frontend',
      script: './node_modules/vite/bin/vite.js',
      args: 'preview --host 0.0.0.0 --port 3002',
      cwd: '/var/www/TJSL_Local_Heroes/client',
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
