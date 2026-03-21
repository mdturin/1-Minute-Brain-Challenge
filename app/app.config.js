import 'dotenv/config';

const env = (key, fallback = '') => process.env[key] ?? fallback;

export default ({ config }) => {
  const baseFirebase = config.extra?.firebase ?? {};

  return {
    ...config,
    extra: {
      ...config.extra,
      firebase: {
        apiKey: env('FIREBASE_API_KEY') || baseFirebase.apiKey || '',
        authDomain: env('FIREBASE_AUTH_DOMAIN') || baseFirebase.authDomain || '',
        projectId: env('FIREBASE_PROJECT_ID') || baseFirebase.projectId || '',
        storageBucket: env('FIREBASE_STORAGE_BUCKET') || baseFirebase.storageBucket || '',
        messagingSenderId:
          env('FIREBASE_MESSAGING_SENDER_ID') || baseFirebase.messagingSenderId || '',
        appId: env('FIREBASE_APP_ID') || baseFirebase.appId || '',
        measurementId: env('FIREBASE_MEASUREMENT_ID') || baseFirebase.measurementId || '',
      },
    },
  };
};
