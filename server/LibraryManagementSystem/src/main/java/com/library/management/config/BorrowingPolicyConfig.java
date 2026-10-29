package com.library.management.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.borrowing")
public class BorrowingPolicyConfig {

    /**
     * Maximum number of combined active loans and pending requests permitted per student.
     */
    private int maxActiveLoans = 4;

    /**
     * Default loan period in calendar days from the date of librarian approval.
     */
    private int loanDurationDays = 14;

    /**
     * Grace period in days before an active loan is considered overdue.
     */
    private int overdueGracePeriodDays = 0;

    public BorrowingPolicyConfig() {
    }

    public int getMaxActiveLoans() {
        return maxActiveLoans;
    }

    public void setMaxActiveLoans(int maxActiveLoans) {
        this.maxActiveLoans = maxActiveLoans;
    }

    public int getLoanDurationDays() {
        return loanDurationDays;
    }

    public void setLoanDurationDays(int loanDurationDays) {
        this.loanDurationDays = loanDurationDays;
    }

    public int getOverdueGracePeriodDays() {
        return overdueGracePeriodDays;
    }

    public void setOverdueGracePeriodDays(int overdueGracePeriodDays) {
        this.overdueGracePeriodDays = overdueGracePeriodDays;
    }
}

