importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCREN7HfA420C9yZoW-Xkd0YrTTp9sEKZQ",
  authDomain: "pet-home-25068.firebaseapp.com",
  projectId: "pet-home-25068",
  storageBucket: "pet-home-25068.firebasestorage.app",
  messagingSenderId: "954296712424",
  appId: "1:954296712424:web:10092aaaa46fd850311d5d",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
