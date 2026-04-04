import { useState, useEffect } from "react";

/*
 ╔═══════════════════════════════════════════════════════════════╗
 ║  DRAFT POS — Pages 2-5: Settings, Employees, Customers,     ║
 ║  Expenses. Same theme + localStorage as Dashboard.           ║
 ║  Import these into the main App and render by page state.    ║
 ╚═══════════════════════════════════════════════════════════════╝
*/

// ── Shared helpers (same as Dashboard) ──
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
const fDateTime = (d) => d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

const T = {
  bg: "#0a0a0a", surface: "#131311", card: "#1a1917", border: "#2a2822", borderLight: "#3d3a30",
  accent: "#c8b07a", accentDim: "rgba(200,176,122,0.10)", accentGlow: "rgba(200,176,122,0.25)",
  text: "#f0ece6", textSec: "#b5ae9e", textDim: "#7a7468",
  green: "#6abf69", greenDim: "rgba(106,191,105,0.12)",
  red: "#e06060", redDim: "rgba(224,96,96,0.12)",
  blue: "#6aa8e0", blueDim: "rgba(106,168,224,0.12)",
  orange: "#e8a838", orangeDim: "rgba(232,168,56,0.12)",
};

// ── Shared UI ──
const Card = ({ children, style: st }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, ...st }}>{children}</div>
);
const Badge = ({ children, color = "accent" }) => {
  const m = { accent: [T.accentDim, T.accent], green: [T.greenDim, T.green], red: [T.redDim, T.red], blue: [T.blueDim, T.blue], orange: [T.orangeDim, T.orange] };
  const [bg, fg] = m[color] || m.accent;
  return <span style={{ display: "inline-flex", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: bg, color: fg }}>{children}</span>;
};
const Btn = ({ children, onClick, variant = "primary", disabled = false }) => {
  const styles = { primary: { background: T.accent, color: T.bg }, secondary: { background: "transparent", color: T.textSec, border: `1px solid ${T.border}` }, danger: { background: T.redDim, color: T.red, border: `1px solid rgba(224,96,96,0.2)` } };
  return <button onClick={onClick} disabled={disabled} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, fontFamily: "inherit", transition: "all 0.2s", border: "none", ...styles[variant] }}>{children}</button>;
};
const Input = ({ label, ...props }) => (
  <div>
    {label && <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: T.textSec, marginBottom: 6 }}>{label}</label>}
    <input {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 13, outline: "none", background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontFamily: "inherit", transition: "border-color 0.2s", ...props.style }}
      onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
  </div>
);
const Select = ({ label, options, ...props }) => (
  <div>
    {label && <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: T.textSec, marginBottom: 6 }}>{label}</label>}
    <select {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 13, outline: "none", background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontFamily: "inherit" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, width: "90%", maxWidth: 500, maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottom: `1px solid ${T.border}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.text }}>{title}</h3>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", background: T.surface, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.textSec, fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
};
const thStyle = { textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1, color: T.textDim, background: T.surface, borderBottom: `1px solid ${T.border}` };
const tdStyle = { padding: "12px 16px", fontSize: 13, borderBottom: `1px solid ${T.border}`, color: T.text };
const tdMono = { ...tdStyle, fontFamily: "'IBM Plex Mono', monospace" };


// ══════════════════════════════════════════════════════════════
// 1. SETTINGS PAGE
// ══════════════════════════════════════════════════════════════
export function SettingsPage({ t, show }) {
  const [f, setF] = useState(loadObj("settings"));
  const u = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    saveObj("settings", f);
    show(t("Settings saved!", "تم حفظ الإعدادات!"));
  };

  return (
    <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 16 }}>{t("Store Information", "معلومات المتجر")}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label={t("Store Name", "اسم المتجر")} value={f.store || ""} onChange={e => u("store", e.target.value)} />
          <Input label={t("Phone", "الهاتف")} value={f.phone || ""} onChange={e => u("phone", e.target.value)} />
          <Input label={t("Address", "العنوان")} value={f.address || ""} onChange={e => u("address", e.target.value)} />
        </div>
      </Card>

      <Card style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 16 }}>{t("Loyalty Program", "برنامج الولاء")}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label={t("Points per EGP", "نقاط لكل جنيه")} type="number" step="0.01" value={f.loyaltyRate || ""} onChange={e => u("loyaltyRate", Number(e.target.value))} />
          <Input label={t("Point Value (EGP)", "قيمة النقطة (ج.م)")} type="number" value={f.loyaltyValue || ""} onChange={e => u("loyaltyValue", Number(e.target.value))} />
        </div>
      </Card>

      <Card style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 16 }}>{t("Other Settings", "إعدادات أخرى")}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label={t("Low Stock Threshold", "حد المخزون المنخفض")} type="number" value={f.lowStock || ""} onChange={e => u("lowStock", Number(e.target.value))} />
          <Input label={t("Receipt Footer", "تذييل الفاتورة")} value={f.footer || ""} onChange={e => u("footer", e.target.value)} />
        </div>
      </Card>

      <Btn onClick={handleSave}>✓ {t("Save Settings", "حفظ الإعدادات")}</Btn>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// 2. EMPLOYEES PAGE
// ══════════════════════════════════════════════════════════════
export function EmployeesPage({ t, show }) {
  const [employees, setEmployees] = useState(load("employees"));
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);

  const handleSave = (data) => {
    let emps = load("employees");
    if (edit) {
      emps = emps.map(e => e.id === edit.id ? { ...e, ...data } : e);
    } else {
      emps.push({ id: genId(), ...data });
    }
    save("employees", emps);
    setEmployees(emps);
    setModal(false);
    setEdit(null);
    show(t("Employee saved!", "تم حفظ الموظف!"));
  };

  const handleDelete = (id) => {
    if (!confirm(t("Delete this employee?", "حذف هذا الموظف؟"))) return;
    const emps = load("employees").filter(e => e.id !== id);
    save("employees", emps);
    setEmployees(emps);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Btn onClick={() => { setEdit(null); setModal(true); }}>+ {t("Add Employee", "إضافة موظف")}</Btn>
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>{t("Name", "الاسم")}</th>
                <th style={thStyle}>{t("Phone", "الهاتف")}</th>
                <th style={thStyle}>{t("Position", "المنصب")}</th>
                <th style={thStyle}>{t("Salary", "المرتب")}</th>
                <th style={thStyle}>{t("Hire Date", "تاريخ التعيين")}</th>
                <th style={thStyle}>{t("Loans", "القروض")}</th>
                <th style={thStyle}>{t("Status", "الحالة")}</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.id}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{e.name}</td>
                  <td style={{ ...tdMono, fontSize: 11 }}>{e.phone}</td>
                  <td style={tdStyle}><Badge color="blue">{e.position}</Badge></td>
                  <td style={tdMono}>{fmt(e.salary)}</td>
                  <td style={{ ...tdStyle, fontSize: 11 }}>{e.hireDate}</td>
                  <td style={{ ...tdMono, color: e.loans > 0 ? T.red : T.green }}>{fmt(e.loans)}</td>
                  <td style={tdStyle}><Badge color={e.status === "نشط" ? "green" : "red"}>{e.status}</Badge></td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => { setEdit(e); setModal(true); }} style={{ padding: "4px 8px", borderRadius: 6, background: T.blueDim, border: "none", cursor: "pointer", fontSize: 11, color: T.blue }}>✏️</button>
                      <button onClick={() => handleDelete(e.id)} style={{ padding: "4px 8px", borderRadius: 6, background: T.redDim, border: "none", cursor: "pointer", fontSize: 11, color: T.red }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td style={{ ...tdStyle, textAlign: "center", color: T.textDim }} colSpan={8}>{t("No employees", "لا يوجد موظفين")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modal} onClose={() => { setModal(false); setEdit(null); }} title={edit ? t("Edit Employee", "تعديل موظف") : t("Add Employee", "إضافة موظف")}>
        <EmployeeForm t={t} onSave={handleSave} onClose={() => { setModal(false); setEdit(null); }} editItem={edit} />
      </Modal>
    </div>
  );
}

function EmployeeForm({ t, onSave, onClose, editItem }) {
  const [f, setF] = useState(editItem || { name: "", phone: "", position: "كاشير", salary: 0, hireDate: "", status: "نشط", loans: 0 });
  const u = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Input label={t("Full Name", "الاسم الكامل")} value={f.name} onChange={e => u("name", e.target.value)} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label={t("Phone", "الهاتف")} value={f.phone} onChange={e => u("phone", e.target.value)} />
        <Select label={t("Position", "المنصب")} value={f.position} onChange={e => u("position", e.target.value)}
          options={["مدير", "محاسب", "كاشير", "عامل", "مساعد مبيعات", "أخرى"].map(v => ({ value: v, label: v }))} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label={t("Salary (EGP)", "المرتب (ج.م)")} type="number" value={f.salary || ""} onChange={e => u("salary", Number(e.target.value))} />
        <Input label={t("Hire Date", "تاريخ التعيين")} type="date" value={f.hireDate} onChange={e => u("hireDate", e.target.value)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Select label={t("Status", "الحالة")} value={f.status} onChange={e => u("status", e.target.value)}
          options={["نشط", "متوقف", "مفصول"].map(v => ({ value: v, label: v }))} />
        <Input label={t("Outstanding Loans", "القروض")} type="number" value={f.loans || ""} onChange={e => u("loans", Number(e.target.value))} />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>{t("Cancel", "إلغاء")}</Btn>
        <Btn onClick={() => onSave(f)} disabled={!f.name}>{t("Save", "حفظ")}</Btn>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// 3. CUSTOMERS PAGE
// ══════════════════════════════════════════════════════════════
export function CustomersPage({ t, show }) {
  const [customers, setCustomers] = useState(load("customers"));
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const handleSave = (data) => {
    let custs = load("customers");
    if (edit) {
      custs = custs.map(c => c.id === edit.id ? { ...c, ...data } : c);
    } else {
      custs.push({ id: genId(), ...data, points: 0, spent: 0, lastDate: null });
    }
    save("customers", custs);
    setCustomers(custs);
    setModal(false);
    setEdit(null);
    show(t("Customer saved!", "تم حفظ العميل!"));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("Search customers...", "بحث في العملاء...")}
          style={{ padding: "10px 14px", borderRadius: 8, fontSize: 12, background: T.card, border: `1px solid ${T.border}`, color: T.text, outline: "none", width: 240, fontFamily: "inherit" }}
          onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
        <Btn onClick={() => { setEdit(null); setModal(true); }}>+ {t("Add Customer", "إضافة عميل")}</Btn>
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>{t("Name", "الاسم")}</th>
                <th style={thStyle}>{t("Phone", "الهاتف")}</th>
                <th style={thStyle}>{t("Discount %", "خصم %")}</th>
                <th style={thStyle}>{t("Loyalty Points", "نقاط الولاء")}</th>
                <th style={thStyle}>{t("Total Purchases", "إجمالي المشتريات")}</th>
                <th style={thStyle}>{t("Last Purchase", "آخر شراء")}</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{c.name}</td>
                  <td style={{ ...tdMono, fontSize: 11 }}>{c.phone}</td>
                  <td style={tdStyle}><Badge color="accent">{c.disc}%</Badge></td>
                  <td style={{ ...tdMono, color: T.blue }}>{c.points}</td>
                  <td style={{ ...tdMono, color: T.accent }}>{fmt(c.spent)}</td>
                  <td style={{ ...tdStyle, fontSize: 11, color: T.textDim }}>{c.lastDate ? fDateTime(c.lastDate) : "—"}</td>
                  <td style={tdStyle}>
                    <button onClick={() => { setEdit(c); setModal(true); }} style={{ padding: "4px 8px", borderRadius: 6, background: T.blueDim, border: "none", cursor: "pointer", fontSize: 11, color: T.blue }}>✏️</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td style={{ ...tdStyle, textAlign: "center", color: T.textDim }} colSpan={7}>{t("No customers found", "لا يوجد عملاء")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modal} onClose={() => { setModal(false); setEdit(null); }} title={edit ? t("Edit Customer", "تعديل عميل") : t("Add Customer", "إضافة عميل")}>
        <CustomerForm t={t} onSave={handleSave} onClose={() => { setModal(false); setEdit(null); }} editItem={edit} />
      </Modal>
    </div>
  );
}

function CustomerForm({ t, onSave, onClose, editItem }) {
  const [f, setF] = useState(editItem || { name: "", phone: "", email: "", disc: 0, notes: "" });
  const u = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Input label={t("Name", "الاسم")} value={f.name} onChange={e => u("name", e.target.value)} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label={t("Phone", "الهاتف")} value={f.phone} onChange={e => u("phone", e.target.value)} />
        <Input label={t("Email", "الإيميل")} value={f.email || ""} onChange={e => u("email", e.target.value)} />
      </div>
      <Input label={t("Discount Percentage", "نسبة الخصم %")} type="number" value={f.disc} onChange={e => u("disc", Number(e.target.value))} />
      <Input label={t("Notes", "ملاحظات")} value={f.notes || ""} onChange={e => u("notes", e.target.value)} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>{t("Cancel", "إلغاء")}</Btn>
        <Btn onClick={() => onSave(f)} disabled={!f.name}>{t("Save", "حفظ")}</Btn>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// 4. EXPENSES PAGE
// ══════════════════════════════════════════════════════════════
export function ExpensesPage({ t, show }) {
  const [expenses, setExpenses] = useState(load("expenses"));
  const [modal, setModal] = useState(false);
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split("T")[0]; });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  const filtered = expenses.filter(e => {
    if (!e.date) return true;
    const d = new Date(e.date).getTime();
    return d >= new Date(from).setHours(0, 0, 0, 0) && d <= new Date(to).setHours(23, 59, 59, 999);
  });

  const total = filtered.reduce((a, e) => a + e.amount, 0);

  // Group by type
  const byType = {};
  filtered.forEach(e => { byType[e.type] = (byType[e.type] || 0) + e.amount; });

  const handleSave = (data) => {
    const exps = load("expenses");
    exps.push({ id: genId(), ...data, date: Date.now() });
    save("expenses", exps);

    // Deduct from payment account
    const accounts = loadObj("accounts");
    accounts[data.payMethod] = (accounts[data.payMethod] || 0) - data.amount;
    saveObj("accounts", accounts);

    setExpenses(load("expenses"));
    setModal(false);
    show(t("Expense recorded!", "تم تسجيل المصروف!"));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filter + Total */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, fontSize: 12, color: T.textSec }}>
            <span>{t("From", "من")}</span>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 12, fontFamily: "inherit" }} />
            <span>{t("To", "إلى")}</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 12, fontFamily: "inherit" }} />
          </div>
          <div style={{ padding: "8px 16px", borderRadius: 8, background: T.redDim, border: `1px solid rgba(224,96,96,0.2)` }}>
            <span style={{ fontSize: 11, color: T.textSec }}>{t("Total:", "الإجمالي:")}</span>
            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: T.red, marginLeft: 8 }}>{fmt(total)}</span>
          </div>
        </div>
        <Btn onClick={() => setModal(true)}>+ {t("Add Expense", "إضافة مصروف")}</Btn>
      </div>

      {/* Breakdown by type */}
      {Object.keys(byType).length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, amount]) => (
            <Card key={type} style={{ padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: T.textSec, marginBottom: 4 }}>{type}</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: T.red }}>{fmt(amount)}</div>
              <div style={{ fontSize: 9, color: T.textDim, marginTop: 2 }}>{total ? Math.round((amount / total) * 100) : 0}%</div>
            </Card>
          ))}
        </div>
      )}

      {/* Table */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>{t("Type", "النوع")}</th>
                <th style={thStyle}>{t("Amount", "المبلغ")}</th>
                <th style={thStyle}>{t("Paid To", "المدفوع إلى")}</th>
                <th style={thStyle}>{t("Payment Method", "طريقة الدفع")}</th>
                <th style={thStyle}>{t("Date", "التاريخ")}</th>
                <th style={thStyle}>{t("Description", "الوصف")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice().reverse().map(e => (
                <tr key={e.id}>
                  <td style={tdStyle}><Badge color="orange">{e.type}</Badge></td>
                  <td style={{ ...tdMono, color: T.red }}>{fmt(e.amount)}</td>
                  <td style={tdStyle}>{e.paidTo || "—"}</td>
                  <td style={tdStyle}><Badge color="blue">{e.payMethod}</Badge></td>
                  <td style={{ ...tdStyle, fontSize: 11, color: T.textDim }}>{fDateTime(e.date)}</td>
                  <td style={{ ...tdStyle, fontSize: 11, color: T.textDim }}>{e.desc || "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td style={{ ...tdStyle, textAlign: "center", color: T.textDim }} colSpan={6}>{t("No expenses", "لا توجد مصروفات")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={t("Add Expense", "إضافة مصروف")}>
        <ExpenseForm t={t} onSave={handleSave} onClose={() => setModal(false)} />
      </Modal>
    </div>
  );
}

function ExpenseForm({ t, onSave, onClose }) {
  const [f, setF] = useState({ type: "Rent", amount: 0, paidTo: "", payMethod: "Cash", desc: "" });
  const u = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Select label={t("Type", "النوع")} value={f.type} onChange={e => u("type", e.target.value)}
        options={["Rent", "Stock Purchase", "Supplier Payment", "Utilities", "Salaries", "Marketing", "Maintenance", "Other"].map(v => ({ value: v, label: v }))} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label={t("Amount (EGP)", "المبلغ (ج.م)")} type="number" value={f.amount || ""} onChange={e => u("amount", Number(e.target.value))} />
        <Input label={t("Paid To", "المدفوع إلى")} value={f.paidTo} onChange={e => u("paidTo", e.target.value)} />
      </div>
      <Select label={t("Payment Method", "طريقة الدفع")} value={f.payMethod} onChange={e => u("payMethod", e.target.value)}
        options={["Cash", "Card", "Vodafone Cash", "InstaPay", "Bank Transfer"].map(v => ({ value: v, label: v }))} />
      <Input label={t("Description", "الوصف")} value={f.desc} onChange={e => u("desc", e.target.value)} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>{t("Cancel", "إلغاء")}</Btn>
        <Btn onClick={() => onSave(f)} disabled={!f.amount}>{t("Save", "حفظ")}</Btn>
      </div>
    </div>
  );
}
