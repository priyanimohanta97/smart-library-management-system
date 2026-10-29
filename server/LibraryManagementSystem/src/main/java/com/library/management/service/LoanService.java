package com.library.management.service;

import com.library.management.dto.CirculationStatsResponse;
import com.library.management.dto.LoanRequestDto;
import com.library.management.dto.LoanResponse;
import com.library.management.dto.RejectLoanDto;
import com.library.management.entity.User;

import java.util.List;

public interface LoanService {

    LoanResponse requestLoan(LoanRequestDto dto, User student);

    LoanResponse approveLoan(Long loanId, User librarian);

    LoanResponse rejectLoan(Long loanId, RejectLoanDto dto, User librarian);

    LoanResponse requestReturn(Long loanId, User student);

    LoanResponse confirmReturn(Long loanId, User librarian);

    List<LoanResponse> getStudentLoans(User student);

    List<LoanResponse> getPendingLoans();

    List<LoanResponse> getPendingReturns();

    List<LoanResponse> getActiveLoans();

    CirculationStatsResponse getCirculationStats();
}

