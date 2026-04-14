// ═══════════════════════════════════════════════════════════════
// DRAFT — Customer Accounts + Wishlist
// Include this script AFTER the main index.html script
// ═══════════════════════════════════════════════════════════════

const AUTH_KEY = 'draft_customer_token';
let currentUser = null;
let currentToken = localStorage.getItem(AUTH_KEY);

async function apiAuth(path, opts = {}) {
  opts.headers = opts.headers || {};
  opts.headers['Content-Type'] = 'application/json';
  if (currentToken) opts.headers['Authorization'] = 'Bearer ' + currentToken;
  const res = await fetch(API + path, opts);
  if (res.status === 401) { logoutCustomer(); return null; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error');
  return data;
}

// ═════════ Add Account Button to Navbar ═════════
function addAccountButton() {
  const nr = document.querySelector('.nr');
  if (!nr || document.getElementById('accountBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'accountBtn';
  btn.className = 'nb';
  btn.onclick = toggleAccountMenu;
  btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  nr.insertBefore(btn, nr.firstChild);
}

function toggleAccountMenu() {
  if (currentToken) showAccountPage();
  else showLoginModal();
}

// ═════════ Login/Register Modal ═════════
function showLoginModal() {
  if (document.getElementById('authModal')) {
    document.getElementById('authModal').style.display = 'flex';
    return;
  }
  const modal = document.createElement('div');
  modal.id = 'authModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:3000;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
  modal.innerHTML = `
    <div style="background:#151515;border:1px solid #2a2822;border-radius:12px;padding:32px;max-width:400px;width:100%">
      <div style="text-align:center;margin-bottom:24px">
        <h2 style="font-family:'Bebas Neue';font-size:28px;letter-spacing:8px;color:#c8b07a" id="authTitle">LOGIN</h2>
      </div>
      
      <div id="loginForm">
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:11px;color:#b5ae9e;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Phone or Email</label>
          <input id="authLoginId" style="width:100%;padding:12px;background:#0a0a0a;border:1px solid #2a2822;border-radius:6px;color:#f0ece6;font-family:inherit;outline:none" placeholder="01012345678">
        </div>
        <div style="margin-bottom:16px">
          <label style="display:block;font-size:11px;color:#b5ae9e;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Password</label>
          <input type="password" id="authLoginPass" style="width:100%;padding:12px;background:#0a0a0a;border:1px solid #2a2822;border-radius:6px;color:#f0ece6;font-family:inherit;outline:none">
        </div>
        <button onclick="doLogin()" style="width:100%;padding:14px;background:#c8b07a;color:#0a0a0a;border:none;border-radius:8px;font-weight:600;letter-spacing:2px;cursor:pointer;font-family:inherit">LOGIN</button>
        <p style="text-align:center;margin-top:16px;font-size:12px;color:#7a7468">
          Don't have account? <a onclick="switchToRegister()" style="color:#c8b07a;cursor:pointer">Register</a>
        </p>
      </div>
      
      <div id="registerForm" style="display:none">
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:11px;color:#b5ae9e;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Full Name</label>
          <input id="authRegName" style="width:100%;padding:12px;background:#0a0a0a;border:1px solid #2a2822;border-radius:6px;color:#f0ece6;font-family:inherit;outline:none">
        </div>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:11px;color:#b5ae9e;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Phone *</label>
          <input id="authRegPhone" style="width:100%;padding:12px;background:#0a0a0a;border:1px solid #2a2822;border-radius:6px;color:#f0ece6;font-family:inherit;outline:none" placeholder="01012345678">
        </div>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:11px;color:#b5ae9e;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Email</label>
          <input id="authRegEmail" style="width:100%;padding:12px;background:#0a0a0a;border:1px solid #2a2822;border-radius:6px;color:#f0ece6;font-family:inherit;outline:none">
        </div>
        <div style="margin-bottom:16px">
          <label style="display:block;font-size:11px;color:#b5ae9e;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Password *</label>
          <input type="password" id="authRegPass" style="width:100%;padding:12px;background:#0a0a0a;border:1px solid #2a2822;border-radius:6px;color:#f0ece6;font-family:inherit;outline:none">
        </div>
        <button onclick="doRegister()" style="width:100%;padding:14px;background:#c8b07a;color:#0a0a0a;border:none;border-radius:8px;font-weight:600;letter-spacing:2px;cursor:pointer;font-family:inherit">REGISTER</button>
        <p style="text-align:center;margin-top:16px;font-size:12px;color:#7a7468">
          Have account? <a onclick="switchToLogin()" style="color:#c8b07a;cursor:pointer">Login</a>
        </p>
      </div>
      
      <div id="authError" style="color:#e06060;text-align:center;margin-top:12px;font-size:12px"></div>
      <div style="text-align:center;margin-top:16px"><button onclick="document.getElementById('authModal').style.display='none'" style="background:none;border:none;color:#7a7468;cursor:pointer;font-size:11px">✕ Close</button></div>
    </div>
  `;
  document.body.appendChild(modal);
}

function switchToRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
  document.getElementById('authTitle').textContent = 'REGISTER';
  document.getElementById('authError').textContent = '';
}
function switchToLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('authTitle').textContent = 'LOGIN';
  document.getElementById('authError').textContent = '';
}

async function doLogin() {
  try {
    const data = await apiAuth('/customer/login', {
      method: 'POST',
      body: JSON.stringify({
        emailOrPhone: document.getElementById('authLoginId').value.trim(),
        password: document.getElementById('authLoginPass').value
      })
    });
    currentToken = data.token;
    currentUser = data.user;
    localStorage.setItem(AUTH_KEY, currentToken);
    document.getElementById('authModal').style.display = 'none';
    toast('✓ Welcome back ' + currentUser.name);
    updateAccountButton();
  } catch (e) { document.getElementById('authError').textContent = e.message; }
}

async function doRegister() {
  try {
    const data = await apiAuth('/customer/register', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('authRegName').value.trim(),
        phone: document.getElementById('authRegPhone').value.trim(),
        email: document.getElementById('authRegEmail').value.trim(),
        password: document.getElementById('authRegPass').value
      })
    });
    currentToken = data.token;
    currentUser = data.user;
    localStorage.setItem(AUTH_KEY, currentToken);
    document.getElementById('authModal').style.display = 'none';
    toast('✓ Account created!');
    updateAccountButton();
  } catch (e) { document.getElementById('authError').textContent = e.message; }
}

function logoutCustomer() {
  localStorage.removeItem(AUTH_KEY);
  currentToken = null;
  currentUser = null;
  toast('Logged out');
  goHome();
  updateAccountButton();
}

function updateAccountButton() {
  const btn = document.getElementById('accountBtn');
  if (!btn) return;
  if (currentToken) {
    btn.innerHTML = `<svg viewBox="0 0 24 24" style="fill:#c8b07a;stroke:#c8b07a"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  }
}

// ═════════ Account Page ═════════
async function showAccountPage() {
  try {
    currentUser = await apiAuth('/customer/me');
    const orders = await apiAuth('/customer/orders');
    const wishlist = await apiAuth('/customer/wishlist');
    
    document.getElementById('hom').classList.add('hd');
    document.getElementById('pdp').classList.remove('a');
    document.getElementById('ckp').classList.remove('a');
    document.getElementById('sp').classList.remove('a');
    
    let accountPage = document.getElementById('accountPage');
    if (!accountPage) {
      accountPage = document.createElement('div');
      accountPage.id = 'accountPage';
      accountPage.style.cssText = 'min-height:100vh;padding:100px 40px 60px';
      document.body.insertBefore(accountPage, document.querySelector('.co'));
    }
    accountPage.style.display = 'block';
    
    accountPage.innerHTML = `
      <div style="max-width:1000px;margin:0 auto">
        <button onclick="goHomeAccount()" style="background:none;border:none;color:#7a7468;cursor:pointer;font-size:12px;margin-bottom:20px;font-family:inherit">← Back to Shop</button>
        
        <div style="display:grid;grid-template-columns:250px 1fr;gap:30px">
          <div style="background:#151515;border:1px solid #2a2822;border-radius:12px;padding:20px;height:fit-content">
            <div style="text-align:center;margin-bottom:20px">
              <div style="width:60px;height:60px;border-radius:50%;background:#c8b07a;color:#0a0a0a;display:inline-flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;margin-bottom:10px">${currentUser.name[0].toUpperCase()}</div>
              <div style="font-weight:600">${currentUser.name}</div>
              <div style="font-size:11px;color:#7a7468">${currentUser.phone}</div>
            </div>
            <button onclick="showAccountTab('orders')" id="tab-orders" class="acctab active" style="width:100%;padding:10px;margin-bottom:6px;background:rgba(200,176,122,0.1);color:#c8b07a;border:none;border-radius:6px;cursor:pointer;font-family:inherit;text-align:left;font-size:12px">📦 My Orders (${orders.length})</button>
            <button onclick="showAccountTab('wishlist')" id="tab-wishlist" class="acctab" style="width:100%;padding:10px;margin-bottom:6px;background:transparent;color:#b5ae9e;border:none;border-radius:6px;cursor:pointer;font-family:inherit;text-align:left;font-size:12px">❤️ Wishlist (${wishlist.length})</button>
            <button onclick="showAccountTab('profile')" id="tab-profile" class="acctab" style="width:100%;padding:10px;margin-bottom:6px;background:transparent;color:#b5ae9e;border:none;border-radius:6px;cursor:pointer;font-family:inherit;text-align:left;font-size:12px">👤 Profile</button>
            <button onclick="logoutCustomer()" style="width:100%;padding:10px;margin-top:12px;background:rgba(224,96,96,0.1);color:#e06060;border:none;border-radius:6px;cursor:pointer;font-family:inherit;font-size:12px">Logout</button>
          </div>
          
          <div id="accountContent"></div>
        </div>
      </div>
    `;
    
    renderAccountTab('orders', orders, wishlist);
  } catch (e) { toast('Error loading account'); }
}

function goHomeAccount() {
  const p = document.getElementById('accountPage');
  if (p) p.style.display = 'none';
  goHome();
}

let accountData = { orders: [], wishlist: [] };

async function showAccountTab(tab) {
  document.querySelectorAll('.acctab').forEach(el => {
    el.style.background = 'transparent';
    el.style.color = '#b5ae9e';
  });
  const active = document.getElementById('tab-' + tab);
  if (active) {
    active.style.background = 'rgba(200,176,122,0.1)';
    active.style.color = '#c8b07a';
  }
  
  if (tab === 'orders') accountData.orders = await apiAuth('/customer/orders');
  if (tab === 'wishlist') accountData.wishlist = await apiAuth('/customer/wishlist');
  renderAccountTab(tab, accountData.orders, accountData.wishlist);
}

function renderAccountTab(tab, orders, wishlist) {
  const content = document.getElementById('accountContent');
  if (!content) return;
  
  if (tab === 'orders') {
    content.innerHTML = `
      <h2 style="font-family:'Bebas Neue';font-size:28px;letter-spacing:4px;margin-bottom:20px">My Orders</h2>
      ${orders.length ? orders.map(o => `
        <div style="background:#151515;border:1px solid #2a2822;border-radius:10px;padding:16px;margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px">
            <div><strong style="color:#c8b07a">${o.order_number}</strong></div>
            <span style="padding:2px 10px;border-radius:10px;background:rgba(200,176,122,0.15);color:#c8b07a;font-size:10px;font-weight:600">${o.status.toUpperCase()}</span>
          </div>
          <div style="font-size:12px;color:#7a7468;margin-bottom:8px">${new Date(o.created_at).toLocaleString()}</div>
          <div style="font-size:12px;color:#b5ae9e">${(o.items||[]).length} items</div>
          <div style="display:flex;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid #2a2822">
            <span style="color:#7a7468;font-size:12px">Total</span>
            <span style="color:#c8b07a;font-weight:700">EGP ${(+o.total).toLocaleString()}</span>
          </div>
        </div>
      `).join('') : '<div style="text-align:center;padding:40px;color:#7a7468">No orders yet</div>'}
    `;
  }
  
  if (tab === 'wishlist') {
    content.innerHTML = `
      <h2 style="font-family:'Bebas Neue';font-size:28px;letter-spacing:4px;margin-bottom:20px">My Wishlist</h2>
      ${wishlist.length ? `<div class="sg">${wishlist.map(p => {
        const img = p.images && p.images[0];
        return `<div class="pc" onclick="goHomeAccount();setTimeout(()=>showProduct(${p.id}),100)">
          <div class="pi">${img?`<img src="${img}">`:'<div class="ph">📦</div>'}<div class="qa">View</div></div>
          <div class="pn">${p.name}</div><div class="pp">EGP ${(+p.price).toLocaleString()}</div>
          <button onclick="event.stopPropagation();removeFromWishlist(${p.id})" style="margin-top:8px;width:100%;padding:6px;background:rgba(224,96,96,0.1);color:#e06060;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-family:inherit">Remove</button>
        </div>`;
      }).join('')}</div>` : '<div style="text-align:center;padding:40px;color:#7a7468">Your wishlist is empty. Click the ❤️ on any product to add it.</div>'}
    `;
  }
  
  if (tab === 'profile') {
    content.innerHTML = `
      <h2 style="font-family:'Bebas Neue';font-size:28px;letter-spacing:4px;margin-bottom:20px">Profile</h2>
      <div style="background:#151515;border:1px solid #2a2822;border-radius:10px;padding:20px">
        <div style="margin-bottom:16px"><div style="font-size:11px;color:#7a7468;text-transform:uppercase;letter-spacing:1px">Name</div><div>${currentUser.name}</div></div>
        <div style="margin-bottom:16px"><div style="font-size:11px;color:#7a7468;text-transform:uppercase;letter-spacing:1px">Phone</div><div>${currentUser.phone}</div></div>
        <div style="margin-bottom:16px"><div style="font-size:11px;color:#7a7468;text-transform:uppercase;letter-spacing:1px">Email</div><div>${currentUser.email||'—'}</div></div>
        <div style="margin-bottom:16px"><div style="font-size:11px;color:#7a7468;text-transform:uppercase;letter-spacing:1px">Total Spent</div><div style="color:#c8b07a;font-weight:600">EGP ${(+currentUser.total_spent||0).toLocaleString()}</div></div>
        <div><div style="font-size:11px;color:#7a7468;text-transform:uppercase;letter-spacing:1px">Loyalty Points</div><div style="color:#6abf69;font-weight:600">${currentUser.points||0} pts</div></div>
      </div>
    `;
  }
}

// ═════════ Wishlist Buttons on Products ═════════
async function toggleWishlist(productId) {
  if (!currentToken) { showLoginModal(); return; }
  try {
    const wishlist = await apiAuth('/customer/wishlist');
    const isIn = wishlist.some(w => w.id === productId);
    if (isIn) {
      await apiAuth('/customer/wishlist/' + productId, { method: 'DELETE' });
      toast('Removed from wishlist');
    } else {
      await apiAuth('/customer/wishlist/' + productId, { method: 'POST' });
      toast('❤️ Added to wishlist');
    }
    updateWishlistButtons();
  } catch (e) { toast('Error'); }
}

async function updateWishlistButtons() {
  if (!currentToken) return;
  try {
    const wishlist = await apiAuth('/customer/wishlist');
    const ids = new Set(wishlist.map(w => w.id));
    document.querySelectorAll('[data-wishlist]').forEach(btn => {
      const pid = +btn.dataset.wishlist;
      btn.style.color = ids.has(pid) ? '#e06060' : '#7a7468';
    });
  } catch (e) {}
}

// ═════════ Init ═════════
setTimeout(() => {
  addAccountButton();
  updateAccountButton();
  if (currentToken) updateWishlistButtons();
}, 500);
