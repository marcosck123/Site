export class NotificationService {
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.error('Este navegador não suporta notificações desktop');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  static async sendNotification(title: string, options?: NotificationOptions) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: 'https://picsum.photos/seed/candy/100/100',
        badge: 'https://picsum.photos/seed/candy/100/100',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  static getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }
}
