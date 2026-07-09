package com.fintrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal savings;
    private BigDecimal balance;
    private List<CategoryBreakdownDTO> categoryBreakdown;
    private List<CashFlowChartDTO> cashFlowTrend;
}
