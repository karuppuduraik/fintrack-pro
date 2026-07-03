package com.fintrack.service;

import com.fintrack.dto.TransactionRequest;
import com.fintrack.entity.*;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public TransactionService(TransactionRepository transactionRepository,
                              CategoryRepository categoryRepository,
                              UserService userService) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public Page<Transaction> getTransactions(String search, TransactionType type, String category, Pageable pageable) {
        User user = userService.getCurrentUser();
        // Set values to null if 'ALL' passed in filters to trigger wildcard queries
        TransactionType searchType = (type == null) ? null : type;
        String searchCategory = (category == null || "ALL".equalsIgnoreCase(category)) ? null : category;
        String searchTxt = (search == null || search.trim().isEmpty()) ? null : search.trim();

        return transactionRepository.searchTransactions(user, searchTxt, searchType, searchCategory, pageable);
    }

    @Transactional
    public Transaction createTransaction(TransactionRequest request) {
        User user = userService.getCurrentUser();
        
        // Find or create Category
        Category category = categoryRepository.findByNameIgnoreCase(request.getCategoryName())
                .orElseGet(() -> {
                    Category newCat = Category.builder()
                            .name(request.getCategoryName())
                            .type(request.getType())
                            .colorCode(request.getType() == TransactionType.INCOME ? "#10b981" : "#3b82f6")
                            .iconName("Category")
                            .build();
                    return categoryRepository.save(newCat);
                });

        Transaction transaction = Transaction.builder()
                .user(user)
                .category(category)
                .amount(request.getAmount())
                .type(request.getType())
                .date(request.getDate())
                .description(request.getDescription())
                .build();

        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction updateTransaction(Long id, TransactionRequest request) {
        User user = userService.getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        // Verify Ownership
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this transaction record.");
        }

        Category category = categoryRepository.findByNameIgnoreCase(request.getCategoryName())
                .orElseGet(() -> {
                    Category newCat = Category.builder()
                            .name(request.getCategoryName())
                            .type(request.getType())
                            .colorCode(request.getType() == TransactionType.INCOME ? "#10b981" : "#3b82f6")
                            .iconName("Category")
                            .build();
                    return categoryRepository.save(newCat);
                });

        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setCategory(category);
        transaction.setDate(request.getDate());
        transaction.setDescription(request.getDescription());

        return transactionRepository.save(transaction);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        User user = userService.getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        // Verify Ownership
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this transaction record.");
        }

        transactionRepository.delete(transaction);
    }
}
