package com.fintrack.config;

import com.fintrack.entity.*;
import com.fintrack.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final GoalRepository goalRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseInitializer(UserRepository userRepository,
                               CategoryRepository categoryRepository,
                               TransactionRepository transactionRepository,
                               BudgetRepository budgetRepository,
                               GoalRepository goalRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.goalRepository = goalRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Categories if empty
        if (categoryRepository.count() == 0) {
            seedCategories();
        }

        // 2. Seed Default User if empty
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("Karuppudurai")
                    .email("karuppudurai@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .role("ADMIN")
                    .build();
            admin = userRepository.save(admin);

            // 3. Seed Goals for the Default User
            seedGoals(admin);

            // 4. Seed Budgets for the Default User
            seedBudgets(admin);

            // 5. Seed Transactions for the Default User
            seedTransactions(admin);
        }
    }

    private void seedCategories() {
        List<Category> categories = List.of(
            // Income Categories
            Category.builder().name("Salary").type(TransactionType.INCOME).colorCode("#10b981").iconName("Salary").build(),
            Category.builder().name("Investment").type(TransactionType.INCOME).colorCode("#6366f1").iconName("Investment").build(),
            Category.builder().name("Freelance").type(TransactionType.INCOME).colorCode("#06b6d4").iconName("Freelance").build(),
            Category.builder().name("Refund").type(TransactionType.INCOME).colorCode("#eab308").iconName("Refund").build(),
            
            // Expense Categories
            Category.builder().name("Rent").type(TransactionType.EXPENSE).colorCode("#3b82f6").iconName("Rent").build(),
            Category.builder().name("Food").type(TransactionType.EXPENSE).colorCode("#10b981").iconName("Food").build(),
            Category.builder().name("Shopping").type(TransactionType.EXPENSE).colorCode("#f59e0b").iconName("Shopping").build(),
            Category.builder().name("Fuel").type(TransactionType.EXPENSE).colorCode("#ec4899").iconName("Fuel").build(),
            Category.builder().name("Education").type(TransactionType.EXPENSE).colorCode("#8b5cf6").iconName("Education").build(),
            Category.builder().name("Medical").type(TransactionType.EXPENSE).colorCode("#ef4444").iconName("Medical").build(),
            Category.builder().name("Internet").type(TransactionType.EXPENSE).colorCode("#06b6d4").iconName("Internet").build(),
            Category.builder().name("Electricity").type(TransactionType.EXPENSE).colorCode("#eab308").iconName("Electricity").build(),
            Category.builder().name("Entertainment").type(TransactionType.EXPENSE).colorCode("#f43f5e").iconName("Entertainment").build()
        );
        categoryRepository.saveAll(categories);
    }

    private void seedGoals(User user) {
        List<Goal> goals = List.of(
            Goal.builder().user(user).name("Emergency Fund").targetAmount(new BigDecimal("100000")).currentAmount(new BigDecimal("80000")).targetDate(LocalDate.now().plusMonths(6)).status(GoalStatus.IN_PROGRESS).build(),
            Goal.builder().user(user).name("Premium Laptop").targetAmount(new BigDecimal("150000")).currentAmount(new BigDecimal("45000")).targetDate(LocalDate.now().plusMonths(3)).status(GoalStatus.IN_PROGRESS).build(),
            Goal.builder().user(user).name("Sports Commute Bike").targetAmount(new BigDecimal("200000")).currentAmount(new BigDecimal("150000")).targetDate(LocalDate.now().plusYears(1)).status(GoalStatus.IN_PROGRESS).build(),
            Goal.builder().user(user).name("European Vacation").targetAmount(new BigDecimal("300000")).currentAmount(new BigDecimal("300000")).targetDate(LocalDate.now().minusDays(5)).status(GoalStatus.COMPLETED).build(),
            Goal.builder().user(user).name("Higher Education Vault").targetAmount(new BigDecimal("500000")).currentAmount(new BigDecimal("120000")).targetDate(LocalDate.now().plusYears(2)).status(GoalStatus.IN_PROGRESS).build()
        );
        goalRepository.saveAll(goals);
    }

    private void seedBudgets(User user) {
        Category rentCat = categoryRepository.findByNameIgnoreCase("Rent").orElseThrow();
        Category foodCat = categoryRepository.findByNameIgnoreCase("Food").orElseThrow();
        Category shopCat = categoryRepository.findByNameIgnoreCase("Shopping").orElseThrow();
        Category fuelCat = categoryRepository.findByNameIgnoreCase("Fuel").orElseThrow();
        Category eduCat = categoryRepository.findByNameIgnoreCase("Education").orElseThrow();

        LocalDate now = LocalDate.now();
        LocalDate start = now.withDayOfMonth(1);
        LocalDate end = now.withDayOfMonth(now.lengthOfMonth());

        List<Budget> budgets = List.of(
            Budget.builder().user(user).category(rentCat).limitAmount(new BigDecimal("15000")).period(BudgetPeriod.MONTHLY).startDate(start).endDate(end).build(),
            Budget.builder().user(user).category(foodCat).limitAmount(new BigDecimal("10000")).period(BudgetPeriod.MONTHLY).startDate(start).endDate(end).build(),
            Budget.builder().user(user).category(shopCat).limitAmount(new BigDecimal("8000")).period(BudgetPeriod.MONTHLY).startDate(start).endDate(end).build(),
            Budget.builder().user(user).category(fuelCat).limitAmount(new BigDecimal("4000")).period(BudgetPeriod.MONTHLY).startDate(start).endDate(end).build(),
            Budget.builder().user(user).category(eduCat).limitAmount(new BigDecimal("6000")).period(BudgetPeriod.MONTHLY).startDate(start).endDate(end).build()
        );
        budgetRepository.saveAll(budgets);
    }

    private void seedTransactions(User user) {
        Category salCat = categoryRepository.findByNameIgnoreCase("Salary").orElseThrow();
        Category rentCat = categoryRepository.findByNameIgnoreCase("Rent").orElseThrow();
        Category foodCat = categoryRepository.findByNameIgnoreCase("Food").orElseThrow();
        Category shopCat = categoryRepository.findByNameIgnoreCase("Shopping").orElseThrow();
        Category fuelCat = categoryRepository.findByNameIgnoreCase("Fuel").orElseThrow();
        Category eduCat = categoryRepository.findByNameIgnoreCase("Education").orElseThrow();
        Category medCat = categoryRepository.findByNameIgnoreCase("Medical").orElseThrow();
        Category netCat = categoryRepository.findByNameIgnoreCase("Internet").orElseThrow();
        Category elecCat = categoryRepository.findByNameIgnoreCase("Electricity").orElseThrow();
        Category entCat = categoryRepository.findByNameIgnoreCase("Entertainment").orElseThrow();

        LocalDate now = LocalDate.now();

        List<Transaction> transactions = List.of(
            // Salary
            Transaction.builder().user(user).category(salCat).amount(new BigDecimal("75000")).type(TransactionType.INCOME).date(now.withDayOfMonth(1)).description("Tech Corp Monthly Salary").build(),
            // Expenses
            Transaction.builder().user(user).category(rentCat).amount(new BigDecimal("15000")).type(TransactionType.EXPENSE).date(now.withDayOfMonth(1)).description("Monthly Apartment Rent").build(),
            Transaction.builder().user(user).category(foodCat).amount(new BigDecimal("6500")).type(TransactionType.EXPENSE).date(now.withDayOfMonth(2)).description("Gourmet Dine-in & Groceries").build(),
            Transaction.builder().user(user).category(shopCat).amount(new BigDecimal("5800")).type(TransactionType.EXPENSE).date(now.withDayOfMonth(2)).description("Summer Apparel clothing").build(),
            Transaction.builder().user(user).category(fuelCat).amount(new BigDecimal("2800")).type(TransactionType.EXPENSE).date(now.withDayOfMonth(2)).description("Petrol refill").build(),
            Transaction.builder().user(user).category(eduCat).amount(new BigDecimal("4500")).type(TransactionType.EXPENSE).date(now.withDayOfMonth(3)).description("Online Coding Course subscription").build(),
            Transaction.builder().user(user).category(medCat).amount(new BigDecimal("2350")).type(TransactionType.EXPENSE).date(now.withDayOfMonth(3)).description("Pharmacy Prescription bill").build(),
            Transaction.builder().user(user).category(netCat).amount(new BigDecimal("999")).type(TransactionType.EXPENSE).date(now.withDayOfMonth(4)).description("Gigabit Fiber broadband").build(),
            Transaction.builder().user(user).category(elecCat).amount(new BigDecimal("1450")).type(TransactionType.EXPENSE).date(now.withDayOfMonth(4)).description("Utility Board Power invoice").build(),
            Transaction.builder().user(user).category(entCat).amount(new BigDecimal("1800")).type(TransactionType.EXPENSE).date(now.withDayOfMonth(4)).description("Cinematic Movie tickets").build()
        );
        transactionRepository.saveAll(transactions);
    }
}
