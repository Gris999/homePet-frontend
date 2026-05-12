import { initializeApp, getApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCREN7HfA420C9yZoW-Xkd0YrTTp9sEKZQ",
  authDomain: "pet-home-25068.firebaseapp.com",
  projectId: "pet-home-25068",
  storageBucket: "pet-home-25068.firebasestorage.app",
  messagingSenderId: "954296712424",
  appId: "1:954296712424:web:10092aaaa46fd850311d5d",
  measurementId: "G-L0DBMGD7T1"
};

// Inicializar Firebase solo una vez
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const VAPID_KEY = "BE6C7_26OhuL5mml9w3II-kPX1bIVSN_lHm8yns5v9TcS2aYOOSQDt5w8nM9RLevVys9KIk6X4Yk7DxXnLjHbdE";

// Función segura para obtener messaging solo en el cliente
export const getMessagingSafe = async () => {
  if (typeof window !== "undefined" && await isSupported()) {
    return getMessaging(app);
  }
  return null;
};

export const requestForToken = async () => {
  try {
    const messaging = await getMessagingSafe();
    if (!messaging) return null;
    
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (currentToken) {
      return currentToken;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};

// Instancia de Messaging para uso síncrono si es posible
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

// El listener se maneja ahora en el hook useFcmToken para poder mostrar Toasts
