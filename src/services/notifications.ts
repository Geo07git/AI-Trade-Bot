export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("Acest browser nu suportă notificări desktop.");
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
}

export function sendWebPush(title: string, body: string) {
  if (!("Notification" in window)) return;
  
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "https://cdn-icons-png.flaticon.com/512/2950/2950073.png" // Placeholder icon
    });
  } else {
    console.warn("Nu ai permisiuni pentru notificări. Mesaj:", title, body);
  }
}

export async function sendWebhookMessage(url: string, message: string) {
  if (!url) return;

  try {
    // Discord webhook format
    let payload = { content: message };
    
    // Auto-detect Telegram (very basic) and format accordingly
    if (url.includes('api.telegram.org')) {
      // For telegram, the URL usually is https://api.telegram.org/bot<token>/sendMessage?chat_id=<id>
      // For simplicity, if the user provided the full URL with query params, we might just need to append text or send it as POST.
      // We assume the user provides a webhook URL that accepts a POST with {text: message} or we just let it fail gracefully.
      // A proper implementation would require chat_id, but here we just try a basic POST.
      payload = { text: message } as any;
    }

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("Eroare la trimiterea webhook-ului:", err);
  }
}
