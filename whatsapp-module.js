// ═══════════════════════════════════════════════════════════════
// WhatsApp Notifications Module
// Add to /var/www/draft-api/whatsapp.js
// ═══════════════════════════════════════════════════════════════

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class WhatsAppNotifier {
  constructor(pool) {
    this.pool = pool;
    this.enabled = false;
    this.config = {};
    this.loadConfig();
  }
  
  async loadConfig() {
    try {
      const { rows } = await this.pool.query(
        "SELECT key, value FROM settings WHERE key IN ('wa_enabled','wa_provider','wa_token','wa_instance','wa_merchant_phone')"
      );
      const cfg = {};
      rows.forEach(r => cfg[r.key] = r.value);
      this.enabled = cfg.wa_enabled === 'true';
      this.config = cfg;
      if (this.enabled) console.log('📱 WhatsApp notifications: ENABLED');
    } catch(e) { console.log('WA config load failed', e.message); }
  }
  
  async send(phone, message) {
    if (!this.enabled || !this.config.wa_token) return false;
    
    // Clean phone number (remove +, spaces, ensure starts with country code)
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '20' + cleanPhone.substring(1);
    if (!cleanPhone.startsWith('20') && cleanPhone.length === 10) cleanPhone = '20' + cleanPhone;
    
    try {
      // UltraMSG API
      if (this.config.wa_provider === 'ultramsg') {
        const url = `https://api.ultramsg.com/${this.config.wa_instance}/messages/chat`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `token=${this.config.wa_token}&to=${cleanPhone}&body=${encodeURIComponent(message)}`
        });
        const data = await res.json();
        console.log(`📱 WA sent to ${cleanPhone}:`, data.sent ? '✓' : '✗');
        return data.sent;
      }
      
      // Meta WhatsApp Cloud API
      if (this.config.wa_provider === 'meta') {
        const url = `https://graph.facebook.com/v18.0/${this.config.wa_instance}/messages`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${this.config.wa_token}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'text',
            text: { body: message }
          })
        });
        const data = await res.json();
        console.log(`📱 WA sent:`, data.messages ? '✓' : '✗');
        return !!data.messages;
      }
    } catch(e) { 
      console.log('WA send error:', e.message);
      return false;
    }
  }
  
  // ═══ Notification Templates ═══
  
  async notifyMerchantNewOrder(order) {
    if (!this.config.wa_merchant_phone) return;
    const itemsList = (order.items || []).map(i => `• ${i.name} × ${i.qty} = EGP ${i.total}`).join('\n');
    const msg = `🛍️ *NEW ORDER - DRAFT*\n\n` +
                `📦 *Order:* ${order.order_number}\n` +
                `👤 *Customer:* ${order.customer_name}\n` +
                `📞 *Phone:* ${order.customer_phone}\n` +
                `📍 *City:* ${order.shipping_city}\n` +
                `🏠 *Address:* ${order.shipping_address}\n\n` +
                `*Items:*\n${itemsList}\n\n` +
                `💰 *Total:* EGP ${order.total}\n` +
                `💳 *Payment:* ${order.payments?.[0]?.method || 'COD'}`;
    return this.send(this.config.wa_merchant_phone, msg);
  }
  
  async notifyCustomerOrderPlaced(order) {
    const itemsList = (order.items || []).map(i => `• ${i.name} × ${i.qty}`).join('\n');
    const msg = `🎉 *Thank you for your order!*\n\n` +
                `Order #${order.order_number}\n\n` +
                `*Your items:*\n${itemsList}\n\n` +
                `💰 Total: EGP ${order.total}\n\n` +
                `We'll contact you shortly to confirm.\n` +
                `Track your order: http://76.13.143.42:8080/track.html\n\n` +
                `*DRAFT MENSWEAR*\n` +
                `السلطان حسين، الإسماعيلية`;
    return this.send(order.customer_phone, msg);
  }
  
  async notifyCustomerStatusUpdate(order) {
    const messages = {
      confirmed: `✅ *Order Confirmed!*\n\nOrder #${order.order_number} has been confirmed and is being prepared.`,
      preparing: `📦 *Preparing your order*\n\nOrder #${order.order_number} is being prepared. We'll dispatch it soon!`,
      shipping: `🚚 *Out for delivery!*\n\nOrder #${order.order_number} is on the way to you.\nGet ready! 📍 ${order.shipping_city}`,
      delivered: `🎉 *Order Delivered!*\n\nOrder #${order.order_number} has been delivered.\n\nThank you for shopping with DRAFT! ❤️`,
      canceled: `❌ *Order Canceled*\n\nOrder #${order.order_number} has been canceled.\nFor questions, contact us.`
    };
    const msg = messages[order.status];
    if (msg) return this.send(order.customer_phone, msg);
  }
}

module.exports = WhatsAppNotifier;
