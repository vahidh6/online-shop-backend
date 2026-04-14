const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, html) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
}

async function sendWelcomeEmail(user) {
  const subject = `به فروشگاه افغانستان خوش آمدید ${user.name} 🎉`;
  const html = `
    <div dir="rtl">
      <h2 style="color:#e53e3e;">به فروشگاه افغانستان خوش آمدید!</h2>
      <p>سلام ${user.name} عزیز،</p>
      <p>از اینکه به جمع مشتریان ما پیوستید، خوشحالیم.</p>
      <p>شماره پشتیبانی: ${process.env.SUPPORT_PHONE || '0799364841'}</p>
    </div>
  `;
  return sendEmail(user.email, subject, html);
}

async function sendOrderConfirmationEmail(order, user) {
  const subject = `سفارش شما ثبت شد - ${order.orderNumber || order._id.slice(-8)}`;
  const html = `
    <div dir="rtl">
      <h2 style="color:#e53e3e;">✅ سفارش شما ثبت شد</h2>
      <p>سلام ${user.name} عزیز،</p>
      <p>مبلغ کل: ${order.totalAmount.toLocaleString()} افغانی</p>
      <p>برای پیگیری به <a href="${process.env.FRONTEND_URL}/orders">پنل کاربری</a> مراجعه کنید.</p>
    </div>
  `;
  return sendEmail(user.email, subject, html);
}

async function sendOrderStatusUpdateEmail(order, user, oldStatus, newStatus) {
  const statusMap = {
    'pending_payment': 'در انتظار پرداخت',
    'payment_verified': 'پرداخت تأیید شد',
    'shipped': 'ارسال شد',
    'delivered': 'تحویل داده شد',
    'cancelled': 'لغو شد'
  };
  const subject = `بروزرسانی سفارش ${order.orderNumber || order._id.slice(-8)}`;
  const html = `
    <div dir="rtl">
      <h2 style="color:#e53e3e;">📢 وضعیت سفارش تغییر کرد</h2>
      <p>سلام ${user.name} عزیز،</p>
      <p>وضعیت سفارش شما از ${statusMap[oldStatus] || oldStatus} به <strong>${statusMap[newStatus] || newStatus}</strong> تغییر یافت.</p>
    </div>
  `;
  return sendEmail(user.email, subject, html);
}

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
};