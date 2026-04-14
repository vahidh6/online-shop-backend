const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM_NUMBER = process.env.TWILIO_WHATSAPP_FROM;

async function sendWhatsAppMessage(to, message) {
  try {
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const msg = await client.messages.create({
      body: message,
      from: FROM_NUMBER,
      to: formattedTo,
    });
    console.log(`✅ WhatsApp sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ WhatsApp error:', error);
    return { success: false, error: error.message };
  }
}

async function sendWelcomeWhatsApp(user) {
  const message = `🎉 به فروشگاه افغانستان خوش آمدید ${user.name}!\nشماره پشتیبانی: ${process.env.SUPPORT_PHONE || '0799364841'}`;
  return sendWhatsAppMessage(user.phone, message);
}

async function sendOrderConfirmationWhatsApp(order, user) {
  const message = `✅ سفارش شما ثبت شد!\nشماره: ${order.orderNumber || order._id.slice(-8)}\nمبلغ: ${order.totalAmount.toLocaleString()} افغانی\nبرای پیگیری: ${process.env.FRONTEND_URL}/orders`;
  return sendWhatsAppMessage(user.phone, message);
}

async function sendOrderStatusUpdateWhatsApp(order, user, oldStatus, newStatus) {
  const statusMap = {
    'pending_payment': 'در انتظار پرداخت',
    'payment_verified': 'پرداخت تأیید شد',
    'shipped': 'ارسال شد',
    'delivered': 'تحویل داده شد',
    'cancelled': 'لغو شد'
  };
  const message = `📢 وضعیت سفارش ${order.orderNumber || order._id.slice(-8)} تغییر کرد:\nاز ${statusMap[oldStatus] || oldStatus} به ${statusMap[newStatus] || newStatus}`;
  return sendWhatsAppMessage(user.phone, message);
}

module.exports = {
  sendWelcomeWhatsApp,
  sendOrderConfirmationWhatsApp,
  sendOrderStatusUpdateWhatsApp,
};