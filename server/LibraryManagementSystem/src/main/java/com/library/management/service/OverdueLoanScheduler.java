package com.library.management.service;

import com.library.management.config.BorrowingPolicyConfig;
import com.library.management.entity.Loan;
import com.library.management.entity.NotificationType;
import com.library.management.repository.LoanRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class OverdueLoanScheduler {

    private static final Logger log = LoggerFactory.getLogger(OverdueLoanScheduler.class);

    private final LoanRepository loanRepository;
    private final NotificationService notificationService;
    private final BorrowingPolicyConfig borrowingPolicyConfig;

    public OverdueLoanScheduler(LoanRepository loanRepository,
                                NotificationService notificationService,
                                BorrowingPolicyConfig borrowingPolicyConfig) {
        this.loanRepository = loanRepository;
        this.notificationService = notificationService;
        this.borrowingPolicyConfig = borrowingPolicyConfig;
    }

    /**
     * Periodic scheduled job executing daily at 01:00 AM.
     * Identifies active loans exceeding their due date and dispatches in-app overdue alerts.
     */
    @Scheduled(cron = "${app.borrowing.overdue-check-cron:0 0 1 * * ?}")
    @Transactional
    public int processOverdueLoans() {
        Instant now = Instant.now();
        Instant cutoff = now.minus(borrowingPolicyConfig.getOverdueGracePeriodDays(), ChronoUnit.DAYS);

        List<Loan> overdueLoans = loanRepository.findOverdueLoans(cutoff);
        if (overdueLoans.isEmpty()) {
            log.debug("No overdue loans detected during scheduled circulation sweep.");
            return 0;
        }

        int processedCount = 0;
        for (Loan loan : overdueLoans) {
            if (loan.getUser() == null || loan.getBook() == null) {
                continue;
            }

            notificationService.sendNotification(
                    loan.getUser(),
                    "Overdue Loan Notice",
                    "Your loan for '" + loan.getBook().getTitle() + "' was due on " + loan.getDueDate() +
                    ". Please return the physical copy to the VSSUT circulation desk immediately.",
                    NotificationType.LOAN_OVERDUE,
                    loan.getId()
            );
            processedCount++;
        }

        log.info("Processed {} overdue loans during scheduled circulation sweep.", processedCount);
        return processedCount;
    }
}

