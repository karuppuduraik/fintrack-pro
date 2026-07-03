package com.fintrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetStatusDTO {
    private Long id;
    private String category;
    private BigDecimal limitAmount;
    private BigDecimal spent;
    private String period;
    private String colorCode;
}
