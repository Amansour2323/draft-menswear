import { useState } from "react";

/*
 ╔═══════════════════════════════════════════════════════════════╗
 ║  DRAFT POS — Pages 9-12: Sales, Reports, Financial, POS     ║
 ║  Same theme + localStorage as Dashboard (d_ prefix)          ║
 ║  Financial Logic:                                            ║
 ║    Net Revenue = Sales − Returns                             ║
 ║    Gross Profit = Net Revenue − COGS                         ║
 ║    Net Profit = Gross Profit − Expenses                      ║
 ╚═══════════════════════════════════════════════════════════════╝
*/

const K = { products:"d_products", sales:"d_sales", customers:"d_customers", suppliers:"d_suppliers", supInvoices:"d_supInvoices", expenses:"d_expenses", employees:"d_employees", drawer:"d_drawer", accounts:"d_accounts", settings:"d_settings" };
const load = k => { try { return JSON.parse(localStorage.getItem(K[k])||"[]") } catch { return [] } };
const save = (k,v) => localStorage.setItem(K[k], JSON.stringify(v));
const loadObj = k => { try { return JSON.parse(localStorage.getItem(K[k])||"{}") } catch { return {} } };
const saveObj = (k,v) => localStorage.setItem(K[k], JSON.stringify(v));
const genId = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const fmt = n => `EGP ${(n||0).toLocaleString()}`;
const fDT = d => d ? new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}) : "—";
const fDate = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const inRange = (date,a,b) => { if(!date)return false; const d=new Date(date).getTime(); return d>=new Date(a).setHours(0,0,0,0)&&d<=new Date(b).setHours(23,59,59,999) };
const td0 = () => new Date().toISOString().split("T")[0];
const ago = n => { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split("T")[0] };

const T = { bg:"#0a0a0a",surface:"#131311",card:"#1a1917",border:"#2a2822",borderLight:"#3d3a30",accent:"#c8b07a",accentDim:"rgba(200,176,122,0.10)",accentGlow:"rgba(200,176,122,0.25)",text:"#f0ece6",textSec:"#b5ae9e",textDim:"#7a7468",green:"#6abf69",greenDim:"rgba(106,191,105,0.12)",red:"#e06060",redDim:"rgba(224,96,96,0.12)",blue:"#6aa8e0",blueDim:"rgba(106,168,224,0.12)",orange:"#e8a838",orangeDim:"rgba(232,168,56,0.12)" };

// ── Shared UI ──
const Card = ({children,style:st}) => <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,...st}}>{children}</div>;
const Badge = ({children,color="accent"}) => { const m={accent:[T.accentDim,T.accent],green:[T.greenDim,T.green],red:[T.redDim,T.red],blue:[T.blueDim,T.blue],orange:[T.orangeDim,T.orange]};const[bg,fg]=m[color]||m.accent;return<span style={{display:"inline-flex",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:500,background:bg,color:fg}}>{children}</span>};
const Btn = ({children,onClick,variant="primary",disabled=false}) => { const st={primary:{background:T.accent,color:T.bg},secondary:{background:"transparent",color:T.textSec,border:`1px solid ${T.border}`},danger:{background:T.redDim,color:T.red,border:`1px solid rgba(224,96,96,0.2)`}};return<button onClick={onClick} disabled={disabled} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 16px",borderRadius:8,fontSize:12,fontWeight:600,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.4:1,fontFamily:"inherit",border:"none",...st[variant]}}>{children}</button>};
const Input = ({label,...p}) => <div>{label&&<label style={{display:"block",fontSize:12,fontWeight:500,color:T.textSec,marginBottom:6}}>{label}</label>}<input{...p} style={{width:"100%",padding:"10px 14px",borderRadius:8,fontSize:13,outline:"none",background:T.surface,border:`1px solid ${T.border}`,color:T.text,fontFamily:"inherit",...p.style}} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/></div>;
const Modal = ({open,onClose,title,children}) => { if(!open)return null;return<div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)"}} onClick={onClose}><div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,width:"90%",maxWidth:500,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:20,borderBottom:`1px solid ${T.border}`}}><h3 style={{fontSize:16,fontWeight:600,color:T.text}}>{title}</h3><button onClick={onClose} style={{width:28,height:28,borderRadius:"50%",background:T.surface,border:"none",cursor:"pointer",color:T.textSec,fontSize:16}}>✕</button></div><div style={{padding:20}}>{children}</div></div></div>};
const StatCard = ({label,value,color=T.accent,sub}) => <Card style={{padding:16,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,right:0,width:60,height:60,borderRadius:"50%",background:color,filter:"blur(30px)",opacity:0.1}}/><div style={{fontSize:11,color:T.textDim,marginBottom:6}}>{label}</div><div style={{fontSize:20,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",color:T.text}}>{value}</div>{sub&&<div style={{fontSize:10,color:T.textDim,marginTop:4}}>{sub}</div>}</Card>;
const DateFilter = ({from,to,setFrom,setTo,t}) => <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,background:T.surface,border:`1px solid ${T.border}`,fontSize:12,color:T.textSec}}><span>{t("From","من")}</span><input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{background:"transparent",border:"none",outline:"none",color:T.text,fontSize:12,fontFamily:"inherit"}}/><span>{t("To","إلى")}</span><input type="date" value={to} onChange={e=>setTo(e.target.value)} style={{background:"transparent",border:"none",outline:"none",color:T.text,fontSize:12,fontFamily:"inherit"}}/></div>{[[td0(),td0(),"Today","اليوم",true],[ago(7),td0(),"7 Days","7 أيام"],[ago(30),td0(),"30 Days","30 يوم"],[ago(365),td0(),"All","الكل"]].map(([f,t2,en,ar,active],i)=><button key={i} onClick={()=>{setFrom(f);setTo(t2)}} style={{padding:"5px 12px",borderRadius:8,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",border:`1px solid ${active?T.accentGlow:T.border}`,background:active?T.accentDim:T.surface,color:active?T.accent:T.textDim}}>{t(en,ar)}</button>)}</div>;
const th = {textAlign:"left",padding:"10px 16px",fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:1,color:T.textDim,background:T.surface,borderBottom:`1px solid ${T.border}`};
const tdS = {padding:"12px 16px",fontSize:13,borderBottom:`1px solid ${T.border}`,color:T.text};
const tdM = {...tdS,fontFamily:"'IBM Plex Mono',monospace"};


// ══════════════════════════════════════════════════════════════
// 9. SALES PAGE
// ══════════════════════════════════════════════════════════════
export function SalesPage({ t, show }) {
  const [from, setFrom] = useState(ago(30));
  const [to, setTo] = useState(td0());
  const [filter, setFilter] = useState("all");
  const [refresh, setRefresh] = useState(0);

  const allSales = load("sales");
  const ranged = allSales.filter(s => inRange(s.date, from, to));
  const filtered = filter === "all" ? ranged
    : filter === "sales" ? ranged.filter(s => !s.isReturn && s.status === "completed")
    : filter === "returns" ? ranged.filter(s => s.isReturn)
    : ranged.filter(s => s.status === "canceled");

  const totalSales = ranged.filter(s => !s.isReturn && s.status === "completed").reduce((a, b) => a + b.total, 0);
  const totalReturns = ranged.filter(s => s.isReturn).reduce((a, b) => a + b.total, 0);
  const canceledCount = ranged.filter(s => s.status === "canceled").length;

  const cancelSale = (id) => {
    if (!confirm(t("Cancel this sale? Stock will be restored.", "إلغاء الفاتورة؟ سيتم استرجاع المخزون."))) return;
    const all = load("sales");
    const sale = all.find(s => s.id === id);
    if (!sale || sale.status !== "completed" || sale.isReturn) return;

    // Mark canceled
    sale.status = "canceled";
    sale.canceledAt = Date.now();
    sale.canceledBy = "Admin";

    // Restore stock
    const prods = load("products");
    sale.items.forEach(i => { const p = prods.find(x => x.id === i.pid); if (p) p.stock += i.qty; });
    save("products", prods);

    // Reverse payment accounts
    const accounts = loadObj("accounts");
    sale.payments.forEach(p => { accounts[p.method] = (accounts[p.method] || 0) - p.amount; });
    saveObj("accounts", accounts);

    save("sales", all);
    setRefresh(r => r + 1);
    show(t("Sale canceled & stock restored", "تم إلغاء الفاتورة واسترجاع المخزون"));
  };

  const tabBtn = (id, en, ar) => (
    <button onClick={() => setFilter(id)} style={{ padding:"6px 16px",borderRadius:20,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",border:`1px solid ${filter===id?T.accentGlow:T.border}`,background:filter===id?T.accentDim:"transparent",color:filter===id?T.accent:T.textDim }}>{t(en, ar)}</button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <DateFilter from={from} to={to} setFrom={setFrom} setTo={setTo} t={t} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard label={t("Sales", "المبيعات")} value={fmt(totalSales)} color={T.green} sub={`${ranged.filter(s => !s.isReturn && s.status === "completed").length} ${t("orders", "طلب")}`} />
        <StatCard label={t("Returns", "المرتجعات")} value={fmt(totalReturns)} color={T.red} sub={`${ranged.filter(s => s.isReturn).length} ${t("orders", "طلب")}`} />
        <StatCard label={t("Canceled", "الملغية")} value={canceledCount} color={T.orange} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {tabBtn("all", "All", "الكل")}
        {tabBtn("sales", "Sales", "مبيعات")}
        {tabBtn("returns", "Returns", "مرتجعات")}
        {tabBtn("canceled", "Canceled", "ملغية")}
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={th}>{t("ID", "رقم")}</th><th style={th}>{t("Date", "التاريخ")}</th><th style={th}>{t("Customer", "العميل")}</th>
              <th style={th}>{t("Items", "عدد")}</th><th style={th}>{t("Total", "الإجمالي")}</th><th style={th}>{t("Payment", "الدفع")}</th>
              <th style={th}>{t("Status", "الحالة")}</th><th style={th}></th>
            </tr></thead>
            <tbody>
              {filtered.slice().reverse().map(s => (
                <tr key={s.id}>
                  <td style={{...tdM, fontSize:11}}>{s.txn}</td>
                  <td style={{...tdS, fontSize:11, color:T.textDim}}>{fDT(s.date)}</td>
                  <td style={tdS}>{s.custName || "Walk-in"}</td>
                  <td style={tdM}>{s.items.reduce((a, i) => a + i.qty, 0)}</td>
                  <td style={{...tdM, color:T.accent}}>{fmt(s.total)}</td>
                  <td style={tdS}>{s.payments.map((p, i) => <Badge key={i} color="blue">{p.method}</Badge>)}</td>
                  <td style={tdS}>
                    <Badge color={s.status === "canceled" ? "red" : s.isReturn ? "orange" : "green"}>
                      {s.status === "canceled" ? t("Canceled", "ملغية") : s.isReturn ? t("Return", "مرتجع") : t("Completed", "مكتمل")}
                    </Badge>
                  </td>
                  <td style={tdS}>
                    {s.status === "completed" && !s.isReturn && (
                      <button onClick={() => cancelSale(s.id)} style={{ padding:"4px 10px",borderRadius:6,background:T.redDim,border:"none",cursor:"pointer",fontSize:10,color:T.red,fontFamily:"inherit" }}>
                        {t("Cancel", "إلغاء")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td style={{...tdS, textAlign:"center", color:T.textDim}} colSpan={8}>{t("No sales found", "لا توجد مبيعات")}</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// 10. REPORTS PAGE
// ══════════════════════════════════════════════════════════════
export function ReportsPage({ t }) {
  const [from, setFrom] = useState(ago(30));
  const [to, setTo] = useState(td0());

  const products = load("products");
  const allSales = load("sales");
  const sales = allSales.filter(s => s.status === "completed" && !s.isReturn && inRange(s.date, from, to));
  const returns = allSales.filter(s => s.isReturn && inRange(s.date, from, to));

  const totalRev = sales.reduce((a, b) => a + b.total, 0);
  const totalRet = returns.reduce((a, b) => a + b.total, 0);
  const cogs = sales.reduce((a, s) => a + s.items.reduce((b, i) => { const p = products.find(x => x.id === i.pid); return b + (p ? p.cost * i.qty : 0); }, 0), 0);
  const gross = totalRev - totalRet - cogs;
  const avgOrder = sales.length ? Math.round(totalRev / sales.length) : 0;

  // Payment breakdown
  const methods = { Cash: 0, Card: 0, "Vodafone Cash": 0, InstaPay: 0 };
  sales.forEach(s => s.payments.forEach(p => { methods[p.method] = (methods[p.method] || 0) + p.amount; }));

  // Hourly sales (for today)
  const hourly = new Array(24).fill(0);
  const todaySales = allSales.filter(s => s.status === "completed" && !s.isReturn && new Date(s.date).toDateString() === new Date().toDateString());
  todaySales.forEach(s => { const h = new Date(s.date).getHours(); hourly[h] += s.total; });
  const maxHourly = Math.max(...hourly, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <DateFilter from={from} to={to} setFrom={setFrom} setTo={setTo} t={t} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label={t("Revenue", "الإيرادات")} value={fmt(totalRev)} color={T.accent} />
        <StatCard label={t("Returns", "المرتجعات")} value={fmt(totalRet)} color={T.red} />
        <StatCard label={t("COGS", "تكلفة البضاعة")} value={fmt(cogs)} color={T.orange} />
        <StatCard label={t("Gross Profit", "إجمالي الربح")} value={fmt(gross)} color={T.green} />
      </div>

      {/* Payment Breakdown */}
      <Card style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: T.text, marginBottom: 16 }}>{t("Payment Method Breakdown", "توزيع طرق الدفع")}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.entries(methods).map(([m, amt]) => (
            <div key={m}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: T.textSec }}>{m}</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: T.text }}>{fmt(amt)} ({totalRev ? Math.round(amt / totalRev * 100) : 0}%)</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: T.surface, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 3, background: T.accent, width: `${totalRev ? (amt / totalRev) * 100 : 0}%`, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Hourly chart */}
      <Card style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: T.text, marginBottom: 16 }}>{t("Today's Sales by Hour", "مبيعات اليوم بالساعة")}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120 }}>
          {hourly.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "100%", background: v > 0 ? T.accent : T.surface, borderRadius: "2px 2px 0 0", height: `${Math.max((v / maxHourly) * 100, v ? 3 : 1)}%`, minHeight: 2, transition: "height 0.3s", cursor: "pointer" }} title={`${i}:00 — ${fmt(v)}`} />
              {i % 3 === 0 && <span style={{ fontSize: 8, color: T.textDim, marginTop: 4 }}>{i}</span>}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: T.textDim }}>
          <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11 PM</span>
        </div>
      </Card>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// 11. FINANCIAL REPORTS PAGE (P&L, Cash Flow, Balance Sheet)
// ══════════════════════════════════════════════════════════════
export function FinancialPage({ t }) {
  const [tab, setTab] = useState("pnl");
  const [from, setFrom] = useState(ago(30));
  const [to, setTo] = useState(td0());

  const products = load("products");
  const allSales = load("sales");
  const expenses = load("expenses");
  const accounts = loadObj("accounts");
  const suppliers = load("suppliers");

  const sales = allSales.filter(s => s.status === "completed" && !s.isReturn && inRange(s.date, from, to));
  const returns = allSales.filter(s => s.isReturn && inRange(s.date, from, to));
  const expsF = expenses.filter(e => inRange(e.date, from, to));

  // ── Financial Calculations ──
  const totalSales = sales.reduce((a, b) => a + b.total, 0);
  const totalReturns = returns.reduce((a, b) => a + b.total, 0);
  const netRevenue = totalSales - totalReturns;
  const cogs = sales.reduce((a, s) => a + s.items.reduce((b, i) => { const p = products.find(x => x.id === i.pid); return b + (p ? p.cost * i.qty : 0); }, 0), 0);
  const grossProfit = netRevenue - cogs;
  const totalDisc = sales.reduce((a, s) => a + (s.disc || 0) + (s.custDisc || 0), 0);
  const expByType = {};
  expsF.forEach(e => { expByType[e.type] = (expByType[e.type] || 0) + e.amount; });
  const totalExp = expsF.reduce((a, b) => a + b.amount, 0);
  const netProfit = grossProfit - totalExp;

  const cashTotal = Object.values(accounts).reduce((a, b) => a + b, 0);
  const stockValue = products.reduce((a, p) => a + p.cost * p.stock, 0);
  const totalAssets = cashTotal + stockValue;
  const totalLiab = suppliers.reduce((a, s) => a + s.balance, 0);
  const equity = totalAssets - totalLiab;

  const supPaid = suppliers.reduce((a, s) => a + s.paid, 0);

  const Row = ({ label, value, bold = false, color = "", indent = false }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", paddingLeft: indent ? 32 : 16, borderBottom: bold ? `1px solid ${T.borderLight}` : `1px solid ${T.border}`, fontWeight: bold ? 600 : 400 }}>
      <span style={{ fontSize: 12, color: bold ? T.text : T.textSec }}>{label}</span>
      <span style={{ fontSize: 13, fontFamily: "'IBM Plex Mono',monospace", color: color || T.text }}>{typeof value === "number" ? fmt(value) : value}</span>
    </div>
  );

  const SectionHead = ({ children, color = T.accent }) => (
    <div style={{ padding: "8px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, background: T.surface, color }}>{children}</div>
  );

  const tabBtn = (id, en, ar) => (
    <button onClick={() => setTab(id)} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${tab === id ? T.accentGlow : T.border}`, background: tab === id ? T.accentDim : T.card, color: tab === id ? T.accent : T.textDim }}>{t(en, ar)}</button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <DateFilter from={from} to={to} setFrom={setFrom} setTo={setTo} t={t} />
      <div style={{ display: "flex", gap: 8 }}>
        {tabBtn("pnl", "Profit & Loss", "الأرباح والخسائر")}
        {tabBtn("cashflow", "Cash Flow", "التدفق النقدي")}
        {tabBtn("balance", "Balance Sheet", "الميزانية العمومية")}
      </div>

      {tab === "pnl" && (
        <Card style={{ maxWidth: 700 }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{t("Profit & Loss Statement", "قائمة الأرباح والخسائر")}</span>
          </div>
          <SectionHead>{t("Revenue", "الإيرادات")}</SectionHead>
          <Row label={t("Total Sales", "إجمالي المبيعات")} value={totalSales} />
          <Row label={t("Returns", "المرتجعات")} value={totalReturns} color={T.red} />
          <Row label={t("Discounts Given", "الخصومات")} value={totalDisc} color={T.orange} />
          <Row label={t("Net Revenue", "صافي الإيرادات")} value={netRevenue} bold color={T.green} />

          <SectionHead>{t("Cost of Goods Sold", "تكلفة البضاعة المباعة")}</SectionHead>
          <Row label={t("COGS", "تكلفة البضاعة")} value={cogs} />
          <Row label={t("Gross Profit", "إجمالي الربح")} value={grossProfit} bold color={grossProfit >= 0 ? T.green : T.red} />

          <SectionHead>{t("Operating Expenses", "المصروفات التشغيلية")}</SectionHead>
          {Object.entries(expByType).map(([type, amt]) => <Row key={type} label={type} value={amt} indent />)}
          {Object.keys(expByType).length === 0 && <Row label={t("No expenses", "لا مصروفات")} value="—" />}
          <Row label={t("Total Expenses", "إجمالي المصروفات")} value={totalExp} color={T.red} />

          <Row label="" value="" />
          <Row label={t("NET PROFIT", "صافي الربح")} value={netProfit} bold color={netProfit >= 0 ? T.green : T.red} />
          <div style={{ padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace", color: netProfit >= 0 ? T.green : T.red }}>{fmt(netProfit)}</div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>{t("Net Margin:", "الهامش:")} {totalSales ? Math.round((netProfit / totalSales) * 100) : 0}%</div>
          </div>
        </Card>
      )}

      {tab === "cashflow" && (
        <Card style={{ maxWidth: 700 }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{t("Cash Flow Report", "تقرير التدفق النقدي")}</span>
          </div>
          <SectionHead color={T.green}>{t("Cash Inflows", "التدفقات الداخلة")}</SectionHead>
          <Row label={t("Sales Revenue", "إيرادات المبيعات")} value={totalSales} color={T.green} />
          <Row label={t("Total Inflows", "إجمالي الداخل")} value={totalSales} bold color={T.green} />

          <SectionHead color={T.red}>{t("Cash Outflows", "التدفقات الخارجة")}</SectionHead>
          <Row label={t("Operating Expenses", "مصروفات تشغيلية")} value={totalExp} color={T.red} />
          <Row label={t("Customer Returns", "مرتجعات العملاء")} value={totalReturns} color={T.red} />
          <Row label={t("Supplier Payments", "مدفوعات الموردين")} value={supPaid} color={T.red} />
          <Row label={t("Total Outflows", "إجمالي الخارج")} value={totalExp + totalReturns + supPaid} bold color={T.red} />

          <Row label="" value="" />
          <Row label={t("Net Cash Flow", "صافي التدفق النقدي")} value={totalSales - totalExp - totalReturns - supPaid} bold color={(totalSales - totalExp - totalReturns - supPaid) >= 0 ? T.green : T.red} />

          <SectionHead>{t("Current Cash Position", "الوضع النقدي الحالي")}</SectionHead>
          {Object.entries(accounts).map(([m, bal]) => <Row key={m} label={m} value={bal} indent />)}
          <Row label={t("Total Cash", "إجمالي النقدية")} value={cashTotal} bold />
        </Card>
      )}

      {tab === "balance" && (
        <Card style={{ maxWidth: 700 }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{t("Balance Sheet", "الميزانية العمومية")}</span>
          </div>
          <SectionHead color={T.green}>{t("Assets", "الأصول")}</SectionHead>
          <Row label={t("Cash & Bank Accounts", "النقدية والحسابات البنكية")} value={cashTotal} />
          <Row label={t("Inventory (at cost)", "المخزون (بالتكلفة)")} value={stockValue} />
          <Row label={t("Total Assets", "إجمالي الأصول")} value={totalAssets} bold color={T.green} />

          <SectionHead color={T.red}>{t("Liabilities", "الالتزامات")}</SectionHead>
          <Row label={t("Supplier Outstanding Balances", "أرصدة الموردين المستحقة")} value={totalLiab} color={T.red} />
          <Row label={t("Total Liabilities", "إجمالي الالتزامات")} value={totalLiab} bold color={T.red} />

          <SectionHead>{t("Owner's Equity", "حقوق الملكية")}</SectionHead>
          <Row label={t("Equity = Assets − Liabilities", "حقوق الملكية = الأصول − الالتزامات")} value={equity} bold color={equity >= 0 ? T.green : T.red} />

          <div style={{ padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace", color: equity >= 0 ? T.green : T.red }}>{fmt(equity)}</div>
          </div>
        </Card>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// 12. POS PAGE (Full Point of Sale)
// ══════════════════════════════════════════════════════════════
export function POSPage({ t, show }) {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [customer, setCustomer] = useState(null);
  const [payMethod, setPayMethod] = useState("Cash");
  const [discount, setDiscount] = useState(0);
  const [receipt, setReceipt] = useState(null);
  const [custModal, setCustModal] = useState(false);
  const [custSearch, setCustSearch] = useState("");

  const products = load("products");
  const customers = load("customers");
  const settings = loadObj("settings");
  const categories = [...new Set(products.map(p => p.category))];
  const emojis = { Hoodies:"🧥","T-Shirts":"👕",Jackets:"🧥",Pants:"👖",Shoes:"👟",Accessories:"🧢" };

  const filtered = products.filter(p => {
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === "all" || p.category === catFilter;
    return ms && mc && p.stock > 0;
  });

  const addToCart = (p) => {
    setCart(prev => {
      const ex = prev.find(c => c.pid === p.id);
      if (ex) {
        if (ex.qty >= p.stock) { show(t("Out of stock!", "نفد المخزون!"), "error"); return prev; }
        return prev.map(c => c.pid === p.id ? { ...c, qty: c.qty + 1, total: (c.qty + 1) * c.price } : c);
      }
      return [...prev, { pid: p.id, name: p.name, price: p.price, qty: 1, total: p.price }];
    });
  };

  const updateQty = (pid, d) => setCart(prev => prev.map(c => {
    if (c.pid !== pid) return c;
    const nq = c.qty + d;
    if (nq <= 0) return null;
    return { ...c, qty: nq, total: nq * c.price };
  }).filter(Boolean));

  const removeItem = (pid) => setCart(prev => prev.filter(c => c.pid !== pid));

  const subtotal = cart.reduce((a, i) => a + i.total, 0);
  const custDisc = customer ? Math.round(subtotal * (customer.disc / 100)) : 0;
  const total = Math.max(0, subtotal - discount - custDisc);

  const checkout = () => {
    if (!cart.length) return;
    const sales = load("sales");
    const txn = `TXN-${String(sales.length + 1).padStart(3, "0")}`;
    const pointsEarned = Math.floor(total * (settings.loyaltyRate || 0.1));

    const sale = {
      id: genId(), txn, cashier: "Admin",
      custId: customer?.id || null, custName: customer?.name || "Walk-in",
      items: cart, subtotal, disc: discount, custDisc,
      pointsUsed: 0, pointsEarned, total,
      payments: [{ method: payMethod, amount: total }],
      isReturn: false, status: "completed", date: Date.now(),
    };
    sales.push(sale);
    save("sales", sales);

    // Deduct stock
    const prods = load("products");
    cart.forEach(ci => { const p = prods.find(x => x.id === ci.pid); if (p) p.stock = Math.max(0, p.stock - ci.qty); });
    save("products", prods);

    // Update payment account
    const accounts = loadObj("accounts");
    accounts[payMethod] = (accounts[payMethod] || 0) + total;
    saveObj("accounts", accounts);

    // Update customer
    if (customer) {
      const custs = load("customers");
      const c = custs.find(x => x.id === customer.id);
      if (c) { c.points = (c.points || 0) + pointsEarned; c.spent = (c.spent || 0) + total; c.lastDate = Date.now(); }
      save("customers", custs);
    }

    setReceipt(sale);
    setCart([]);
    setDiscount(0);
    setCustomer(null);
    show(t("Sale completed!", "تم إتمام البيع!"));
  };

  return (
    <div style={{ display: "flex", gap: 0, margin: -20, height: "calc(100vh - 65px)" }}>
      {/* Products Grid */}
      <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
        {/* Search */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("Search or scan barcode...", "بحث أو مسح باركود...")}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 13, background: T.card, border: `1px solid ${T.border}`, color: T.text, outline: "none", fontFamily: "inherit" }} />
          <button onClick={() => setCustModal(true)} style={{ padding: "10px 14px", borderRadius: 8, fontSize: 12, background: T.card, border: `1px solid ${customer ? T.accent : T.border}`, color: customer ? T.accent : T.textSec, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            👤 {customer ? customer.name : t("Customer", "العميل")}
          </button>
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {["all", ...categories].map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${catFilter === c ? T.accentGlow : T.border}`, background: catFilter === c ? T.accentDim : "transparent", color: catFilter === c ? T.accent : T.textDim }}>
              {c === "all" ? t("All", "الكل") : c}
            </button>
          ))}
        </div>

        {/* Products */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
          {filtered.map(p => (
            <div key={p.id} onClick={() => addToCart(p)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ width: "100%", aspectRatio: "1", background: T.surface, borderRadius: 8, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{emojis[p.category] || "📦"}</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
              <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace", color: T.accent, marginTop: 4 }}>{fmt(p.price)}</div>
              <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>{p.stock} {t("left", "متبقي")}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Panel */}
      <div style={{ width: 350, background: T.surface, borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: 16, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
            {t("Current Sale", "البيع الحالي")}
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: T.accent, color: T.bg, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{cart.reduce((a, i) => a + i.qty, 0)}</span>
          </span>
          {customer && <Badge color="accent">{customer.name} ({customer.disc}%)</Badge>}
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: T.textDim }}>
              <div style={{ fontSize: 36, opacity: 0.15, marginBottom: 8 }}>🛒</div>
              <p style={{ fontSize: 12 }}>{t("Cart is empty", "السلة فارغة")}</p>
            </div>
          ) : cart.map(item => (
            <div key={item.pid} style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, borderRadius: 8, background: T.card }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", color: T.accent }}>{fmt(item.price)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", border: `1px solid ${T.border}`, borderRadius: 6 }}>
                <button onClick={() => updateQty(item.pid, -1)} style={{ width: 28, height: 28, background: "transparent", border: "none", color: T.textSec, cursor: "pointer", fontSize: 14 }}>−</button>
                <span style={{ width: 28, textAlign: "center", fontSize: 12, fontFamily: "'IBM Plex Mono',monospace", color: T.text }}>{item.qty}</span>
                <button onClick={() => updateQty(item.pid, 1)} style={{ width: 28, height: 28, background: "transparent", border: "none", color: T.textSec, cursor: "pointer", fontSize: 14 }}>+</button>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace", color: T.text, minWidth: 65, textAlign: "right" }}>{fmt(item.total)}</span>
              <button onClick={() => removeItem(item.pid)} style={{ width: 24, height: 24, borderRadius: "50%", background: T.redDim, border: "none", cursor: "pointer", color: T.red, fontSize: 12 }}>✕</button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: 16, borderTop: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label={t("Discount (EGP)", "خصم (ج.م)")} type="number" value={discount || ""} onChange={e => setDiscount(Number(e.target.value))} style={{ padding: "8px 12px", fontSize: 12 }} />

          {/* Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: T.textSec }}><span>{t("Subtotal", "المجموع")}</span><span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{fmt(subtotal)}</span></div>
            {discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: T.red }}><span>{t("Discount", "خصم")}</span><span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>−{fmt(discount)}</span></div>}
            {custDisc > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: T.orange }}><span>{t("Customer Disc.", "خصم العميل")}</span><span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>−{fmt(custDisc)}</span></div>}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
              <span style={{ color: T.text }}>{t("Total", "الإجمالي")}</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: T.accent }}>{fmt(total)}</span>
            </div>
          </div>

          {/* Payment */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {["Cash", "Card", "Vodafone Cash", "InstaPay"].map(m => (
              <button key={m} onClick={() => setPayMethod(m)} style={{
                padding: "8px 4px", borderRadius: 8, fontSize: 10, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                border: `1px solid ${payMethod === m ? T.accent : T.border}`,
                background: payMethod === m ? T.accentDim : "transparent",
                color: payMethod === m ? T.accent : T.textDim,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}>
                {m === "Vodafone Cash" ? "VF Cash" : m}
              </button>
            ))}
          </div>

          <button onClick={checkout} disabled={!cart.length} style={{
            width: "100%", padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 600, letterSpacing: 1, cursor: cart.length ? "pointer" : "not-allowed",
            background: T.accent, color: T.bg, border: "none", fontFamily: "inherit", opacity: cart.length ? 1 : 0.4, transition: "all 0.2s",
          }}>
            {t("Complete Sale", "إتمام البيع")}
          </button>
        </div>
      </div>

      {/* Customer Picker */}
      <Modal open={custModal} onClose={() => setCustModal(false)} title={t("Select Customer", "اختيار عميل")}>
        <Input placeholder={t("Search...", "بحث...")} value={custSearch} onChange={e => setCustSearch(e.target.value)} style={{ marginBottom: 12 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
          <button onClick={() => { setCustomer(null); setCustModal(false); }} style={{ width: "100%", padding: 12, borderRadius: 8, background: T.surface, border: "none", cursor: "pointer", textAlign: "left", color: T.textSec, fontSize: 12, fontFamily: "inherit" }}>
            {t("Walk-in (No discount)", "عميل عابر (بدون خصم)")}
          </button>
          {customers.filter(c => !custSearch || c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.phone.includes(custSearch)).map(c => (
            <button key={c.id} onClick={() => { setCustomer(c); setCustModal(false); }} style={{ width: "100%", padding: 12, borderRadius: 8, background: T.surface, border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "inherit" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: T.text }}>{c.name}</div>
                <div style={{ fontSize: 10, color: T.textDim }}>{c.phone}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <Badge color="accent">{c.disc}%</Badge>
                <div style={{ fontSize: 10, color: T.blue, marginTop: 4 }}>{c.points} {t("pts", "نقطة")}</div>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Receipt */}
      <Modal open={!!receipt} onClose={() => setReceipt(null)} title={t("Receipt", "فاتورة")}>
        {receipt && (
          <div style={{ background: "#fff", color: "#111", padding: 24, borderRadius: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, maxWidth: 300, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 8, fontFamily: "'Bebas Neue',sans-serif" }}>DRAFT</div>
              <div style={{ fontSize: 9, color: "#666" }}>Menswear — Ismailia, Egypt</div>
              <div style={{ fontSize: 9, color: "#666" }}>Sultan Hussein St.</div>
            </div>
            <hr style={{ border: "none", borderTop: "1px dashed #ccc", margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Order:</span><span>{receipt.txn}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Date:</span><span>{fDT(receipt.date)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Customer:</span><span>{receipt.custName}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Payment:</span><span>{receipt.payments[0].method}</span></div>
            <hr style={{ border: "none", borderTop: "1px dashed #ccc", margin: "8px 0" }} />
            {receipt.items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name} x{item.qty}</span>
                <span>{fmt(item.total)}</span>
              </div>
            ))}
            <hr style={{ border: "none", borderTop: "1px dashed #ccc", margin: "8px 0" }} />
            {receipt.disc > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "#c00" }}><span>Discount:</span><span>-{fmt(receipt.disc)}</span></div>}
            {receipt.custDisc > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "#c60" }}><span>Customer Disc.:</span><span>-{fmt(receipt.custDisc)}</span></div>}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14, borderTop: "1px solid #333", paddingTop: 4, marginTop: 4 }}>
              <span>Total:</span><span>{fmt(receipt.total)}</span>
            </div>
            <hr style={{ border: "none", borderTop: "1px dashed #ccc", margin: "8px 0" }} />
            <div style={{ textAlign: "center", fontSize: 9, color: "#999" }}>{settings.footer || "Thank you!"}</div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <Btn variant="secondary" onClick={() => setReceipt(null)}>{t("Close", "إغلاق")}</Btn>
          <Btn onClick={() => window.print()}>🖨️ {t("Print", "طباعة")}</Btn>
        </div>
      </Modal>
    </div>
  );
}
