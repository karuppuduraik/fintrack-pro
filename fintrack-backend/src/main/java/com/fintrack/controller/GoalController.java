package com.fintrack.controller;

import com.fintrack.dto.GoalRequest;
import com.fintrack.dto.MessageResponse;
import com.fintrack.entity.Goal;
import com.fintrack.service.GoalService;
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
@RequestMapping("/api/goals")
@Tag(name = "Goals", description = "Savings and financial targets management APIs")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    @Operation(summary = "Get user savings goals list")
    public ResponseEntity<List<Goal>> getGoals() {
        return ResponseEntity.ok(goalService.getGoals());
    }

    @PostMapping
    @Operation(summary = "Publish a new savings target goal")
    public ResponseEntity<Goal> createGoal(@Valid @RequestBody GoalRequest request) {
        return ResponseEntity.ok(goalService.createGoal(request));
    }

    @PutMapping("/{id}/contribute")
    @Operation(summary = "Verify and add savings contribution amount to target goal")
    public ResponseEntity<Goal> contributeToGoal(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> payload) {
        BigDecimal amount = payload.get("amount");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Contribution amount must be positive");
        }
        return ResponseEntity.ok(goalService.contributeToGoal(id, amount));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete savings target goal")
    public ResponseEntity<MessageResponse> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.ok(new MessageResponse("Savings target deleted successfully!"));
    }
}
