package com.fintrack.dto;

import com.fintrack.entity.BudgetPeriod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BudgetRequest {
    @NotBlank(message = "Category is required")
    private String categoryName;

    @NotNull(message = "Limit amount is required")
    @Positive(message = "Limit must be greater than zero")
    private BigDecimal limitAmount;

    @NotNull(message = "Budget period is required")
    private BudgetPeriod period;
}
