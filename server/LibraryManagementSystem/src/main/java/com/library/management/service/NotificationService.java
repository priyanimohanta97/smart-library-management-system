package com.library.management.service;

import com.library.management.dto.NotificationResponse;
import com.library.management.entity.NotificationType;
import com.library.management.entity.User;

import java.util.List;

public interface NotificationService {

    void sendNotification(User recipient, String title, String message, NotificationType type, Long referenceId);

    void notifyLibrarians(String title, String message, NotificationType type, Long referenceId);

    List<NotificationResponse> getNotificationsForUser(User user);

    long getUnreadCount(User user);

    NotificationResponse markAsRead(Long notificationId, User user);

    int markAllAsRead(User user);

    void deleteNotification(Long notificationId, User user);

    int clearAllNotifications(User user);
}

