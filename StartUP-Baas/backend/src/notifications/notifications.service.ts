import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepository: Repository<NotificationPreference>,
  ) {}

  async findAll(userId: string) {
    const notifications = await this.notificationRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });

    const unread_count = notifications.filter((n) => !n.is_read).length;

    return {
      success: true,
      data: notifications,
      meta: { total: notifications.length, unread_count },
    };
  }

  async markAsRead(userId: string, id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!notification) throw new NotFoundException('Notification not found');

    notification.is_read = true;
    notification.read_at = new Date();
    await this.notificationRepository.save(notification);

    return { success: true, data: notification };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true, read_at: new Date() },
    );
    return { success: true };
  }

  async getPreferences(userId: string) {
    let prefs = await this.preferenceRepository.findOne({
      where: { user_id: userId },
    });
    if (!prefs) {
      prefs = this.preferenceRepository.create({ user_id: userId });
      await this.preferenceRepository.save(prefs);
    }
    return { success: true, data: prefs };
  }

  async updatePreferences(userId: string, prefsDto: any) {
    let prefs = await this.preferenceRepository.findOne({
      where: { user_id: userId },
    });
    if (!prefs) {
      const newPrefs = this.preferenceRepository.create({
        user_id: userId,
        ...prefsDto,
      });
      prefs = Array.isArray(newPrefs) ? newPrefs[0] : newPrefs;
    } else {
      Object.assign(prefs, prefsDto);
    }
    await this.preferenceRepository.save(prefs);
    return { success: true, data: prefs };
  }
}
