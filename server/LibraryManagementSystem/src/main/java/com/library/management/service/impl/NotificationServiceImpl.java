package com.library.management.service.impl;

import com.library.management.dto.NotificationResponse;
import com.library.management.entity.Notification;
import com.library.management.entity.NotificationType;
import com.library.management.entity.Role;
import com.library.management.entity.User;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.NotificationRepository;
import com.library.management.repository.UserRepository;
import com.library.management.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void sendNotification(User recipient, String title, String message, NotificationType type, Long referenceId) {
        if (recipient == null) return;

        // Deduplication guard for loan lifecycle notifications
        if (referenceId != null && notificationRepository.existsByRecipientAndTypeAndReferenceId(recipient, type, referenceId)) {
            log.debug("Duplicate notification avoided for recipient {} with type {} and ref {}", recipient.getEmail(), type, referenceId);
            return;
        }

        Notification notification = new Notification(recipient, title, message, type, referenceId);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void notifyLibrarians(String title, String message, NotificationType type, Long referenceId) {
        List<User> staff = userRepository.findByRoleIn(List.of(Role.ADMIN, Role.MANAGER));
        for (User librarian : staff) {
            sendNotification(librarian, title, message, type, referenceId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForUser(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByRecipientAndIsReadFalse(user);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You cannot modify notifications belonging to another user.");
        }

        if (!notification.isRead()) {
            notification.markAsRead();
            notificationRepository.save(notification);
        }

        return NotificationResponse.fromEntity(notification);
    }

    @Override
    @Transactional
    public int markAllAsRead(User user) {
        return notificationRepository.markAllAsReadForRecipient(user, Instant.now());
    }
}

