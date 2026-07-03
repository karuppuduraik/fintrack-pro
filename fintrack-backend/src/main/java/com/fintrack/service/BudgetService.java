package com.fintrack.service;

import com.fintrack.dto.BudgetRequest;
import com.fintrack.dto.BudgetStatusDTO;
import com.fintrack.entity.*;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserService userService;

    public BudgetService(BudgetRepository budgetRepository,
                         CategoryRepository categoryRepository,
                         TransactionRepository transactionRepository,
                         UserService userService) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<Budget> getBudgets() {
        User user = userService.getCurrentUser();
        return budgetRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public List<BudgetStatusDTO> getBudgetsStatus() {
        User user = userService.getCurrentUser();
        List<Budget> budgets = budgetRepository.findByUser(user);
        List<BudgetStatusDTO> statusList = new ArrayList<>();

        for (Budget budget : budgets) {
            LocalDate now = LocalDate.now();
            LocalDate start;
            LocalDate end;

            if (budget.getPeriod() == BudgetPeriod.WEEKLY) {
                start = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                end = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
            } else {
                start = now.withDayOfMonth(1);
                end = now.withDayOfMonth(now.lengthOfMonth());
            }

            BigDecimal spent = transactionRepository.sumAmountByUserAndTypeAndCategoryAndDateBetween(
                    user, TransactionType.EXPENSE, budget.getCategory(), start, end);
            
            if (spent == null) {
                spent = BigDecimal.ZERO;
            }

            statusList.add(BudgetStatusDTO.builder()
                    .id(budget.getId())
                    .category(budget.getCategory().getName())
                    .limitAmount(budget.getLimitAmount())
                    .spent(spent)
                    .period(budget.getPeriod().name())
                    .colorCode(budget.getCategory().getColorCode())
                    .build());
        }

        return statusList;
    }

    @Transactional
    public Budget createBudget(BudgetRequest request) {
        User user = userService.getCurrentUser();

        Category category = categoryRepository.findByNameIgnoreCase(request.getCategoryName())
                .orElseGet(() -> {
                    Category newCat = Category.builder()
                            .name(request.getCategoryName())
                            .type(TransactionType.EXPENSE)
                            .colorCode("#f59e0b")
                            .iconName("Category")
                            .build();
                    return categoryRepository.save(newCat);
                });

        // Check if budget already exists for this category
        budgetRepository.findByUserAndCategory(user, category).ifPresent(b -> {
            throw new RuntimeException("Budget already defined for category: " + category.getName());
        });

        LocalDate now = LocalDate.now();
        LocalDate start = now.withDayOfMonth(1);
        LocalDate end = now.withDayOfMonth(now.lengthOfMonth());

        Budget budget = Budget.builder()
                .user(user)
                .category(category)
                .limitAmount(request.getLimitAmount())
                .period(request.getPeriod())
                .startDate(start)
                .endDate(end)
                .build();

        return budgetRepository.save(budget);
    }

    @Transactional
    public Budget updateBudget(Long id, BigDecimal limitAmount) {
        User user = userService.getCurrentUser();
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget limits not found with id: " + id));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this budget record.");
        }

        budget.setLimitAmount(limitAmount);
        return budgetRepository.save(budget);
    }

    @Transactional
    public void deleteBudget(Long id) {
        User user = userService.getCurrentUser();
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget limits not found with id: " + id));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this budget record.");
        }

        budgetRepository.delete(budget);
    }
}
