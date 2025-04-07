import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBUT2e0f4Ie13mRE-Y0RbdgKtDEdXJqI28",
  authDomain: "capitalism-clicker.firebaseapp.com",
  projectId: "capitalism-clicker",
  storageBucket: "capitalism-clicker.firebasestorage.app",
  messagingSenderId: "1044966395778",
  appId: "1:1044966395778:web:7ba48936ce4088c332099b",
  measurementId: "G-N3B9T8CJ77"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Analytics event logging helper
export const logAnalyticsEvent = (eventName: string, eventParams?: Record<string, any>) => {
  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error('Analytics event logging failed:', error);
  }
};