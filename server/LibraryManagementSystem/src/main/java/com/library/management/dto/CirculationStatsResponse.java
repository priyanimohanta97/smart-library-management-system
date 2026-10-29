package com.library.management.dto;

public class CirculationStatsResponse {

    private long pendingRequestsCount;
    private long activeLoansCount;
    private long pendingReturnsCount;
    private long overdueLoansCount;
    private long totalTitlesCount;
    private long totalCopiesCount;
    private long availableCopiesCount;

    public CirculationStatsResponse() {
    }

    public CirculationStatsResponse(long pendingRequestsCount, long activeLoansCount, long pendingReturnsCount,
                                    long overdueLoansCount, long totalTitlesCount, long totalCopiesCount,
                                    long availableCopiesCount) {
        this.pendingRequestsCount = pendingRequestsCount;
        this.activeLoansCount = activeLoansCount;
        this.pendingReturnsCount = pendingReturnsCount;
        this.overdueLoansCount = overdueLoansCount;
        this.totalTitlesCount = totalTitlesCount;
        this.totalCopiesCount = totalCopiesCount;
        this.availableCopiesCount = availableCopiesCount;
    }

    public long getPendingRequestsCount() {
        return pendingRequestsCount;
    }

    public void setPendingRequestsCount(long pendingRequestsCount) {
        this.pendingRequestsCount = pendingRequestsCount;
    }

    public long getActiveLoansCount() {
        return activeLoansCount;
    }

    public void setActiveLoansCount(long activeLoansCount) {
        this.activeLoansCount = activeLoansCount;
    }

    public long getPendingReturnsCount() {
        return pendingReturnsCount;
    }

    public void setPendingReturnsCount(long pendingReturnsCount) {
        this.pendingReturnsCount = pendingReturnsCount;
    }

    public long getOverdueLoansCount() {
        return overdueLoansCount;
    }

    public void setOverdueLoansCount(long overdueLoansCount) {
        this.overdueLoansCount = overdueLoansCount;
    }

    public long getTotalTitlesCount() {
        return totalTitlesCount;
    }

    public void setTotalTitlesCount(long totalTitlesCount) {
        this.totalTitlesCount = totalTitlesCount;
    }

    public long getTotalCopiesCount() {
        return totalCopiesCount;
    }

    public void setTotalCopiesCount(long totalCopiesCount) {
        this.totalCopiesCount = totalCopiesCount;
    }

    public long getAvailableCopiesCount() {
        return availableCopiesCount;
    }

    public void setAvailableCopiesCount(long availableCopiesCount) {
        this.availableCopiesCount = availableCopiesCount;
    }
}

