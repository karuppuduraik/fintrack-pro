package com.fintrack.service;

import com.fintrack.dto.DashboardStatsDTO;
import com.fintrack.entity.Goal;
import com.fintrack.entity.TransactionType;
import com.fintrack.entity.User;
import com.fintrack.repository.GoalRepository;
import com.fintrack.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final GoalRepository goalRepository;
    private final UserService userService;

    public DashboardService(TransactionRepository transactionRepository,
                            GoalRepository goalRepository,
                            UserService userService) {
        this.transactionRepository = transactionRepository;
        this.goalRepository = goalRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        User user = userService.getCurrentUser();
        LocalDate now = LocalDate.now();
        LocalDate start = now.withDayOfMonth(1);
        LocalDate end = now.withDayOfMonth(now.lengthOfMonth());

        // Sum Income in current month
        BigDecimal income = transactionRepository.sumAmountByUserAndTypeAndDateBetween(
                user, TransactionType.INCOME, start, end);
        if (income == null) {
            income = BigDecimal.ZERO;
        }

        // Sum Expense in current month
        BigDecimal expense = transactionRepository.sumAmountByUserAndTypeAndDateBetween(
                user, TransactionType.EXPENSE, start, end);
        if (expense == null) {
            expense = BigDecimal.ZERO;
        }

        // Sum Savings portfolio
        List<Goal> goals = goalRepository.findByUser(user);
        BigDecimal savings = goals.stream()
                .map(Goal::getCurrentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = income.subtract(expense);

        return DashboardStatsDTO.builder()
                .income(income)
                .expense(expense)
                .savings(savings)
                .balance(balance)
                .build();
    }
}
