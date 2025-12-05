// Push notification scheduling

const scheduledReminders = new Map<string, number>();

export async function scheduleReminder(
  noteId: string,
  title: string,
  reminderDatetime: string
): Promise<void> {
  // Request permission if not granted
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      const reminderDate = new Date(reminderDatetime);
      const now = new Date();
      const delay = reminderDate.getTime() - now.getTime();

      if (delay > 0) {
        // Clear existing reminder for this note
        if (scheduledReminders.has(noteId)) {
          clearTimeout(scheduledReminders.get(noteId)!);
        }

        // Schedule new reminder
        const timeoutId = window.setTimeout(() => {
          showNotification(title);
          scheduledReminders.delete(noteId);
        }, delay);

        scheduledReminders.set(noteId, timeoutId);

        // Also register with service worker for persistent reminders
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SCHEDULE_REMINDER',
            noteId,
            title,
            reminderDatetime,
          });
        }
      }
    }
  }
}

export function cancelReminder(noteId: string): void {
  if (scheduledReminders.has(noteId)) {
    clearTimeout(scheduledReminders.get(noteId)!);
    scheduledReminders.delete(noteId);
  }

  // Notify service worker
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CANCEL_REMINDER',
      noteId,
    });
  }
}

function showNotification(title: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('MindFat Reminder', {
      body: title,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'mindfat-reminder',
      vibrate: [200, 100, 200],
    });

    // Play a subtle sound (optional)
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe77OeeUxAOUKnn7rtfHQU7kNXzzXkhBSh+yO/bmjsKFFyz6OyrVxIKSKDf8r5zIwUsgs/y2oU1CBdmvO3mnk0PDk6n5O67Xh0FO5HV87l9IAUpfcru25tAChVctOjrqFUSCkeg4PKncCEFLILP8tmJNQgYZ7vt5p5ND',);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }
}
