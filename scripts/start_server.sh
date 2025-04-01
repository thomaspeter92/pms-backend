#!/bin/bash
export NVM_DIR="/home/ec2-user/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use 22

cd /home/ec2-user/pms-backend

echo "Starting app with PM2..."

# Optional: remove if not needed
pm2 delete pms-backend || echo "PM2 app not found, continuing..."

# Start the app if the file exists
if [ -f "dist/src/main.js" ]; then
  pm2 start dist/src/main.js --name pms-backend
  pm2 save
else
  echo "❌ Error: dist/src/main.js not found"
  exit 1
fi

# DO NOT run this during CodeDeploy (it requires sudo and causes failure)
# pm2 startup systemd -u ec2-user --hp /home/ec2-user
