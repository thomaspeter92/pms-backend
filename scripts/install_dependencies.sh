#!/bin/bash
cd /home/ec2-user/pms-backend

echo "Installing dependencies..."
npm install

echo "Compiling TypeScript..."
npx tsc

echo "Installing PM2 globally..."
npm install -g pm2
