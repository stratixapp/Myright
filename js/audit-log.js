// ===========================
// MYRIGHT — AUDIT LOG MODULE
//
// Logs sensitive actions to Firestore adminLogs collection.
// Normal users cannot read adminLogs (Firestore rules enforce this).
// Use this for: admin actions, payments, plan changes, document generation.
// ===========================

window.MRAudit = (function() {
  'use strict';

  const EVENT_TYPES = {
    ADMIN_LOGIN:            'admin_login',
    ADMIN_DOC_ACCESS:       'admin_doc_access',
    PAYMENT_VERIFIED:       'payment_verified',
    PAYMENT_FAILED:         'payment_failed',
    PLAN_ACTIVATED:         'plan_activated',
    DOC_GENERATED:          'doc_generated',
    DOC_DELETED:            'doc_deleted',
    ACCOUNT_DELETE_REQUEST: 'account_delete_request',
    CHAT_MESSAGE_SENT:      'chat_message_sent',
    AUTH_SIGNUP:            'auth_signup',
    AUTH_LOGIN:             'auth_login',
    AUTH_LOGOUT:            'auth_logout'
  };

  async function log(eventType, actorId, targetId, metadata = {}) {
    const db = window.MRAuth && MRAuth.getDb ? MRAuth.getDb() : null;
    if (!db) return; // Silent fail — never block the user action

    try {
      await db.collection('adminLogs').add({
        eventType,
        actorId:   actorId  || null,
        targetId:  targetId || null,
        metadata:  metadata || {},
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userAgent: navigator.userAgent.slice(0, 200),
        appVersion: 'v16'
      });
    } catch(e) {
      // Silent fail — Firestore rules will reject writes from non-admins
      // That's fine — only server-side writes need to succeed for audit logs
      console.debug('MRAudit: log write skipped (expected for non-admin):', e.code);
    }
  }

  return { log, EVENT_TYPES };
})();
