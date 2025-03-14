import axios from "axios";
import { getToken } from "firebase/messaging";
import { VITE_NOTIFICATION_API_URL, VITE_VAPID_KEY } from "./ennvirnmentVariables";
import { messaging } from "./fireBaseConfig";

export const generateFirebaseToken = async (userId: string, authToken: string) => {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("Notification permission denied.");
            return;
        }

        const token = await getToken(messaging, {
            vapidKey: VITE_VAPID_KEY,
        });

        // Send token to server
        const response = await axios.post(`${VITE_NOTIFICATION_API_URL}/save-token`, {
            token,
            userId,
        }, {
            headers: {
                Authorization: `Bearer ${authToken}`,  // Pass Bearer Token
                'Content-Type': 'application/json',
            }
        }

        );
        console.log(response)

    } catch (error) {
        console.error("Error generating Firebase token:", error);
    }
};