const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, html) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Email sent to ${to}: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('❌ Resend error:', error);
    return { success: false, error: error.message };
  }
}

async function sendWelcomeEmail(user) {
  const subject = `به فروشگاه افغانستان خوش آمدید ${user.name} 🎉`;
  const html = `
    <div dir="rtl" style="font-family: Tahoma, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53e3e;">به فروشگاه افغانستان خوش آمدید!</h2>
      <p>سلام ${user.name} عزیز،</p>
      <p>از اینکه به جمع مشتریان ما پیوستید، بسیار خوشحالیم.</p>
      <p>شماره تماس پشتیبانی: <strong>${process.env.SUPPORT_PHONE || '0799364841'}</strong></p>
      <br>
      <p style="color: #666;">با احترام،<br>تیم فروشگاه افغانستان</p>
    </div>
  `;
  return sendEmail(user.email, subject, html);
}

async function sendOrderConfirmationEmail(order, user) {
  const subject = `سفارش شما ثبت شد - شماره: ${order.orderNumber || order._id.slice(-8)}`;
  const html = `
    <div dir="rtl" style="font-family: Tahoma, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53e3e;">✅ سفارش شما با موفقیت ثبت شد</h2>
      <p>سلام ${user.name} عزیز،</p>
      <p><strong>مبلغ کل:</strong> ${order.totalAmount.toLocaleString()} افغانی</p>
      <p>برای پیگیری سفارش به <a href="${process.env.FRONTEND_URL}/orders">پنل کاربری</a> مراجعه کنید.</p>
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
    <div dir="rtl" style="font-family: Tahoma, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53e3e;">📢 وضعیت سفارش شما تغییر کرد</h2>
      <p>سلام ${user.name} عزیز،</p>
      <p>وضعیت سفارش شما از <strong>${statusMap[oldStatus] || oldStatus}</strong> به <strong>${statusMap[newStatus] || newStatus}</strong> تغییر یافت.</p>
      <p>برای مشاهده جزئیات بیشتر به <a href="${process.env.FRONTEND_URL}/orders">صفحه سفارشات</a> مراجعه کنید.</p>
    </div>
  `;
  return sendEmail(user.email, subject, html);
}

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
};