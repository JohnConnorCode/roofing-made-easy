// Email service exports
export { sendEmail, isEmailConfigured } from './resend'
export {
  newLeadEmail,
  estimateGeneratedEmail,
  dailyDigestEmail,
  customerEstimateEmail,
  contactConfirmationEmail,
  contactAdminNotificationEmail,
  consultationReminderEmail,
  paymentReceivedEmail,
  welcomeEmail,
} from './templates'
export type {
  NewLeadEmailData,
  EstimateEmailData,
  DailyDigestEmailData,
  CustomerEstimateEmailData,
  ContactConfirmationEmailData,
  ContactAdminNotificationData,
  ConsultationReminderEmailData,
  PaymentReceivedEmailData,
  WelcomeEmailData,
} from './templates'
export {
  notifyNewLead,
  notifyEstimateGenerated,
  sendCustomerEstimateEmail,
  sendContactFormEmails,
  sendConsultationReminderEmail,
  sendPaymentReceivedEmail,
  sendWelcomeEmail,
} from './notifications'
export type {
  LeadNotificationData,
  EstimateNotificationData,
  ConsultationReminderData,
  PaymentNotificationData,
  WelcomeData,
} from './notifications'
