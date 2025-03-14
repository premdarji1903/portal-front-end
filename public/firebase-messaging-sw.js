// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyAbAZISdoDCFX7Tg20h22z1fn_jePAtbZM",
    authDomain: "notification-64fe5.firebaseapp.com",
    projectId: "notification-64fe5",
    storageBucket: "notification-64fe5.firebasestorage.app",
    messagingSenderId: "705036575304",
    appId: "1:705036575304:web:b5c8adb7c6805cdbe6ae7d",
    vapidKey: "BLCTe6RXvBCeIwAj8wR0fd3nCV_vUeFSLw1yxaJgrtJATQ77LQLlGI1fbszJMvMkUSTOQT3ExoBRyujXc0MIHEs"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log("Received background message: ", payload);
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon,
    });
});
