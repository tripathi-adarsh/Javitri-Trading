'use strict'
const sequelize          = require('../db/sequelize')
const User               = require('./User')
const Employee           = require('./Employee')
const Client             = require('./Client')
const ClientKYC          = require('./ClientKYC')
const ClientBankAccount  = require('./ClientBankAccount')
const ClientPlanRequest  = require('./ClientPlanRequest')
const DailyPayout        = require('./DailyPayout')
const Plan               = require('./Plan')
const PromoCode          = require('./PromoCode')
const Order              = require('./Order')
const Payment            = require('./Payment')
const PaymentReview      = require('./PaymentReview')
const LegalDocument      = require('./LegalDocument')
const LegalConsent       = require('./LegalConsent')
const AuditLog           = require('./AuditLog')
const ContactMessage     = require('./ContactMessage')
const PaymentRequest     = require('./PaymentRequest')

// ── User ↔ Employee ───────────────────────────────────────────────────────────
User.hasOne(Employee,     { foreignKey: 'user_id', as: 'employeeProfile' })
Employee.belongsTo(User,  { foreignKey: 'user_id', as: 'user' })
User.hasMany(Employee,    { foreignKey: 'created_by_user_id', as: 'createdEmployees' })
Employee.belongsTo(User,  { foreignKey: 'created_by_user_id', as: 'createdBy' })

// ── Employee ↔ Client ─────────────────────────────────────────────────────────
Employee.hasMany(Client,   { foreignKey: 'originating_employee_id', as: 'clients' })
Client.belongsTo(Employee, { foreignKey: 'originating_employee_id', as: 'originatingEmployee' })

// ── Client ↔ ClientKYC ────────────────────────────────────────────────────────
Client.hasOne(ClientKYC,    { foreignKey: 'client_id', as: 'kyc' })
ClientKYC.belongsTo(Client, { foreignKey: 'client_id', as: 'client' })

// ── Client ↔ ClientBankAccount ────────────────────────────────────────────────
Client.hasMany(ClientBankAccount,    { foreignKey: 'client_id', as: 'bankAccounts' })
ClientBankAccount.belongsTo(Client, { foreignKey: 'client_id', as: 'client' })

// ── User ↔ Order ───────────────────────────────────────────────────────────────
User.hasMany(Order,   { foreignKey: 'user_id', as: 'orders' })
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

// ── Client ↔ Order ─────────────────────────────────────────────────────────────
Client.hasMany(Order,   { foreignKey: 'client_id', as: 'orders' })
Order.belongsTo(Client, { foreignKey: 'client_id', as: 'client' })

// ── Employee ↔ Order ───────────────────────────────────────────────────────────
Employee.hasMany(Order,   { foreignKey: 'employee_id', as: 'orders' })
Order.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' })

// ── Plan ↔ Order ───────────────────────────────────────────────────────────────
Plan.hasMany(Order,   { foreignKey: 'plan_id', as: 'orders' })
Order.belongsTo(Plan, { foreignKey: 'plan_id', as: 'plan' })

// ── PromoCode ↔ Order ──────────────────────────────────────────────────────────
PromoCode.hasMany(Order,   { foreignKey: 'promo_code_id', as: 'orders' })
Order.belongsTo(PromoCode, { foreignKey: 'promo_code_id', as: 'promoCode' })

// ── Order ↔ Payment ────────────────────────────────────────────────────────────
Order.hasMany(Payment,    { foreignKey: 'order_id', as: 'payments' })
Payment.belongsTo(Order,  { foreignKey: 'order_id', as: 'order' })

// ── User ↔ Payment ─────────────────────────────────────────────────────────────
User.hasMany(Payment,    { foreignKey: 'user_id', as: 'payments' })
Payment.belongsTo(User,  { foreignKey: 'user_id', as: 'user' })

// ── Order ↔ PaymentReview ─────────────────────────────────────────────────────
Order.hasOne(PaymentReview,     { foreignKey: 'order_id',   as: 'paymentReview' })
PaymentReview.belongsTo(Order,  { foreignKey: 'order_id',   as: 'order' })

// ── Payment ↔ PaymentReview ───────────────────────────────────────────────────
Payment.hasOne(PaymentReview,     { foreignKey: 'payment_id', as: 'review' })
PaymentReview.belongsTo(Payment,  { foreignKey: 'payment_id', as: 'payment' })

// ── User (reviewer) ↔ PaymentReview ──────────────────────────────────────────
User.hasMany(PaymentReview,     { foreignKey: 'reviewer_id', as: 'reviewedPayments' })
PaymentReview.belongsTo(User,   { foreignKey: 'reviewer_id', as: 'reviewer' })

// ── User ↔ LegalConsent ────────────────────────────────────────────────────────
User.hasMany(LegalConsent,    { foreignKey: 'user_id', as: 'consents' })
LegalConsent.belongsTo(User,  { foreignKey: 'user_id', as: 'user' })

// ── LegalDocument ↔ LegalConsent ──────────────────────────────────────────────
LegalDocument.hasMany(LegalConsent,    { foreignKey: 'legal_document_id', as: 'consents' })
LegalConsent.belongsTo(LegalDocument,  { foreignKey: 'legal_document_id', as: 'document' })

// ── Order ↔ LegalConsent (terms + privacy) ────────────────────────────────────
Order.belongsTo(LegalConsent, { foreignKey: 'terms_consent_id',   as: 'termsConsent' })
Order.belongsTo(LegalConsent, { foreignKey: 'privacy_consent_id', as: 'privacyConsent' })

// ── AuditLog ↔ User ───────────────────────────────────────────────────────────
User.hasMany(AuditLog,    { foreignKey: 'actor_user_id', as: 'auditLogs' })
AuditLog.belongsTo(User,  { foreignKey: 'actor_user_id', as: 'actor' })

// ── Client ↔ ClientPlanRequest ────────────────────────────────────────────────
Client.hasMany(ClientPlanRequest,       { foreignKey: 'client_id', as: 'planRequests' })
ClientPlanRequest.belongsTo(Client,     { foreignKey: 'client_id', as: 'client' })

// ── Employee ↔ ClientPlanRequest ──────────────────────────────────────────────
Employee.hasMany(ClientPlanRequest,     { foreignKey: 'assigned_employee_id', as: 'planRequests' })
ClientPlanRequest.belongsTo(Employee,  { foreignKey: 'assigned_employee_id', as: 'assignedEmployee' })

// ── ClientPlanRequest ↔ DailyPayout ───────────────────────────────────────────
ClientPlanRequest.hasMany(DailyPayout,  { foreignKey: 'plan_request_id', as: 'dailyPayouts' })
DailyPayout.belongsTo(ClientPlanRequest, { foreignKey: 'plan_request_id', as: 'planRequest' })

// ── Client ↔ DailyPayout ─────────────────────────────────────────────────────
Client.hasMany(DailyPayout,   { foreignKey: 'client_id', as: 'dailyPayouts' })
DailyPayout.belongsTo(Client, { foreignKey: 'client_id', as: 'client' })

// ── Client ↔ PaymentRequest ──────────────────────────────────────────────────
Client.hasMany(PaymentRequest,      { foreignKey: 'client_id', as: 'paymentRequests' })
PaymentRequest.belongsTo(Client,    { foreignKey: 'client_id', as: 'client' })

// ── ClientPlanRequest ↔ PaymentRequest ───────────────────────────────────────
ClientPlanRequest.hasMany(PaymentRequest,      { foreignKey: 'plan_request_id', as: 'paymentRequests' })
PaymentRequest.belongsTo(ClientPlanRequest,    { foreignKey: 'plan_request_id', as: 'planRequest' })

// ── User (processor) ↔ PaymentRequest ────────────────────────────────────────
User.hasMany(PaymentRequest,        { foreignKey: 'processed_by', as: 'processedPaymentRequests' })
PaymentRequest.belongsTo(User,      { foreignKey: 'processed_by', as: 'processor' })

module.exports = {
  sequelize,
  User,
  Employee,
  Client,
  ClientKYC,
  ClientBankAccount,
  ClientPlanRequest,
  DailyPayout,
  Plan,
  PromoCode,
  Order,
  Payment,
  PaymentReview,
  LegalDocument,
  LegalConsent,
  AuditLog,
  ContactMessage,
  PaymentRequest,
}
