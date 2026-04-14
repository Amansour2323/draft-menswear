#!/bin/bash
# Setup file uploads on our own server

# 1. Create uploads directory
mkdir -p /var/www/draft-menswear/uploads/products
chmod 755 /var/www/draft-menswear/uploads/products

# 2. Install multer (already installed)
cd /var/www/draft-api
npm list multer || npm install multer

# 3. Install sharp for image optimization
npm install sharp

# 4. Add upload endpoint to server.js
python3 << 'PYEOF'
f = open('/var/www/draft-api/server.js').read()

# Add required imports at top (after existing requires)
if "require('multer')" not in f:
    imports = """const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const UPLOAD_DIR = '/var/www/draft-menswear/uploads/products';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer config - store in memory for processing
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});
"""
    f = f.replace("require('dotenv').config();", "require('dotenv').config();\n" + imports)

# Add upload endpoint before app.listen
if "/api/admin/upload" not in f:
    upload_endpoint = """
// ═══ IMAGE UPLOAD ═══
app.post('/api/admin/upload', auth, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    const urls = [];
    for (const file of req.files) {
      // Generate unique filename
      const ext = '.webp'; // Convert all to WebP for better compression
      const filename = 'img-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext;
      const outputPath = path.join(UPLOAD_DIR, filename);
      
      // Optimize: resize to max 1200px, convert to WebP, 85% quality
      await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      urls.push('/uploads/products/' + filename);
    }
    res.json({ urls });
  } catch (e) { 
    console.error('Upload error:', e);
    res.status(500).json({ error: e.message }); 
  }
});

// Delete uploaded image
app.delete('/api/admin/upload', auth, adminOnly, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !url.startsWith('/uploads/')) return res.status(400).json({ error: 'Invalid URL' });
    const filePath = path.join('/var/www/draft-menswear', url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
"""
    f = f.replace("const PORT = process.env.PORT || 3000;", upload_endpoint + "\nconst PORT = process.env.PORT || 3000;")

open('/var/www/draft-api/server.js','w').write(f)
print('✓ Upload endpoints added')
PYEOF

# 5. Configure nginx to serve /uploads
cat > /tmp/nginx-uploads.conf << 'NGINX'
    location /uploads/ {
        alias /var/www/draft-menswear/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
NGINX

# Add to existing nginx config (if not already there)
if ! grep -q "location /uploads/" /etc/nginx/sites-available/draft; then
  sed -i '/server_name _;/r /tmp/nginx-uploads.conf' /etc/nginx/sites-available/draft
fi

nginx -t && systemctl reload nginx
pm2 restart draft-api

echo "✓ File upload ready!"
echo "URLs will be: http://76.13.143.42:8080/uploads/products/img-*.webp"
