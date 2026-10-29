package com.library.management.repository;

import com.library.management.entity.Notification;
import com.library.management.entity.NotificationType;
import com.library.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    long countByRecipientAndIsReadFalse(User recipient);

    /**
     * Prevents duplicate notification records on retried requests or duplicate events.
     */
    boolean existsByRecipientAndTypeAndReferenceId(User recipient, NotificationType type, Long referenceId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :now WHERE n.recipient = :recipient AND n.isRead = false")
    int markAllAsReadForRecipient(@Param("recipient") User recipient, @Param("now") Instant now);
}

