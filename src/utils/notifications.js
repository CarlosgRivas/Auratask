export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notification");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const sendNotification = (title, options) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
        try {
            new Notification(title, options);
        } catch (e) {
            console.error("Error sending notification:", e);
        }
    }
};
