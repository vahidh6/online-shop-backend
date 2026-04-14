const emailService = require('../services/email.service');
const whatsappService = require('../services/whatsapp.service');

async function sendWelcomeNotifications(user) {
  const results = {};
  if (user.email) results.email = await emailService.sendWelcomeEmail(user);
  if (user.phone) results.whatsapp = await whatsappService.sendWelcomeWhatsApp(user);
  return results;
}

async function sendOrderConfirmationNotifications(order, user) {
  const results = {};
  if (user.email) results.email = await emailService.sendOrderConfirmationEmail(order, user);
  if (user.phone) results.whatsapp = await whatsappService.sendOrderConfirmationWhatsApp(order, user);
  return results;
}

async function sendOrderStatusUpdateNotifications(order, user, oldStatus, newStatus) {
  const results = {};
  if (user.email) results.email = await emailService.sendOrderStatusUpdateEmail(order, user, oldStatus, newStatus);
  if (user.phone) results.whatsapp = await whatsappService.sendOrderStatusUpdateWhatsApp(order, user, oldStatus, newStatus);
  return results;
}

module.exports = {
  sendWelcomeNotifications,
  sendOrderConfirmationNotifications,
  sendOrderStatusUpdateNotifications,
};