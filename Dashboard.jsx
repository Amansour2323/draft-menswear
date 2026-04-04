import { useState, useEffect, useCallback } from "react";

/*
 ╔═══════════════════════════════════════════════════════════════╗
 ║  DRAFT POS — Dashboard + Shell (Page 1 of 12)               ║
 ║  Colors: #0a0a0a · #131311 · #1a1917 · #c8b07a              ║
 ║  All modules share localStorage with d_ prefix               ║
 ║  Financial: Net Rev = Sales − Returns                        ║
 ║             Gross Profit = Net Rev − COGS                    ║
 ║             Net Profit = Gross Profit − Expenses             ║
 ╚═══════════════════════════════════════════════════════════════╝
*/

// ══════════ DATA HELPERS ══════════
const K = {
  products: "d_products", sales: "d_sales", customers: "d_customers",
  suppliers: "d_suppliers", supInvoices: "d_supInvoices",
  expenses: "d_expenses", employees: "d_employees",
  drawer: "d_drawer", accounts: "d_accounts", settings: "d_settings",
};
const load = (k) => { try { return JSON.parse(localStorage.getItem(K[k]) || "[]"); } catch { return []; } };
const save = (k, v) => localStorage.setItem(K[k], JSON.stringify(v));
const loadObj = (k) => { try { return JSON.parse(localStorage.getItem(K[k]) || "{}"); } catch { return {}; } };
const saveObj = (k, v) => localStorage.setItem(K[k], JSON.stringify(v));
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmt = (n) => `EGP ${(n || 0).toLocaleString()}`;
const fDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fDateTime = (d) => d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
const inRange = (date, from, to) => {
  if (!date) return false;
  const d = new Date(date).getTime();
  const f = new Date(from).setHours(0, 0, 0, 0);
  const t = new Date(to).setHours(23, 59, 59, 999);
  return d >= f && d <= t;
};
const toISO = (d) => d.toISOString().split("T")[0];
const today = () => toISO(new Date());
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return toISO(d); };

// ══════════ SEED DATA ══════════
function seedData() {
  if (load("products").length > 0) return;
  const now = Date.now();
  save("products", [
    { id: "p1", name: "Essential Oversized Hoodie", category: "Hoodies", sku: "DRF-001", barcode: "6901001", size: "L", cost: 600, price: 1200, stock: 25, supplier: "Cairo Textiles" },
    { id: "p2", name: "Heavyweight Logo Tee", category: "T-Shirts", sku: "DRF-002", barcode: "6901002", size: "M", cost: 280, price: 650, stock: 40, supplier: "Delta Garments" },
    { id: "p3", name: "Technical Cargo Pants", category: "Pants", sku: "DRF-003", barcode: "6901003", size: "L", cost: 700, price: 1450, stock: 18, supplier: "Cairo Textiles" },
    { id: "p4", name: "Varsity Bomber Jacket", category: "Jackets", sku: "DRF-004", barcode: "6901004", size: "XL", cost: 1050, price: 2100, stock: 12, supplier: "Premium Fabrics" },
    { id: "p5", name: "White Cropped Zip Jacket", category: "Jackets", sku: "DRF-005", barcode: "6901005", size: "M", cost: 850, price: 1800, stock: 8, supplier: "Premium Fabrics" },
    { id: "p6", name: "Beige Harrington Jacket", category: "Jackets", sku: "DRF-006", barcode: "6901006", size: "L", cost: 780, price: 1650, stock: 15, supplier: "Cairo Textiles" },
    { id: "p7", name: "Black Oversized Tee", category: "T-Shirts", sku: "DRF-007", barcode: "6901007", size: "XL", cost: 220, price: 550, stock: 50, supplier: "Delta Garments" },
    { id: "p8", name: "Light Wash Baggy Jeans", category: "Pants", sku: "DRF-008", barcode: "6901008", size: "L", cost: 650, price: 1350, stock: 3, supplier: "Denim House" },
    { id: "p9", name: "Chunky Platform Sneakers", category: "Shoes", sku: "DRF-009", barcode: "6901009", size: "43", cost: 950, price: 1900, stock: 10, supplier: "ShoeCo Egypt" },
    { id: "p10", name: "Baseball Cap", category: "Accessories", sku: "DRF-010", barcode: "6901010", size: "Free", cost: 120, price: 350, stock: 30, supplier: "Cairo Textiles" },
  ]);
  save("suppliers", [
    { id: "s1", name: "Ahmed", company: "Cairo Textiles", phone: "01012345678", terms: "30 يوم", purchases: 50000, paid: 35000, balance: 15000 },
    { id: "s2", name: "Mohamed", company: "Premium Fabrics", phone: "01098765432", terms: "نقدي فوري", purchases: 30000, paid: 30000, balance: 0 },
    { id: "s3", name: "Ali", company: "Denim House", phone: "01055551234", terms: "15 يوم", purchases: 20000, paid: 15000, balance: 5000 },
  ]);
  save("customers", [
    { id: "c1", name: "Ahmed Hassan", phone: "01012345678", disc: 5, points: 120, spent: 5500, lastDate: now - 86400000 * 3 },
    { id: "c2", name: "Omar Ali", phone: "01098765432", disc: 0, points: 45, spent: 2100, lastDate: now - 86400000 },
    { id: "c3", name: "Youssef Ibrahim", phone: "01077777777", disc: 10, points: 200, spent: 8500, lastDate: now - 3600000 },
  ]);
  save("employees", [
    { id: "e1", name: "Mohamed Cashier", phone: "01011111111", position: "كاشير", salary: 5000, hireDate: "2024-01-15", status: "نشط", loans: 0 },
    { id: "e2", name: "Sara Accountant", phone: "01022222222", position: "محاسب", salary: 7000, hireDate: "2024-03-01", status: "نشط", loans: 1000 },
  ]);
  saveObj("accounts", { Cash: 15000, Card: 8000, InstaPay: 3000, "Vodafone Cash": 2500 });
  saveObj("settings", {
    store: "DRAFT Menswear", phone: "01000000000",
    address: "السلطان حسين – خلف ماكدونالدز، شارع كليوباترا، الإسماعيلية",
    loyaltyRate: 0.1, loyaltyValue: 1, lowStock: 5,
    footer: "Thank you for shopping at DRAFT! @draftmenswear",
  });
  save("sales", [
    { id: "sal1", txn: "TXN-001", cashier: "Mohamed", custId: "c1", custName: "Ahmed Hassan", items: [{ pid: "p1", name: "Essential Oversized Hoodie", qty: 1, price: 1200, total: 1200 }, { pid: "p2", name: "Heavyweight Logo Tee", qty: 2, price: 650, total: 1300 }], subtotal: 2500, disc: 0, custDisc: 125, total: 2375, payments: [{ method: "Cash", amount: 2375 }], isReturn: false, status: "completed", date: now - 86400000 * 2 },
    { id: "sal2", txn: "TXN-002", cashier: "Mohamed", custId: "c2", custName: "Omar Ali", items: [{ pid: "p4", name: "Varsity Bomber Jacket", qty: 1, price: 2100, total: 2100 }], subtotal: 2100, disc: 0, custDisc: 0, total: 2100, payments: [{ method: "Card", amount: 2100 }], isReturn: false, status: "completed", date: now - 86400000 },
    { id: "sal3", txn: "TXN-003", cashier: "Mohamed", custId: "c3", custName: "Youssef Ibrahim", items: [{ pid: "p5", name: "White Cropped Zip Jacket", qty: 1, price: 1800, total: 1800 }, { pid: "p8", name: "Light Wash Baggy Jeans", qty: 1, price: 1350, total: 1350 }], subtotal: 3150, disc: 0, custDisc: 315, total: 2835, payments: [{ method: "Cash", amount: 1835 }, { method: "Vodafone Cash", amount: 1000 }], isReturn: false, status: "completed", date: now - 43200000 },
  ]);
}

// ══════════ THEME ══════════
const T = {
  bg: "#0a0a0a",
  surface: "#131311",
  card: "#1a1917",
  cardHover: "#23211c",
  border: "#2a2822",
  borderLight: "#3d3a30",
  accent: "#c8b07a",
  accentDim: "rgba(200,176,122,0.10)",
  accentGlow: "rgba(200,176,122,0.25)",
  text: "#f0ece6",
  textSec: "#b5ae9e",
  textDim: "#7a7468",
  green: "#6abf69",
  greenDim: "rgba(106,191,105,0.12)",
  red: "#e06060",
  redDim: "rgba(224,96,96,0.12)",
  blue: "#6aa8e0",
  blueDim: "rgba(106,168,224,0.12)",
  orange: "#e8a838",
  orangeDim: "rgba(232,168,56,0.12)",
};

// ══════════ SHARED UI ══════════
const Svg = ({ name, size = 17, style: st }) => {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    pos: <><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>,
    sales: <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>,
    inventory: <><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></>,
    customers: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></>,
    suppliers: <><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></>,
    employees: <><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></>,
    expenses: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>,
    drawer: <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>,
    analytics: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    financial: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    menu: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    store: <><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
    filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
    cash: <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></>,
    card: <><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>,
    wallet: <><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 100 4 2 2 0 000-4z"/></>,
    undo: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={st}>
      {paths[name] || null}
    </svg>
  );
};

const Card = ({ children, style: st, ...rest }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, ...st }} {...rest}>{children}</div>
);

const Badge = ({ children, color = "accent" }) => {
  const map = { accent: [T.accentDim, T.accent], green: [T.greenDim, T.green], red: [T.redDim, T.red], blue: [T.blueDim, T.blue], orange: [T.orangeDim, T.orange] };
  const [bg, fg] = map[color] || map.accent;
  return <span style={{ display: "inline-flex", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: bg, color: fg }}>{children}</span>;
};

const StatCard = ({ label, value, icon, color = T.accent, sub }) => (
  <Card style={{ padding: 20, position: "relative", overflow: "hidden", transition: "transform 0.3s" }}
    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
    <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "50%", background: color, filter: "blur(40px)", opacity: 0.1 }} />
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textDim, marginBottom: 8 }}>
      <Svg name={icon} size={14} /> {label}
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: T.text }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>{sub}</div>}
  </Card>
);

const DateFilter = ({ from, to, setFrom, setTo, t }) => {
  const presets = [
    { label: t("Today", "اليوم"), f: today(), t: today(), active: true },
    { label: t("7 Days", "7 أيام"), f: daysAgo(7), t: today() },
    { label: t("30 Days", "30 يوم"), f: daysAgo(30), t: today() },
    { label: t("All", "الكل"), f: daysAgo(365), t: today() },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, fontSize: 12, color: T.textSec }}>
        <Svg name="filter" size={13} />
        <span>{t("From", "من")}</span>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 12, fontFamily: "inherit" }} />
        <span>{t("To", "إلى")}</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 12, fontFamily: "inherit" }} />
      </div>
      {presets.map((p, i) => (
        <button key={i} onClick={() => { setFrom(p.f); setTo(p.t); }}
          style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${i === 0 ? T.accentGlow : T.border}`, background: i === 0 ? T.accentDim : T.surface, color: i === 0 ? T.accent : T.textDim, fontFamily: "inherit", transition: "all 0.2s" }}>
          {p.label}
        </button>
      ))}
    </div>
  );
};

// ══════════ MAIN APP SHELL ══════════
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [lang, setLang] = useState("en");
  const [sbOpen, setSbOpen] = useState(typeof window !== "undefined" && window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 1024);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const t = useCallback((en, ar) => lang === "ar" ? ar : en, [lang]);

  useEffect(() => { seedData(); }, []);
  useEffect(() => {
    const h = () => { const m = window.innerWidth < 1024; setIsMobile(m); setSbOpen(!m); };
    window.addEventListener("resize", h); return () => window.removeEventListener("resize", h);
  }, []);

  const navItems = [
    { id: "dashboard", icon: "dashboard", en: "Dashboard", ar: "لوحة التحكم" },
    { id: "pos", icon: "pos", en: "Point of Sale", ar: "نقطة البيع" },
    { id: "sales", icon: "sales", en: "Sales", ar: "المبيعات" },
    { id: "inventory", icon: "inventory", en: "Inventory", ar: "المخزون" },
    { id: "suppliers", icon: "suppliers", en: "Suppliers", ar: "الموردين" },
    { id: "customers", icon: "customers", en: "Customers", ar: "العملاء" },
    { id: "employees", icon: "employees", en: "Employees", ar: "الموظفين" },
    { id: "expenses", icon: "expenses", en: "Expenses", ar: "المصروفات" },
    { id: "drawer", icon: "drawer", en: "Drawer Sessions", ar: "جلسات الدراور" },
    { id: "analytics", icon: "analytics", en: "Reports", ar: "التقارير" },
    { id: "financial", icon: "financial", en: "Financial", ar: "التقارير المالية" },
    { id: "settings", icon: "settings", en: "Settings", ar: "الإعدادات" },
  ];

  const styles = {
    app: { display: "flex", minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Outfit', sans-serif", direction: dir },
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 40, cursor: "pointer" },
    sidebar: {
      position: "fixed", top: 0, bottom: 0, width: 250, zIndex: 50, display: "flex", flexDirection: "column",
      background: T.surface, transition: "transform 0.3s ease",
      ...(dir === "rtl" ? { right: 0, borderLeft: `1px solid ${T.border}` } : { left: 0, borderRight: `1px solid ${T.border}` }),
      transform: sbOpen ? "translateX(0)" : (dir === "rtl" ? "translateX(100%)" : "translateX(-100%)"),
    },
    main: {
      flex: 1, minHeight: "100vh", transition: "margin 0.3s ease",
      ...(sbOpen && !isMobile ? (dir === "rtl" ? { marginRight: 250 } : { marginLeft: 250 }) : {}),
    },
    topbar: {
      position: "sticky", top: 0, zIndex: 30, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 20px", background: `${T.bg}e8`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}`,
    },
    navLink: (active) => ({
      width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8,
      fontSize: 13, cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all 0.2s",
      background: active ? T.accentDim : "transparent",
      color: active ? T.accent : T.textSec,
      fontWeight: active ? 500 : 400,
    }),
  };

  return (
    <div style={styles.app}>
      {/* Overlay */}
      {sbOpen && isMobile && <div style={styles.overlay} onClick={() => setSbOpen(false)} />}

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={{ padding: "20px 20px 8px" }}>
          <h1 style={{ fontSize: 26, letterSpacing: 10, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", color: T.text }}>DRAFT</h1>
          <p style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: T.accent, marginTop: 4 }}>{t("POS System", "نظام نقاط البيع")}</p>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          {navItems.map(item => (
            <button key={item.id} style={styles.navLink(page === item.id)}
              onClick={() => { setPage(item.id); if (isMobile) setSbOpen(false); }}
              onMouseEnter={e => { if (page !== item.id) { e.currentTarget.style.background = T.card; e.currentTarget.style.color = T.text; } }}
              onMouseLeave={e => { if (page !== item.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textSec; } }}>
              <Svg name={item.icon} size={17} /> <span>{t(item.en, item.ar)}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: 12, borderTop: `1px solid ${T.border}` }}>
          <a href="draft-menswear.html" target="_blank" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", fontSize: 12, color: T.textDim, textDecoration: "none", borderRadius: 8 }}>
            <Svg name="store" size={15} /> {t("View Store", "عرض المتجر")}
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", marginTop: 4, background: T.card, borderRadius: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: T.accent }}>D</div>
            <div><div style={{ fontSize: 12, fontWeight: 500, color: T.text }}>Draft Admin</div><div style={{ fontSize: 10, color: T.textDim }}>{t("Owner", "المالك")}</div></div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main style={styles.main}>
        <header style={styles.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSbOpen(!sbOpen)} style={{ padding: 8, borderRadius: 8, background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", display: "flex" }}>
              <Svg name="menu" size={16} />
            </button>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: T.text }}>{t(navItems.find(n => n.id === page)?.en, navItems.find(n => n.id === page)?.ar)}</h2>
          </div>
          <button onClick={() => setLang(lang === "en" ? "ar" : "en")}
            style={{ padding: "6px 14px", fontSize: 11, fontWeight: 500, borderRadius: 6, background: T.accentDim, border: `1px solid ${T.accentGlow}`, color: T.accent, cursor: "pointer", fontFamily: "inherit" }}>
            {lang === "en" ? "عربي" : "EN"}
          </button>
        </header>

        <div style={{ padding: 20 }}>
          {page === "dashboard" && <DashboardPage t={t} />}
          {page !== "dashboard" && (
            <div style={{ textAlign: "center", padding: "80px 20px", color: T.textDim }}>
              <Svg name={navItems.find(n => n.id === page)?.icon || "dashboard"} size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
              <p style={{ fontSize: 14 }}>{t(`${navItems.find(n => n.id === page)?.en} — Coming in next file`, `${navItems.find(n => n.id === page)?.ar} — في الملف القادم`)}</p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@200;300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        input, select, textarea, button { font-family: 'Outfit', sans-serif; }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DASHBOARD PAGE — Advanced with all requested features
// ══════════════════════════════════════════════════════════════
function DashboardPage({ t }) {
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(today());

  const products = load("products");
  const allSales = load("sales");
  const expenses = load("expenses");
  const customers = load("customers");
  const accounts = loadObj("accounts");
  const drawerSessions = load("drawer");

  // Filtered data
  const sales = allSales.filter(s => s.status === "completed" && !s.isReturn && inRange(s.date, from, to));
  const returns = allSales.filter(s => s.isReturn && inRange(s.date, from, to));
  const expsFiltered = expenses.filter(e => inRange(e.date, from, to));

  // ── Financial calculations ──
  const totalSales = sales.reduce((a, s) => a + s.total, 0);
  const totalReturns = returns.reduce((a, s) => a + s.total, 0);
  const netRevenue = totalSales - totalReturns; // Sales - Returns
  const cogs = sales.reduce((a, s) => a + s.items.reduce((b, i) => {
    const p = products.find(x => x.id === i.pid);
    return b + (p ? p.cost * i.qty : 0);
  }, 0), 0);
  const grossProfit = netRevenue - cogs; // Net Revenue - COGS
  const totalExpenses = expsFiltered.reduce((a, e) => a + e.amount, 0);
  const netProfit = grossProfit - totalExpenses; // Gross Profit - Expenses
  const avgOrder = sales.length ? Math.round(totalSales / sales.length) : 0;
  const profitMargin = totalSales ? Math.round((grossProfit / totalSales) * 100) : 0;
  const cashTotal = Object.values(accounts).reduce((a, b) => a + b, 0);
  const lowStock = products.filter(p => p.stock <= 5);
  const stockValue = products.reduce((a, p) => a + p.cost * p.stock, 0);
  const totalDiscounts = sales.reduce((a, s) => a + (s.disc || 0) + (s.custDisc || 0), 0);

  // Payment breakdown
  const methodTotals = { Cash: 0, Card: 0, "Vodafone Cash": 0, InstaPay: 0 };
  sales.forEach(s => s.payments.forEach(p => { methodTotals[p.method] = (methodTotals[p.method] || 0) + p.amount; }));
  const mColors = { Cash: T.accent, Card: T.blue, "Vodafone Cash": T.red, InstaPay: T.green };
  const mIcons = { Cash: "cash", Card: "card", "Vodafone Cash": "wallet", InstaPay: "wallet" };

  // Daily chart (7 days)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    const dayRev = allSales.filter(s => s.status === "completed" && !s.isReturn && new Date(s.date).toDateString() === ds).reduce((a, b) => a + b.total, 0);
    const dayProfit = allSales.filter(s => s.status === "completed" && !s.isReturn && new Date(s.date).toDateString() === ds).reduce((a, s) => {
      return a + s.items.reduce((b, i) => { const p = products.find(x => x.id === i.pid); return b + ((i.price - (p ? p.cost : 0)) * i.qty); }, 0);
    }, 0);
    chartData.push({ day: d.toLocaleDateString("en", { weekday: "short" }), rev: dayRev, profit: dayProfit });
  }
  const maxChart = Math.max(...chartData.map(d => d.rev), 1);

  // Category breakdown
  const catTotals = {};
  sales.forEach(s => s.items.forEach(i => { const p = products.find(x => x.id === i.pid); const cat = p?.category || "Other"; catTotals[cat] = (catTotals[cat] || 0) + i.total; }));
  const catSum = Object.values(catTotals).reduce((a, b) => a + b, 0) || 1;
  const catColors = { Hoodies: T.accent, "T-Shirts": T.blue, Jackets: T.green, Pants: T.orange, Shoes: T.red, Accessories: "#8b7ec8" };

  // Top products
  const prodMap = {};
  sales.forEach(s => s.items.forEach(i => {
    if (!prodMap[i.pid]) prodMap[i.pid] = { name: i.name, qty: 0, rev: 0 };
    prodMap[i.pid].qty += i.qty; prodMap[i.pid].rev += i.total;
  }));
  const topProducts = Object.entries(prodMap).sort((a, b) => b[1].rev - a[1].rev).slice(0, 6);

  // Top customers
  const custMap = {};
  sales.forEach(s => { if (!s.custId) return; if (!custMap[s.custId]) custMap[s.custId] = { name: s.custName, orders: 0, spent: 0 }; custMap[s.custId].orders++; custMap[s.custId].spent += s.total; });
  const topCusts = Object.entries(custMap).sort((a, b) => b[1].spent - a[1].spent).slice(0, 5);

  // Active drawer
  const activeDrawer = drawerSessions.find(s => s.status === "open");

  const gridRow = (cols) => ({ display: "grid", gridTemplateColumns: cols, gap: 16 });
  const cellStyle = { padding: "10px 16px", fontSize: 13, borderBottom: `1px solid ${T.border}`, color: T.text };
  const thStyle = { ...cellStyle, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1, color: T.textDim, background: T.surface };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Date Filter */}
      <DateFilter from={from} to={to} setFrom={setFrom} setTo={setTo} t={t} />

      {/* Row 1: 6 Key Stats */}
      <div style={gridRow("repeat(6, 1fr)")}>
        <StatCard label={t("Net Revenue", "صافي الإيرادات")} value={fmt(netRevenue)} icon="financial" color={T.accent} />
        <StatCard label={t("Gross Profit", "إجمالي الربح")} value={fmt(grossProfit)} icon="analytics" color={T.green} />
        <StatCard label={t("Net Profit", "صافي الربح")} value={fmt(netProfit)} icon="analytics" color={netProfit >= 0 ? T.green : T.red} />
        <StatCard label={t("Orders", "الطلبات")} value={sales.length} icon="sales" color={T.blue} sub={`${t("Avg", "متوسط")} ${fmt(avgOrder)}`} />
        <StatCard label={t("Returns", "المرتجعات")} value={fmt(totalReturns)} icon="undo" color={T.red} sub={`${returns.length} ${t("orders", "طلب")}`} />
        <StatCard label={t("Cash Total", "إجمالي النقدية")} value={fmt(cashTotal)} icon="wallet" color={T.orange} />
      </div>

      {/* Row 2: Bar Chart + Categories */}
      <div style={gridRow("2fr 1fr")}>
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{t("Revenue & Profit (7 Days)", "الإيرادات والأرباح (7 أيام)")}</span>
            <div style={{ display: "flex", gap: 12, fontSize: 10, color: T.textDim }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: T.accent }} />{t("Revenue", "إيراد")}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: T.green }} />{t("Profit", "ربح")}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 200 }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", display: "flex", alignItems: "flex-end", gap: 2, height: 170 }}>
                  <div style={{ flex: 1, background: T.accent, borderRadius: "3px 3px 0 0", height: `${Math.max((d.rev / maxChart) * 100, d.rev ? 3 : 0)}%`, transition: "height 0.5s", cursor: "pointer" }} title={fmt(d.rev)} />
                  <div style={{ flex: 1, background: T.green, borderRadius: "3px 3px 0 0", height: `${Math.max((d.profit / maxChart) * 100, d.profit ? 3 : 0)}%`, transition: "height 0.5s", cursor: "pointer" }} title={fmt(d.profit)} />
                </div>
                <span style={{ fontSize: 10, color: T.textDim }}>{d.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: T.text, marginBottom: 16 }}>{t("Sales by Category", "المبيعات حسب الفئة")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
              <div key={cat}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: T.textSec }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: catColors[cat] || T.textDim }} />{cat}
                  </span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: T.text }}>{fmt(amt)} <span style={{ color: T.textDim }}>({Math.round((amt / catSum) * 100)}%)</span></span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: T.surface, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, background: catColors[cat] || T.textDim, width: `${(amt / catSum) * 100}%`, transition: "width 0.7s" }} />
                </div>
              </div>
            ))}
            {Object.keys(catTotals).length === 0 && <p style={{ fontSize: 12, color: T.textDim, textAlign: "center", padding: 20 }}>{t("No data", "لا توجد بيانات")}</p>}
          </div>
        </Card>
      </div>

      {/* Row 3: Payment Accounts */}
      <div style={gridRow("repeat(4, 1fr)")}>
        {Object.entries(methodTotals).map(([method, amt]) => (
          <Card key={method} style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${mColors[method]}15` }}>
                <Svg name={mIcons[method]} size={17} style={{ color: mColors[method] }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: T.textSec }}>{method}</div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: T.text }}>{fmt(amt)}</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: T.textDim, marginBottom: 6 }}>{t("Account Balance:", "رصيد الحساب:")} <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: T.accent }}>{fmt(accounts[method] || 0)}</span></div>
            <div style={{ height: 4, borderRadius: 2, background: T.surface, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 2, background: mColors[method], width: `${totalSales ? (amt / totalSales) * 100 : 0}%` }} />
            </div>
            <div style={{ fontSize: 9, color: T.textDim, marginTop: 4 }}>{totalSales ? Math.round((amt / totalSales) * 100) : 0}% {t("of sales", "من المبيعات")}</div>
          </Card>
        ))}
      </div>

      {/* Row 4: Top Products + Top Customers */}
      <div style={gridRow("1fr 1fr")}>
        <Card>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{t("Top Products", "الأكثر مبيعاً")}</span>
            <Badge color="accent">{t("Top 6", "أعلى 6")}</Badge>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={thStyle}>{t("Product", "المنتج")}</th><th style={thStyle}>{t("Sold", "المبيع")}</th><th style={thStyle}>{t("Revenue", "الإيراد")}</th></tr></thead>
            <tbody>
              {topProducts.map(([id, d]) => (
                <tr key={id}><td style={cellStyle}>{d.name}</td><td style={{ ...cellStyle, fontFamily: "'IBM Plex Mono', monospace" }}>{d.qty}</td><td style={{ ...cellStyle, fontFamily: "'IBM Plex Mono', monospace", color: T.accent }}>{fmt(d.rev)}</td></tr>
              ))}
              {topProducts.length === 0 && <tr><td style={{ ...cellStyle, textAlign: "center", color: T.textDim }} colSpan={3}>{t("No data", "لا توجد بيانات")}</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{t("Top Customers", "أكثر العملاء إنفاقاً")}</span>
            <Badge color="accent">{t("Top 5", "أعلى 5")}</Badge>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={thStyle}>{t("Customer", "العميل")}</th><th style={thStyle}>{t("Orders", "الطلبات")}</th><th style={thStyle}>{t("Spent", "الإنفاق")}</th></tr></thead>
            <tbody>
              {topCusts.map(([id, d], i) => (
                <tr key={id}>
                  <td style={cellStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: T.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: T.accent }}>{i + 1}</span>
                      {d.name}
                    </div>
                  </td>
                  <td style={{ ...cellStyle, fontFamily: "'IBM Plex Mono', monospace" }}>{d.orders}</td>
                  <td style={{ ...cellStyle, fontFamily: "'IBM Plex Mono', monospace", color: T.accent }}>{fmt(d.spent)}</td>
                </tr>
              ))}
              {topCusts.length === 0 && <tr><td style={{ ...cellStyle, textAlign: "center", color: T.textDim }} colSpan={3}>{t("No data", "لا توجد بيانات")}</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Row 5: Low Stock + Drawer + Summary */}
      <div style={gridRow("1fr 1fr 1fr")}>
        {/* Low Stock */}
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: T.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.red, animation: "pulse 2s infinite" }} />
            {t("Low Stock", "نقص المخزون")} <Badge color="red">{lowStock.length}</Badge>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto" }}>
            {lowStock.map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: T.surface }}>
                <div><div style={{ fontSize: 11, color: T.text }}>{p.name}</div><div style={{ fontSize: 9, color: T.textDim }}>{p.sku}</div></div>
                <Badge color={p.stock === 0 ? "red" : "orange"}>{p.stock}</Badge>
              </div>
            ))}
            {lowStock.length === 0 && <p style={{ fontSize: 12, color: T.textDim, textAlign: "center", padding: 20 }}>✓ {t("All good!", "كل شيء تمام!")}</p>}
          </div>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }`}</style>
        </Card>

        {/* Active Drawer */}
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: T.text, marginBottom: 12 }}>{t("Drawer Session", "جلسة الدراور")}</div>
          {activeDrawer ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, background: T.surface }}>
                <span style={{ fontSize: 11, color: T.textSec }}>{t("Status", "الحالة")}</span>
                <Badge color="green">{t("Open", "مفتوح")}</Badge>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, background: T.surface }}>
                <span style={{ fontSize: 11, color: T.textSec }}>{t("Opened", "الفتح")}</span>
                <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: T.text }}>{fDateTime(activeDrawer.openedAt)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, background: T.surface }}>
                <span style={{ fontSize: 11, color: T.textSec }}>{t("Opening Balance", "رصيد الفتح")}</span>
                <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: T.accent }}>{fmt(activeDrawer.opening)}</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "30px 0", color: T.textDim }}>
              <Svg name="drawer" size={36} style={{ margin: "0 auto 8px", opacity: 0.2 }} />
              <p style={{ fontSize: 12 }}>{t("No active drawer", "لا يوجد دراور مفتوح")}</p>
            </div>
          )}
        </Card>

        {/* Summary */}
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: T.text, marginBottom: 12 }}>{t("Quick Summary", "ملخص سريع")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              [t("Products", "المنتجات"), products.length, T.blue],
              [t("Customers", "العملاء"), customers.length, T.green],
              [t("Profit Margin", "هامش الربح"), `${profitMargin}%`, T.accent],
              [t("Discounts", "الخصومات"), fmt(totalDiscounts), T.orange],
              [t("Expenses", "المصروفات"), fmt(totalExpenses), T.red],
              [t("Stock Value", "قيمة المخزون"), fmt(stockValue), T.blue],
            ].map(([label, val, color], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: T.surface }}>
                <span style={{ fontSize: 11, color: T.textSec }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color }}>{val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 6: Recent Sales */}
      <Card>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{t("Recent Sales", "آخر المبيعات")}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>{t("ID", "رقم")}</th>
                <th style={thStyle}>{t("Time", "الوقت")}</th>
                <th style={thStyle}>{t("Customer", "العميل")}</th>
                <th style={thStyle}>{t("Items", "عدد")}</th>
                <th style={thStyle}>{t("Payment", "الدفع")}</th>
                <th style={thStyle}>{t("Total", "الإجمالي")}</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(-8).reverse().map(s => (
                <tr key={s.id}>
                  <td style={{ ...cellStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{s.txn}</td>
                  <td style={{ ...cellStyle, fontSize: 11, color: T.textDim }}>{fDateTime(s.date)}</td>
                  <td style={cellStyle}>{s.custName || "Walk-in"}</td>
                  <td style={{ ...cellStyle, fontFamily: "'IBM Plex Mono', monospace" }}>{s.items.reduce((a, i) => a + i.qty, 0)}</td>
                  <td style={cellStyle}>{s.payments.map((p, i) => <Badge key={i} color="blue">{p.method}</Badge>)}</td>
                  <td style={{ ...cellStyle, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: T.accent }}>{fmt(s.total)}</td>
                </tr>
              ))}
              {sales.length === 0 && <tr><td style={{ ...cellStyle, textAlign: "center", color: T.textDim }} colSpan={6}>{t("No sales in this period", "لا توجد مبيعات في هذه الفترة")}</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
