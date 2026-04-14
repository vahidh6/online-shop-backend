const emailService = require('../services/resend.service'); // تغییر به resend.service
const whatsappService = require('../services/whatsapp.service');

const DISABLE_EMAIL = process.env.DISABLE_EMAIL === 'true';
const DISABLE_WHATSAPP = process.env.DISABLE_WHATSAPP === 'true';

async function sendWelcomeNotifications(user) {
  console.log(`📧 [Welcome] User: ${user.name} (${user.email}, ${user.phone})`);
  
  if (DISABLE_EMAIL && DISABLE_WHATSAPP) {
    console.log(`⚠️ Notifications are disabled`);
    return { email: null, whatsapp: null };
  }
  
  const results = {};
  
  if (!DISABLE_EMAIL && user.email) {
    try {
      results.email = await emailService.sendWelcomeEmail(user);
      if (results.email?.success) {
        console.log(`✅ Welcome email sent to ${user.email}`);
      } else {
        console.log(`❌ Failed to send welcome email to ${user.email}`);
      }
    } catch (error) {
      console.error(`❌ Email error for ${user.email}:`, error.message);
      results.email = { success: false, error: error.message };
    }
  }
  
  if (!DISABLE_WHATSAPP && user.phone) {
    try {
      results.whatsapp = await whatsappService.sendWelcomeWhatsApp(user);
      if (results.whatsapp?.success) {
        console.log(`✅ Welcome WhatsApp sent to ${user.phone}`);
      } else {
        console.log(`❌ Failed to send welcome WhatsApp to ${user.phone}`);
      }
    } catch (error) {
      console.error(`❌ WhatsApp error for ${user.phone}:`, error.message);
      results.whatsapp = { success: false, error: error.message };
    }
  }
  
  return results;
}

async function sendOrderConfirmationNotifications(order, user) {
  console.log(`📧 [Order Confirmation] Order: ${order.orderNumber || order._id}, User: ${user.email}, ${user.phone}`);
  
  if (DISABLE_EMAIL && DISABLE_WHATSAPP) {
    console.log(`⚠️ Notifications are disabled`);
    return { email: null, whatsapp: null };
  }
  
  const results = {};
  
  if (!DISABLE_EMAIL && user.email) {
    try {
      results.email = await emailService.sendOrderConfirmationEmail(order, user);
      if (results.email?.success) {
        console.log(`✅ Order confirmation email sent to ${user.email}`);
      } else {
        console.log(`❌ Failed to send order confirmation email to ${user.email}`);
      }
    } catch (error) {
      console.error(`❌ Email error for ${user.email}:`, error.message);
      results.email = { success: false, error: error.message };
    }
  }
  
  if (!DISABLE_WHATSAPP && user.phone) {
    try {
      results.whatsapp = await whatsappService.sendOrderConfirmationWhatsApp(order, user);
      if (results.whatsapp?.success) {
        console.log(`✅ Order confirmation WhatsApp sent to ${user.phone}`);
      } else {
        console.log(`❌ Failed to send order confirmation WhatsApp to ${user.phone}`);
      }
    } catch (error) {
      console.error(`❌ WhatsApp error for ${user.phone}:`, error.message);
      results.whatsapp = { success: false, error: error.message };
    }
  }
  
  return results;
}

async function sendOrderStatusUpdateNotifications(order, user, oldStatus, newStatus) {
  console.log(`📧 [Status Update] Order: ${order.orderNumber || order._id}, Status: ${oldStatus} → ${newStatus}, User: ${user.email}, ${user.phone}`);
  
  if (DISABLE_EMAIL && DISABLE_WHATSAPP) {
    console.log(`⚠️ Notifications are disabled`);
    return { email: null, whatsapp: null };
  }
  
  const results = {};
  
  if (!DISABLE_EMAIL && user.email) {
    try {
      results.email = await emailService.sendOrderStatusUpdateEmail(order, user, oldStatus, newStatus);
      if (results.email?.success) {
        console.log(`✅ Status update email sent to ${user.email}`);
      } else {
        console.log(`❌ Failed to send status update email to ${user.email}`);
      }
    } catch (error) {
      console.error(`❌ Email error for ${user.email}:`, error.message);
      results.email = { success: false, error: error.message };
    }
  }
  
  if (!DISABLE_WHATSAPP && user.phone) {
    try {
      results.whatsapp = await whatsappService.sendOrderStatusUpdateWhatsApp(order, user, oldStatus, newStatus);
      if (results.whatsapp?.success) {
        console.log(`✅ Status update WhatsApp sent to ${user.phone}`);
      } else {
        console.log(`❌ Failed to send status update WhatsApp to ${user.phone}`);
      }
    } catch (error) {
      console.error(`❌ WhatsApp error for ${user.phone}:`, error.message);
      results.whatsapp = { success: false, error: error.message };
    }
  }
  
  return results;
}

module.exports = {
  sendWelcomeNotifications,
  sendOrderConfirmationNotifications,
  sendOrderStatusUpdateNotifications,
};