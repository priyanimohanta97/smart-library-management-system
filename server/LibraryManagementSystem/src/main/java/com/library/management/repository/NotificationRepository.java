package com.library.management.repository;

import com.library.management.entity.Notification;
import com.library.management.entity.NotificationType;
import com.library.management.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    long countByRecipientAndIsReadFalse(User recipient);

    List<Notification> findByRecipientAndIsReadFalse(User recipient);

    boolean existsByRecipientAndTypeAndReferenceId(User recipient, NotificationType type, String referenceId);

    long deleteByRecipient(User recipient);
}
