const admin = require('firebase-admin');
const env = require('../config/env');

let initialized = false;

function getRequiredCredential(name, value) {
  if (!value) {
    const err = new Error(`Missing Firebase config: ${name}`);
    err.statusCode = 500;
    throw err;
  }

  return value;
}

function initFirebaseAdmin() {
  if (initialized) {
    return;
  }

  const projectId = getRequiredCredential('FIREBASE_PROJECT_ID', env.FIREBASE_PROJECT_ID);
  const clientEmail = getRequiredCredential('FIREBASE_CLIENT_EMAIL', env.FIREBASE_CLIENT_EMAIL);
  const privateKeyRaw = getRequiredCredential('FIREBASE_PRIVATE_KEY', env.FIREBASE_PRIVATE_KEY);
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  initialized = true;
}

function getFirebaseAuth() {
  initFirebaseAdmin();
  return admin.auth();
}

async function verifyFirebaseIdToken(idToken) {
  if (!idToken) {
    const err = new Error('Firebase idToken is required');
    err.statusCode = 401;
    throw err;
  }

  try {
    return await getFirebaseAuth().verifyIdToken(idToken, true);
  } catch (error) {
    const err = new Error('Invalid or expired Firebase token');
    err.statusCode = 401;
    throw err;
  }
}

module.exports = {
  getFirebaseAuth,
  verifyFirebaseIdToken,
};
