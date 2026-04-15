#!/bin/bash
# Add Categories CRUD endpoints to server.js

cd /var/www/draft-api

python3 << 'PYEOF'
f = open('server.js').read()

if "/api/admin/categories'" not in f:
    endpoints = """
// Categories CRUD (admin)
app.post('/api/admin/categories', auth, adminOnly, async (req, res) => {
  try {
    const { name, slug, icon } = req.body;
    const { rows } = await pool.query('INSERT INTO categories (name, slug, icon) VALUES ($1, $2, $3) RETURNING *', [name, slug || name.toLowerCase().replace(/[^a-z0-9]+/g,'-'), icon || '']);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/categories/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, slug, icon } = req.body;
    const { rows } = await pool.query('UPDATE categories SET name=$1, slug=$2, icon=$3 WHERE id=$4 RETURNING *', [name, slug, icon, req.params.id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/categories/:id', auth, adminOnly, async (req, res) => {
  try {
    const { rows: prods } = await pool.query('SELECT COUNT(*) FROM products WHERE category_id = $1', [req.params.id]);
    if (parseInt(prods[0].count) > 0) return res.status(400).json({ error: 'Category has products' });
    await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
"""
    f = f.replace("const PORT = process.env.PORT", endpoints + "\nconst PORT = process.env.PORT")
    open('server.js','w').write(f)
    print('✓ Category CRUD endpoints added')
else:
    print('Already exists')
PYEOF

pm2 restart draft-api
sleep 2
curl -s http://localhost:5005/api/health
