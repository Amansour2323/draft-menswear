// ═══════════════════════════════════════════════════════════════
// DRAFT Website — Product Details + Similar + Bundles
// Add this script after the main script in index.html
// ═══════════════════════════════════════════════════════════════

// ── Show Product Detail Page ──
function showProductDetail(pid) {
  const products = ld('products');
  const product = products.find(p => p.id === pid);
  if (!product) return;
  
  // Hide other pages
  document.getElementById('hom').classList.add('hd');
  document.getElementById('ckp').classList.remove('a');
  document.getElementById('sp').classList.remove('a');
  
  // Find or create product detail page
  let pdp = document.getElementById('pdp');
  if (!pdp) {
    pdp = document.createElement('div');
    pdp.id = 'pdp';
    pdp.style.cssText = 'min-height:100vh;padding:100px 40px 60px;display:none';
    document.body.insertBefore(pdp, document.querySelector('.co'));
  }
  pdp.style.display = 'block';
  
  // Find similar products (same category, exclude current)
  const similar = products.filter(p => p.category === product.category && p.id !== pid && p.stock > 0).slice(0, 4);
  
  // Find bundles containing this product
  const bundles = JSON.parse(localStorage.getItem('d_bundles') || '[]');
  const productBundles = bundles.filter(b => b.products.includes(pid));
  
  pdp.innerHTML = `
    <div style="max-width:1200px;margin:0 auto">
      <button onclick="goHome()" style="background:none;border:none;color:#7a7468;font-size:12px;cursor:pointer;margin-bottom:20px;font-family:inherit">← Back to Shop</button>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:60px">
        <div style="background:#151515;border-radius:12px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:120px">${ej[product.category]||'📦'}</div>
        <div>
          <div style="font-size:11px;color:#c8b07a;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px">${product.category}</div>
          <h1 style="font-family:'Bebas Neue';font-size:36px;letter-spacing:4px;margin-bottom:12px">${product.name}</h1>
          <div style="font-size:24px;color:#c8b07a;font-weight:600;margin-bottom:16px">${fm(product.price)}</div>
          <div style="font-size:13px;color:#999;line-height:1.6;margin-bottom:20px">${product.desc||'Premium quality menswear from DRAFT.'}</div>
          
          <div style="display:flex;gap:12px;margin-bottom:20px">
            <div style="padding:8px 14px;background:#1a1917;border-radius:6px;font-size:12px"><span style="color:#7a7468">Size:</span> <strong>${product.size||'Free'}</strong></div>
            <div style="padding:8px 14px;background:#1a1917;border-radius:6px;font-size:12px"><span style="color:#7a7468">Stock:</span> <strong style="color:${product.stock>5?'#6abf69':product.stock>0?'#e8a838':'#e06060'}">${product.stock>0?product.stock+' available':'SOLD OUT'}</strong></div>
          </div>
          
          ${product.stock>0 ? `<button class="ckb" onclick="addC('${product.id}');toast('Added to bag ✓')" style="width:100%;margin-bottom:16px">ADD TO BAG</button>` : '<button class="ckb" disabled style="width:100%;opacity:0.5;cursor:not-allowed">SOLD OUT</button>'}
        </div>
      </div>
      
      ${productBundles.length ? `
        <div style="margin-bottom:60px">
          <h2 style="font-family:'Bebas Neue';font-size:24px;letter-spacing:6px;margin-bottom:24px;color:#c8b07a">🎁 BUNDLE OFFERS</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
            ${productBundles.map(b => {
              const items = b.products.map(pid => products.find(p => p.id === pid)).filter(Boolean);
              const regular = items.reduce((a,p) => a+p.price, 0);
              const savings = regular - b.price;
              return `
                <div style="background:#151515;border:1px solid #c8b07a;border-radius:12px;padding:20px">
                  <div style="font-size:16px;font-weight:600;color:#c8b07a;margin-bottom:6px">${b.name}</div>
                  <div style="font-size:11px;color:#999;margin-bottom:12px">${b.desc||''}</div>
                  ${items.map(i=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;color:#999"><span>${i.name}</span><span>${fm(i.price)}</span></div>`).join('')}
                  <div style="border-top:1px solid #2a2822;margin-top:10px;padding-top:10px;display:flex;justify-content:space-between;align-items:center">
                    <div>
                      <div style="font-size:11px;color:#7a7468;text-decoration:line-through">${fm(regular)}</div>
                      <div style="font-size:20px;color:#6abf69;font-weight:700">${fm(b.price)}</div>
                    </div>
                    <button class="ckb" style="padding:10px 16px;font-size:11px" onclick="addBundle('${b.id}')">ADD BUNDLE</button>
                  </div>
                  <div style="text-align:center;font-size:10px;color:#6abf69;margin-top:6px">SAVE ${fm(savings)}</div>
                </div>`;
            }).join('')}
          </div>
        </div>
      ` : ''}
      
      ${similar.length ? `
        <div>
          <h2 style="font-family:'Bebas Neue';font-size:24px;letter-spacing:6px;margin-bottom:24px">SIMILAR PRODUCTS</h2>
          <div class="sg">
            ${similar.map(p => `
              <div class="pc" onclick="showProductDetail('${p.id}')">
                <div class="pi">${ej[p.category]||'📦'}<div class="qa">View</div></div>
                <div class="pn">${p.name}</div>
                <div class="pp">${fm(p.price)}</div>
                <div class="ps">Size: ${p.size}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
  
  window.scrollTo(0, 0);
}

// ── Add Bundle to Cart ──
function addBundle(bundleId) {
  const bundles = JSON.parse(localStorage.getItem('d_bundles') || '[]');
  const bundle = bundles.find(b => b.id === bundleId);
  if (!bundle) return;
  
  const products = ld('products');
  const items = bundle.products.map(pid => products.find(p => p.id === pid)).filter(Boolean);
  if (!items.every(i => i.stock > 0)) {
    toast('Some bundle items are out of stock');
    return;
  }
  
  // Calculate per-item discount (proportional)
  const regular = items.reduce((a,p) => a+p.price, 0);
  const ratio = bundle.price / regular;
  
  items.forEach(p => {
    const discountedPrice = Math.round(p.price * ratio);
    cart.push({
      pid: p.id, name: p.name + ' (Bundle: ' + bundle.name + ')',
      price: discountedPrice, size: p.size, category: p.category,
      qty: 1, total: discountedPrice, isBundle: true, bundleId: bundle.id
    });
  });
  
  rCart();
  toast('🎁 Bundle added to bag ✓');
}

// ── Modify product cards to open detail page on click instead of add ──
// Change addC to be only on the Quick Add button, click on card opens detail
function enhanceProductCards() {
  // Override the rProd function to use detail page
  const origRProd = window.rProd;
  window.rProd = function(f='all') {
    const ps = ld('products');
    const cats = ['all', ...new Set(ps.map(p => p.category))];
    document.getElementById('sfl').innerHTML = cats.map(c => 
      `<button class="fb ${c===f?'a':''}" onclick="rProd('${c}')">${c==='all'?'All':c}</button>`
    ).join('');
    const fl = f==='all' ? ps : ps.filter(p => p.category === f);
    document.getElementById('sgr').innerHTML = fl.map(p => `
      <div class="pc ${p.stock<=0?'oos':''}" onclick="showProductDetail('${p.id}')">
        <div class="pi">${ej[p.category]||'📦'}<div class="qa">${p.stock>0?'View Details':'Sold Out'}</div></div>
        <div class="pn">${p.name}</div>
        <div class="pp">${fm(p.price)}</div>
        <div class="ps">Size: ${p.size} · ${p.stock>0?p.stock+' left':'Sold out'}</div>
      </div>
    `).join('');
    
    // Also show featured bundles at top
    showFeaturedBundles();
  };
  
  // Re-render
  if (window.rProd) window.rProd();
}

// ── Show Featured Bundles on Homepage ──
function showFeaturedBundles() {
  const bundles = JSON.parse(localStorage.getItem('d_bundles') || '[]');
  if (!bundles.length) return;
  
  let bundleSection = document.getElementById('bundleSection');
  if (!bundleSection) {
    bundleSection = document.createElement('section');
    bundleSection.id = 'bundleSection';
    bundleSection.className = 'sec';
    bundleSection.style.background = 'linear-gradient(135deg, #151515 0%, #0a0a0a 100%)';
    const shop = document.getElementById('shop');
    shop.parentNode.insertBefore(bundleSection, shop);
  }
  
  const products = ld('products');
  bundleSection.innerHTML = `
    <div style="text-align:center;margin-bottom:40px">
      <div class="sl" style="color:#6abf69">Special Offers</div>
      <h2 class="st">🎁 BUNDLES</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;max-width:1200px;margin:0 auto">
      ${bundles.map(b => {
        const items = b.products.map(pid => products.find(p => p.id === pid)).filter(Boolean);
        const regular = items.reduce((a,p) => a+p.price, 0);
        const savings = regular - b.price;
        const savingsPct = Math.round((savings/regular)*100);
        return `
          <div style="background:#151515;border:1px solid #c8b07a;border-radius:12px;padding:24px;position:relative">
            <div style="position:absolute;top:-12px;right:16px;background:#6abf69;color:#000;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700">SAVE ${savingsPct}%</div>
            <div style="font-size:18px;font-weight:600;color:#c8b07a;margin-bottom:6px">${b.name}</div>
            <div style="font-size:12px;color:#999;margin-bottom:14px">${b.desc||'Limited time offer'}</div>
            <div style="margin-bottom:14px">
              ${items.map(i=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:6px 0;color:#999;border-bottom:1px solid #2a2822"><span>${i.name}</span><span>${fm(i.price)}</span></div>`).join('')}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <div style="font-size:12px;color:#7a7468;text-decoration:line-through">${fm(regular)}</div>
              <div style="font-size:24px;color:#6abf69;font-weight:700">${fm(b.price)}</div>
            </div>
            <button class="ckb" style="width:100%" onclick="addBundle('${b.id}')">ADD BUNDLE TO BAG</button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Initialize on page load
window.addEventListener('load', () => {
  setTimeout(() => {
    enhanceProductCards();
    showFeaturedBundles();
  }, 100);
});

// Override goHome to also hide product detail page
const origGoHome = window.goHome;
window.goHome = function() {
  const pdp = document.getElementById('pdp');
  if (pdp) pdp.style.display = 'none';
  if (origGoHome) origGoHome();
  else {
    document.getElementById('hom').classList.remove('hd');
    document.getElementById('ckp').classList.remove('a');
    document.getElementById('sp').classList.remove('a');
    window.scrollTo(0, 0);
    if (window.rProd) rProd();
  }
};
