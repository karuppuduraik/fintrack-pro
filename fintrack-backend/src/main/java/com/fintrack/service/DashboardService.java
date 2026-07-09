package com.fintrack.service;

import com.fintrack.dto.CashFlowChartDTO;
import com.fintrack.dto.CategoryBreakdownDTO;
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
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

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

        // Category Breakdown
        List<Object[]> categorySums = transactionRepository.sumAmountByUserAndTypeAndDateBetweenGroupByCategory(
                user, TransactionType.EXPENSE, start, end);
        List<CategoryBreakdownDTO> categoryBreakdown = new ArrayList<>();
        for (Object[] row : categorySums) {
            String catName = (String) row[0];
            BigDecimal totalAmt = (BigDecimal) row[1];
            String color = (String) row[2];
            categoryBreakdown.add(CategoryBreakdownDTO.builder()
                    .name(catName)
                    .value(totalAmt)
                    .color(color)
                    .build());
        }

        // Cashflow Trends (Last 7 Days)
        LocalDate today = LocalDate.now();
        List<CashFlowChartDTO> cashFlowTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            
            BigDecimal dayInc = transactionRepository.sumAmountByUserAndTypeAndDate(user, TransactionType.INCOME, date);
            if (dayInc == null) dayInc = BigDecimal.ZERO;
            
            BigDecimal dayExp = transactionRepository.sumAmountByUserAndTypeAndDate(user, TransactionType.EXPENSE, date);
            if (dayExp == null) dayExp = BigDecimal.ZERO;
            
            String dayName = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            cashFlowTrend.add(new CashFlowChartDTO(dayName, dayInc, dayExp));
        }

        return DashboardStatsDTO.builder()
                .income(income)
                .expense(expense)
                .savings(savings)
                .balance(balance)
                .categoryBreakdown(categoryBreakdown)
                .cashFlowTrend(cashFlowTrend)
                .build();
    }
}
