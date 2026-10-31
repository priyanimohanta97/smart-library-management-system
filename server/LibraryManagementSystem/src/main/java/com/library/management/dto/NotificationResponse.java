package com.library.management.dto;

import com.library.management.entity.Notification;
import com.library.management.entity.NotificationType;

import java.time.Instant;

public class NotificationResponse {

    private String id;
    private String title;
    private String message;
    private NotificationType type;
    private String referenceId;
    @com.fasterxml.jackson.annotation.JsonProperty("isRead")
    private boolean isRead;
    private Instant createdAt;
    private Instant readAt;

    public NotificationResponse() {
    }

    public static NotificationResponse fromEntity(Notification notification) {
        if (notification == null) return null;
        NotificationResponse dto = new NotificationResponse();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setReferenceId(notification.getReferenceId());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setReadAt(notification.getReadAt());
        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getReadAt() {
        return readAt;
    }

    public void setReadAt(Instant readAt) {
        this.readAt = readAt;
    }
}
