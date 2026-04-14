#!/bin/bash
# Install WhatsApp module on the API server

# 1. Install node-fetch
cd /var/www/draft-api
npm install node-fetch@2

# 2. Copy WhatsApp module
# Upload whatsapp-module.js to /var/www/draft-api/whatsapp.js

# 3. Add to server.js (manual edit needed)
cat << 'INSTRUCTIONS'

═══════════════════════════════════════════
✅ WhatsApp module installed!

📝 Next steps:

1. Get your provider credentials:
   - UltraMSG: https://ultramsg.com
   - Meta: https://developers.facebook.com/products/whatsapp

2. Login to admin and configure WhatsApp:
   POST /api/admin/settings with:
   {
     "wa_enabled": "true",
     "wa_provider": "ultramsg",  // or "meta"
     "wa_token": "your_token",
     "wa_instance": "instance123456",
     "wa_merchant_phone": "201012345678"  // your phone with country code
   }

3. Restart API:
   pm2 restart draft-api

═══════════════════════════════════════════
INSTRUCTIONS
