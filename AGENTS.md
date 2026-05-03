# Project Instructions

Whenever the user asks for an "update", always provide the following command sequence:

`cd /root/bsuiness-profile && git reset --hard && git pull && npm install && npm run build && pm2 restart all`
