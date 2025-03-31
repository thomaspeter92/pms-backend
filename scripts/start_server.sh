#!/bin/bash
cd /home/ec2-user/pms-backend

echo "Starting app with PM2..."

# Kill previous instance if needed (optional)
pm2 delete pms-backend || true

# Start or restart the app with PM2
pm2 start dist/index.js --name pms-backend

# Save PM2 process list and startup script for reboot
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user
