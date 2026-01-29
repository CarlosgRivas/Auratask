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
    // Basic vibration usually works on mobile even if notifications are blocked, 
    // but only if the user has interacted with the page recently.
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }

    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
        try {
            // Service Worker is preferred for mobile, but simplistic approach here:
            if (navigator.serviceWorker && navigator.serviceWorker.ready) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, options);
                });
            } else {
                new Notification(title, options);
            }
        } catch (e) {
            console.error("Error sending notification:", e);
        }
    }
};
