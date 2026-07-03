package com.fintrack.controller;

import com.fintrack.dto.BudgetRequest;
import com.fintrack.dto.BudgetStatusDTO;
import com.fintrack.dto.MessageResponse;
import com.fintrack.entity.Budget;
import com.fintrack.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/budgets")
@Tag(name = "Budgets", description = "Category threshold budgeting APIs")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    @Operation(summary = "Get user budget limits")
    public ResponseEntity<List<Budget>> getBudgets() {
        return ResponseEntity.ok(budgetService.getBudgets());
    }

    @GetMapping("/status")
    @Operation(summary = "Get user budgets along with current period expenses tracking")
    public ResponseEntity<List<BudgetStatusDTO>> getBudgetsStatus() {
        return ResponseEntity.ok(budgetService.getBudgetsStatus());
    }

    @PostMapping
    @Operation(summary = "Define category budget limit")
    public ResponseEntity<Budget> createBudget(@Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.createBudget(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modify category budget limit value")
    public ResponseEntity<Budget> updateBudget(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> payload) {
        BigDecimal limitAmount = payload.get("limitAmount");
        if (limitAmount == null || limitAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Limit amount must be positive");
        }
        return ResponseEntity.ok(budgetService.updateBudget(id, limitAmount));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category budget limits")
    public ResponseEntity<MessageResponse> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.ok(new MessageResponse("Budget limits deleted successfully!"));
    }
}
