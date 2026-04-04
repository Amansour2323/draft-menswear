import { useState } from "react";

/*
 ╔═══════════════════════════════════════════════════════════════╗
 ║  DRAFT POS — Pages 6-8: Drawer Sessions, Inventory,         ║
 ║  Suppliers (with auto-stock from invoices)                   ║
 ╚═══════════════════════════════════════════════════════════════╝
*/

// ── Shared (same keys/helpers as Dashboard) ──
const K = { products:"d_products", sales:"d_sales", customers:"d_customers", suppliers:"d_suppliers", supInvoices:"d_supInvoices", expenses:"d_expenses", employees:"d_employees", drawer:"d_drawer", accounts:"d_accounts", settings:"d_settings" };
const load = k => { try { return JSON.parse(localStorage.getItem(K[k])||"[]") } catch { return [] } };
const save = (k,v) => localStorage.setItem(K[k],JSON.stringify(v));
const loadObj = k => { try { return JSON.parse(localStorage.getItem(K[k])||"{}") } catch { return {} } };
const saveObj = (k,v) => localStorage.setItem(K[k],JSON.stringify(v));
const genId = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const fmt = n => `EGP ${(n||0).toLocaleString()}`;
const fDate = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fDT = d => d ? new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}) : "—";

const T = { bg:"#0a0a0a",surface:"#131311",card:"#1a1917",border:"#2a2822",borderLight:"#3d3a30",accent:"#c8b07a",accentDim:"rgba(200,176,122,0.10)",accentGlow:"rgba(200,176,122,0.25)",text:"#f0ece6",textSec:"#b5ae9e",textDim:"#7a7468",green:"#6abf69",greenDim:"rgba(106,191,105,0.12)",red:"#e06060",redDim:"rgba(224,96,96,0.12)",blue:"#6aa8e0",blueDim:"rgba(106,168,224,0.12)",orange:"#e8a838",orangeDim:"rgba(232,168,56,0.12)" };

const Card = ({children, style:st}) => <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,...st}}>{children}</div>;
const Badge = ({children, color="accent"}) => { const m={accent:[T.accentDim,T.accent],green:[T.greenDim,T.green],red:[T.redDim,T.red],blue:[T.blueDim,T.blue],orange:[T.orangeDim,T.orange]};const[bg,fg]=m[color]||m.accent;return<span style={{display:"inline-flex",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:500,background:bg,color:fg}}>{children}</span>};
const Btn = ({children,onClick,variant="primary",disabled=false,className=""}) => { const st={primary:{background:T.accent,color:T.bg},secondary:{background:"transparent",color:T.textSec,border:`1px solid ${T.border}`},danger:{background:T.redDim,color:T.red,border:`1px solid rgba(224,96,96,0.2)`}};return<button onClick={onClick} disabled={disabled} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 16px",borderRadius:8,fontSize:12,fontWeight:600,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.4:1,fontFamily:"inherit",border:"none",...st[variant]}}>{children}</button>};
const Input = ({label,...p}) => <div>{label&&<label style={{display:"block",fontSize:12,fontWeight:500,color:T.textSec,marginBottom:6}}>{label}</label>}<input{...p} style={{width:"100%",padding:"10px 14px",borderRadius:8,fontSize:13,outline:"none",background:T.surface,border:`1px solid ${T.border}`,color:T.text,fontFamily:"inherit",...p.style}} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/></div>;
const Select = ({label,options,...p}) => <div>{label&&<label style={{display:"block",fontSize:12,fontWeight:500,color:T.textSec,marginBottom:6}}>{label}</label>}<select{...p} style={{width:"100%",padding:"10px 14px",borderRadius:8,fontSize:13,outline:"none",background:T.surface,border:`1px solid ${T.border}`,color:T.text,fontFamily:"inherit"}}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
const Modal = ({open,onClose,title,children,wide=false}) => { if(!open)return null;return<div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)"}} onClick={onClose}><div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,width:"90%",maxWidth:wide?800:500,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:20,borderBottom:`1px solid ${T.border}`}}><h3 style={{fontSize:16,fontWeight:600,color:T.text}}>{title}</h3><button onClick={onClose} style={{width:28,height:28,borderRadius:"50%",background:T.surface,border:"none",cursor:"pointer",color:T.textSec,fontSize:16}}>✕</button></div><div style={{padding:20}}>{children}</div></div></div>};
const StatCard = ({label,value,icon,color=T.accent}) => <Card style={{padding:16,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,right:0,width:60,height:60,borderRadius:"50%",background:color,filter:"blur(30px)",opacity:0.1}}/><div style={{fontSize:11,color:T.textDim,marginBottom:6}}>{label}</div><div style={{fontSize:20,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",color:T.text}}>{value}</div></Card>;
const th = {textAlign:"left",padding:"10px 16px",fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:1,color:T.textDim,background:T.surface,borderBottom:`1px solid ${T.border}`};
const td = {padding:"12px 16px",fontSize:13,borderBottom:`1px solid ${T.border}`,color:T.text};
const tdM = {...td,fontFamily:"'IBM Plex Mono',monospace"};


// ══════════════════════════════════════════════════════════════
// 6. DRAWER SESSIONS PAGE
// ══════════════════════════════════════════════════════════════
export function DrawerPage({ t, show }) {
  const [sessions, setSessions] = useState(load("drawer"));
  const [openBal, setOpenBal] = useState(0);
  const [closeBal, setCloseBal] = useState(0);

  const active = sessions.find(s => s.status === "open");

  const openDrawer = () => {
    const sess = { id: genId(), cashier: "Admin", opening: openBal, closing: 0, expected: openBal, diff: 0, openedAt: Date.now(), closedAt: null, status: "open", salesCount: 0, salesTotal: 0 };
    const updated = [...sessions, sess];
    save("drawer", updated);
    setSessions(updated);
    setOpenBal(0);
    show(t("Drawer opened!", "تم فتح الدراور!"));
  };

  const closeDrawer = () => {
    if (!active) return;
    const sales = load("sales").filter(s => s.date >= active.openedAt && s.status === "completed" && !s.isReturn);
    const cashIn = sales.reduce((a, s) => a + s.payments.filter(p => p.method === "Cash").reduce((b, p) => b + p.amount, 0), 0);
    const returns = load("sales").filter(s => s.date >= active.openedAt && s.isReturn);
    const retCash = returns.reduce((a, s) => a + s.total, 0);
    const expCash = load("expenses").filter(e => e.date >= active.openedAt && e.payMethod === "Cash").reduce((a, e) => a + e.amount, 0);
    const expected = active.opening + cashIn - retCash - expCash;

    const updated = sessions.map(s => s.id === active.id ? {
      ...s, status: "closed", closedAt: Date.now(), closing: closeBal,
      expected, diff: closeBal - expected,
      salesCount: sales.length, salesTotal: sales.reduce((a, b) => a + b.total, 0),
    } : s);
    save("drawer", updated);
    setSessions(updated);
    setCloseBal(0);
    show(t("Drawer closed!", "تم قفل الدراور!"));
  };

  // Active session live stats
  const liveStats = active ? (() => {
    const sales = load("sales").filter(s => s.date >= active.openedAt && s.status === "completed" && !s.isReturn);
    const methods = { Cash: 0, Card: 0, "Vodafone Cash": 0, InstaPay: 0 };
    sales.forEach(s => s.payments.forEach(p => { methods[p.method] = (methods[p.method] || 0) + p.amount; }));
    const totalSales = sales.reduce((a, b) => a + b.total, 0);
    const retTotal = load("sales").filter(s => s.date >= active.openedAt && s.isReturn).reduce((a, b) => a + b.total, 0);
    return { totalSales, retTotal, count: sales.length, methods };
  })() : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          {active ? <Badge color="green">{t("OPEN since", "مفتوح منذ")} {fDT(active.openedAt)}</Badge>
                   : <Badge color="red">{t("No active drawer", "لا يوجد دراور مفتوح")}</Badge>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!active && <>
            <Input placeholder={t("Opening balance", "رصيد الفتح")} type="number" value={openBal || ""} onChange={e => setOpenBal(Number(e.target.value))} style={{ width: 150, padding: "8px 12px", fontSize: 12 }} />
            <Btn onClick={openDrawer}>+ {t("Open", "فتح")}</Btn>
          </>}
          {active && <>
            <Input placeholder={t("Closing balance", "الرصيد الفعلي")} type="number" value={closeBal || ""} onChange={e => setCloseBal(Number(e.target.value))} style={{ width: 150, padding: "8px 12px", fontSize: 12 }} />
            <Btn variant="danger" onClick={closeDrawer}>✕ {t("Close", "قفل")}</Btn>
          </>}
        </div>
      </div>

      {/* Live Stats */}
      {liveStats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <StatCard label={t("Opening Balance", "رصيد الفتح")} value={fmt(active.opening)} color={T.accent} />
          <StatCard label={t("Session Sales", "مبيعات الجلسة")} value={fmt(liveStats.totalSales)} color={T.green} />
          <StatCard label={t("Session Returns", "مرتجعات")} value={fmt(liveStats.retTotal)} color={T.red} />
          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: T.textDim, marginBottom: 8 }}>{t("Payment Split", "توزيع الدفع")}</div>
            {Object.entries(liveStats.methods).filter(([, v]) => v > 0).map(([m, v]) => (
              <div key={m} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0" }}>
                <span style={{ color: T.textSec }}>{m}</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: T.text }}>{fmt(v)}</span>
              </div>
            ))}
            {Object.values(liveStats.methods).every(v => v === 0) && <div style={{ fontSize: 11, color: T.textDim }}>{t("No sales yet", "لا مبيعات")}</div>}
          </Card>
        </div>
      )}

      {/* History */}
      <Card>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{t("Session History", "سجل الجلسات")}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={th}>{t("Cashier", "الكاشير")}</th><th style={th}>{t("Opened", "الفتح")}</th><th style={th}>{t("Closed", "الإغلاق")}</th>
              <th style={th}>{t("Opening", "رصيد الفتح")}</th><th style={th}>{t("Expected", "المتوقع")}</th><th style={th}>{t("Actual", "الفعلي")}</th>
              <th style={th}>{t("Difference", "الفرق")}</th><th style={th}>{t("Sales", "المبيعات")}</th><th style={th}>{t("Status", "الحالة")}</th>
            </tr></thead>
            <tbody>
              {sessions.slice().reverse().map(s => (
                <tr key={s.id}>
                  <td style={td}>{s.cashier}</td>
                  <td style={{...td,fontSize:11}}>{fDT(s.openedAt)}</td>
                  <td style={{...td,fontSize:11}}>{s.closedAt ? fDT(s.closedAt) : "—"}</td>
                  <td style={tdM}>{fmt(s.opening)}</td>
                  <td style={tdM}>{fmt(s.expected)}</td>
                  <td style={tdM}>{s.status==="closed" ? fmt(s.closing) : "—"}</td>
                  <td style={{...tdM,color:s.diff>0?T.green:s.diff<0?T.red:T.text}}>{s.status==="closed" ? (s.diff>=0?"+":"")+fmt(s.diff) : "—"}</td>
                  <td style={tdM}>{s.salesCount||0} ({fmt(s.salesTotal||0)})</td>
                  <td style={td}><Badge color={s.status==="open"?"green":"blue"}>{s.status==="open"?t("Open","مفتوح"):t("Closed","مغلق")}</Badge></td>
                </tr>
              ))}
              {sessions.length===0 && <tr><td style={{...td,textAlign:"center",color:T.textDim}} colSpan={9}>{t("No sessions","لا توجد جلسات")}</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// 7. INVENTORY PAGE
// ══════════════════════════════════════════════════════════════
export function InventoryPage({ t, show }) {
  const [products, setProducts] = useState(load("products"));
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);

  const categories = [...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search));
    const matchCat = catFilter === "all" || p.category === catFilter;
    const matchStock = stockFilter === "all" || (stockFilter === "low" && p.stock > 0 && p.stock <= 5) || (stockFilter === "out" && p.stock === 0);
    return matchSearch && matchCat && matchStock;
  });

  const totalValue = products.reduce((a, p) => a + p.cost * p.stock, 0);
  const totalRetailValue = products.reduce((a, p) => a + p.price * p.stock, 0);

  const handleSave = (data) => {
    let prods = load("products");
    if (edit) { prods = prods.map(p => p.id === edit.id ? { ...p, ...data } : p); }
    else { prods.push({ id: genId(), ...data }); }
    save("products", prods);
    setProducts(prods);
    setModal(false); setEdit(null);
    show(t("Product saved!", "تم حفظ المنتج!"));
  };

  const handleDelete = (id) => {
    if (!confirm(t("Delete?", "حذف؟"))) return;
    const prods = load("products").filter(p => p.id !== id);
    save("products", prods);
    setProducts(prods);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard label={t("Total Products", "إجمالي المنتجات")} value={products.length} color={T.blue} />
        <StatCard label={t("Stock Value (Cost)", "قيمة المخزون (تكلفة)")} value={fmt(totalValue)} color={T.accent} />
        <StatCard label={t("Stock Value (Retail)", "قيمة المخزون (بيع)")} value={fmt(totalRetailValue)} color={T.green} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("Search...", "بحث...")}
            style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, background: T.card, border: `1px solid ${T.border}`, color: T.text, outline: "none", width: 200, fontFamily: "inherit" }} />
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, background: T.card, border: `1px solid ${T.border}`, color: T.text, outline: "none", fontFamily: "inherit" }}>
            <option value="all">{t("All Categories", "كل الفئات")}</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, background: T.card, border: `1px solid ${T.border}`, color: T.text, outline: "none", fontFamily: "inherit" }}>
            <option value="all">{t("All Stock", "كل المخزون")}</option>
            <option value="low">{t("Low Stock", "منخفض")}</option>
            <option value="out">{t("Out of Stock", "نفد")}</option>
          </select>
        </div>
        <Btn onClick={() => { setEdit(null); setModal(true); }}>+ {t("Add Product", "إضافة منتج")}</Btn>
      </div>

      {/* Table */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={th}>SKU</th><th style={th}>{t("Product", "المنتج")}</th><th style={th}>{t("Category", "الفئة")}</th>
              <th style={th}>{t("Size", "المقاس")}</th><th style={th}>{t("Cost", "التكلفة")}</th><th style={th}>{t("Price", "السعر")}</th>
              <th style={th}>{t("Stock", "المخزون")}</th><th style={th}>{t("Status", "الحالة")}</th><th style={th}></th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{...tdM,fontSize:11}}>{p.sku}</td>
                  <td style={{...td,fontWeight:500}}>{p.name}</td>
                  <td style={td}><Badge color="blue">{p.category}</Badge></td>
                  <td style={td}>{p.size}</td>
                  <td style={tdM}>{fmt(p.cost)}</td>
                  <td style={{...tdM,color:T.accent}}>{fmt(p.price)}</td>
                  <td style={tdM}>{p.stock}</td>
                  <td style={td}>
                    <Badge color={p.stock===0?"red":p.stock<=5?"orange":"green"}>
                      {p.stock===0?t("Out","نفد"):p.stock<=5?t("Low","منخفض"):t("OK","متوفر")}
                    </Badge>
                  </td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => { setEdit(p); setModal(true); }} style={{ padding: "4px 8px", borderRadius: 6, background: T.blueDim, border: "none", cursor: "pointer", fontSize: 11 }}>✏️</button>
                      <button onClick={() => handleDelete(p.id)} style={{ padding: "4px 8px", borderRadius: 6, background: T.redDim, border: "none", cursor: "pointer", fontSize: 11 }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td style={{...td,textAlign:"center",color:T.textDim}} colSpan={9}>{t("No products","لا توجد منتجات")}</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modal} onClose={() => { setModal(false); setEdit(null); }} title={edit ? t("Edit Product","تعديل") : t("Add Product","إضافة منتج")}>
        <ProductForm t={t} onSave={handleSave} onClose={() => { setModal(false); setEdit(null); }} editItem={edit} />
      </Modal>
    </div>
  );
}

function ProductForm({ t, onSave, onClose, editItem }) {
  const [f, setF] = useState(editItem || { name:"", category:"Hoodies", sku:"", barcode:"", size:"M", cost:0, price:0, stock:0, supplier:"" });
  const u = (k,v) => setF(prev => ({...prev,[k]:v}));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <Input label={t("Product Name","اسم المنتج")} value={f.name} onChange={e => u("name",e.target.value)} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Input label="SKU" value={f.sku} onChange={e => u("sku",e.target.value)} />
        <Input label={t("Barcode","باركود")} value={f.barcode} onChange={e => u("barcode",e.target.value)} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Select label={t("Category","الفئة")} value={f.category} onChange={e => u("category",e.target.value)} options={["Hoodies","T-Shirts","Jackets","Pants","Shoes","Accessories"].map(c=>({value:c,label:c}))} />
        <Select label={t("Size","المقاس")} value={f.size} onChange={e => u("size",e.target.value)} options={["XS","S","M","L","XL","XXL","XXXL","Free","38","39","40","41","42","43","44","45"].map(s=>({value:s,label:s}))} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
        <Input label={t("Cost","التكلفة")} type="number" value={f.cost||""} onChange={e => u("cost",Number(e.target.value))} />
        <Input label={t("Price","سعر البيع")} type="number" value={f.price||""} onChange={e => u("price",Number(e.target.value))} />
        <Input label={t("Stock","الكمية")} type="number" value={f.stock||""} onChange={e => u("stock",Number(e.target.value))} />
      </div>
      <Input label={t("Supplier","المورد")} value={f.supplier} onChange={e => u("supplier",e.target.value)} />
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:8 }}>
        <Btn variant="secondary" onClick={onClose}>{t("Cancel","إلغاء")}</Btn>
        <Btn onClick={() => onSave(f)} disabled={!f.name}>{t("Save","حفظ")}</Btn>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// 8. SUPPLIERS PAGE (with auto-stock invoices)
// ══════════════════════════════════════════════════════════════
export function SuppliersPage({ t, show }) {
  const [tab, setTab] = useState("suppliers");
  const [suppliers, setSuppliers] = useState(load("suppliers"));
  const [invoices, setInvoices] = useState(load("supInvoices"));
  const [supModal, setSupModal] = useState(false);
  const [invModal, setInvModal] = useState(false);

  const saveSupplier = (data) => {
    const sups = load("suppliers");
    sups.push({ id: genId(), ...data, purchases: 0, paid: 0, balance: 0 });
    save("suppliers", sups);
    setSuppliers(sups);
    setSupModal(false);
    show(t("Supplier saved!", "تم حفظ المورد!"));
  };

  // ★ AUTO-STOCK: Invoice → Products added to inventory automatically
  const saveInvoice = (data) => {
    const invs = load("supInvoices");
    invs.push({ id: genId(), ...data, paidAmt: 0, remaining: data.total, status: "مستحقة" });
    save("supInvoices", invs);

    // ★ Add items to inventory
    const products = load("products");
    data.items.forEach(item => {
      // Match by name or SKU
      const existing = products.find(p =>
        p.name.toLowerCase() === item.name.toLowerCase() || (item.sku && p.sku === item.sku)
      );
      if (existing) {
        existing.stock += item.qty;
        existing.cost = item.cost; // Update cost price
      } else {
        products.push({
          id: genId(), name: item.name, category: item.category || "Other",
          sku: item.sku || `DRF-${String(products.length + 1).padStart(3, "0")}`,
          barcode: "", size: item.size || "M",
          cost: item.cost, price: item.sellPrice || Math.round(item.cost * 2),
          stock: item.qty, supplier: data.supName,
        });
      }
    });
    save("products", products);

    // Update supplier balance
    const sups = load("suppliers");
    const sup = sups.find(s => s.id === data.supId);
    if (sup) { sup.purchases += data.total; sup.balance += data.total; }
    save("suppliers", sups);
    setSuppliers(load("suppliers"));
    setInvoices(load("supInvoices"));
    setInvModal(false);
    show(t("Invoice saved & stock updated!", "تم حفظ الفاتورة وتحديث المخزون تلقائياً!"));
  };

  const tabBtn = (id, en, ar) => (
    <button onClick={() => setTab(id)} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${tab===id?T.accentGlow:T.border}`, background: tab===id?T.accentDim:"transparent", color: tab===id?T.accent:T.textDim }}>{t(en,ar)}</button>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", gap:8 }}>{tabBtn("suppliers","Suppliers","الموردين")}{tabBtn("invoices","Invoices","الفواتير")}</div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn variant="secondary" onClick={() => setSupModal(true)}>+ {t("Add Supplier","إضافة مورد")}</Btn>
          <Btn onClick={() => setInvModal(true)}>📄 {t("New Invoice","فاتورة جديدة")}</Btn>
        </div>
      </div>

      {tab==="suppliers" && (
        <Card><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><th style={th}>{t("Name","الاسم")}</th><th style={th}>{t("Company","الشركة")}</th><th style={th}>{t("Phone","الهاتف")}</th><th style={th}>{t("Terms","الشروط")}</th><th style={th}>{t("Purchases","المشتريات")}</th><th style={th}>{t("Paid","المدفوع")}</th><th style={th}>{t("Balance","الرصيد")}</th></tr></thead>
          <tbody>{suppliers.map(s => (
            <tr key={s.id}><td style={td}>{s.name}</td><td style={td}>{s.company}</td><td style={{...tdM,fontSize:11}}>{s.phone}</td><td style={td}><Badge color="blue">{s.terms}</Badge></td><td style={tdM}>{fmt(s.purchases)}</td><td style={{...tdM,color:T.green}}>{fmt(s.paid)}</td><td style={{...tdM,color:s.balance>0?T.red:T.green}}>{fmt(s.balance)}</td></tr>
          ))}</tbody>
        </table></div></Card>
      )}

      {tab==="invoices" && (
        <Card><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><th style={th}>#</th><th style={th}>{t("Supplier","المورد")}</th><th style={th}>{t("Date","التاريخ")}</th><th style={th}>{t("Items","المنتجات")}</th><th style={th}>{t("Total","الإجمالي")}</th><th style={th}>{t("Remaining","المتبقي")}</th><th style={th}>{t("Status","الحالة")}</th></tr></thead>
          <tbody>{invoices.map(inv => (
            <tr key={inv.id}><td style={{...tdM,fontSize:11}}>{inv.invNum||"—"}</td><td style={td}>{inv.supName}</td><td style={{...td,fontSize:11}}>{fDate(inv.date)}</td><td style={tdM}>{inv.items?.length||0}</td><td style={tdM}>{fmt(inv.total)}</td><td style={{...tdM,color:T.red}}>{fmt(inv.remaining)}</td><td style={td}><Badge color={inv.status==="مدفوعة بالكامل"?"green":"orange"}>{inv.status}</Badge></td></tr>
          ))}</tbody>
        </table></div></Card>
      )}

      {/* Add Supplier Modal */}
      <Modal open={supModal} onClose={() => setSupModal(false)} title={t("Add Supplier","إضافة مورد")}>
        <SupplierForm t={t} onSave={saveSupplier} onClose={() => setSupModal(false)} />
      </Modal>

      {/* Invoice Modal */}
      <Modal open={invModal} onClose={() => setInvModal(false)} title={t("New Invoice (Auto-Stock)","فاتورة مورد (إضافة تلقائية للمخزون)")} wide>
        <InvoiceForm t={t} onSave={saveInvoice} onClose={() => setInvModal(false)} suppliers={suppliers} />
      </Modal>
    </div>
  );
}

function SupplierForm({ t, onSave, onClose }) {
  const [f, setF] = useState({ name:"", company:"", phone:"", terms:"نقدي فوري" });
  const u = (k,v) => setF(prev => ({...prev,[k]:v}));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Input label={t("Name","الاسم")} value={f.name} onChange={e => u("name",e.target.value)} />
        <Input label={t("Company","الشركة")} value={f.company} onChange={e => u("company",e.target.value)} />
      </div>
      <Input label={t("Phone","الهاتف")} value={f.phone} onChange={e => u("phone",e.target.value)} />
      <Select label={t("Payment Terms","شروط الدفع")} value={f.terms} onChange={e => u("terms",e.target.value)} options={["نقدي فوري","10 أيام","15 يوم","30 يوم","60 يوم","90 يوم"].map(v => ({value:v,label:v}))} />
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:8 }}>
        <Btn variant="secondary" onClick={onClose}>{t("Cancel","إلغاء")}</Btn>
        <Btn onClick={() => onSave(f)} disabled={!f.name}>{t("Save","حفظ")}</Btn>
      </div>
    </div>
  );
}

function InvoiceForm({ t, onSave, onClose, suppliers }) {
  const [f, setF] = useState({
    supId: suppliers[0]?.id || "", supName: suppliers[0]?.name || "",
    invNum: "", date: new Date().toISOString().split("T")[0],
    items: [{ name: "", qty: 1, cost: 0, sellPrice: 0, size: "M", sku: "", category: "Hoodies" }],
  });

  const addItem = () => setF(prev => ({ ...prev, items: [...prev.items, { name: "", qty: 1, cost: 0, sellPrice: 0, size: "M", sku: "", category: "Hoodies" }] }));
  const updateItem = (i, k, v) => setF(prev => ({ ...prev, items: prev.items.map((item, idx) => idx === i ? { ...item, [k]: v } : item) }));
  const removeItem = (i) => setF(prev => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }));
  const total = f.items.reduce((a, i) => a + i.qty * i.cost, 0);

  const selectSupplier = (id) => {
    const sup = suppliers.find(s => s.id === id);
    setF(prev => ({ ...prev, supId: id, supName: sup?.name || sup?.company || "" }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Select label={t("Supplier", "المورد")} value={f.supId} onChange={e => selectSupplier(e.target.value)}
          options={suppliers.map(s => ({ value: s.id, label: s.company || s.name }))} />
        <Input label={t("Invoice #", "رقم الفاتورة")} value={f.invNum} onChange={e => setF(prev => ({ ...prev, invNum: e.target.value }))} />
        <Input label={t("Date", "التاريخ")} type="date" value={f.date} onChange={e => setF(prev => ({ ...prev, date: e.target.value }))} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{t("Items (auto-add to stock)", "المنتجات (تلقائي للمخزون)")}</h4>
        <Btn variant="secondary" onClick={addItem}>+ {t("Add", "إضافة")}</Btn>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
        {f.items.map((item, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 2fr 2fr 1fr 1fr", gap: 8, alignItems: "end", padding: 12, borderRadius: 8, background: T.surface }}>
            <Input label={i === 0 ? t("Product", "المنتج") : ""} value={item.name} onChange={e => updateItem(i, "name", e.target.value)} />
            <Input label={i === 0 ? t("Qty", "كمية") : ""} type="number" value={item.qty} onChange={e => updateItem(i, "qty", Number(e.target.value))} />
            <Input label={i === 0 ? t("Cost", "تكلفة") : ""} type="number" value={item.cost} onChange={e => updateItem(i, "cost", Number(e.target.value))} />
            <Input label={i === 0 ? t("Sell Price", "سعر بيع") : ""} type="number" value={item.sellPrice} onChange={e => updateItem(i, "sellPrice", Number(e.target.value))} />
            <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: T.accent, paddingBottom: 10 }}>{fmt(item.qty * item.cost)}</div>
            {f.items.length > 1 && <button onClick={() => removeItem(i)} style={{ padding: "6px 10px", borderRadius: 6, background: T.redDim, border: "none", cursor: "pointer", fontSize: 11, color: T.red, marginBottom: 4 }}>🗑️</button>}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>
          {t("Total:", "الإجمالي:")} <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: T.accent }}>{fmt(total)}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="secondary" onClick={onClose}>{t("Cancel", "إلغاء")}</Btn>
          <Btn onClick={() => onSave({ ...f, total })} disabled={!f.supId || f.items.some(i => !i.name)}>
            ✓ {t("Save & Add to Stock", "حفظ وإضافة للمخزون")}
          </Btn>
        </div>
      </div>
    </div>
  );
}
