export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function showNotification(title: string, body: string, url?: string) {
  if (Notification.permission !== "granted") return;

  const notification = new Notification(title, {
    body,
    icon: "/icon.svg",
    badge: "/icon.svg",
  });

  if (url) {
    notification.onclick = () => {
      window.open(url, "_blank");
      notification.close();
    };
  }
}

export function getNotificationStatus():
  | "granted"
  | "denied"
  | "default"
  | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}
