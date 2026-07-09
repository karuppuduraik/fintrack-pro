package com.fintrack.controller;

import com.fintrack.dto.MessageResponse;
import com.fintrack.dto.TransactionRequest;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.TransactionType;
import com.fintrack.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/transactions")
@Tag(name = "Transactions", description = "Transaction management APIs")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    @Operation(summary = "Get paginated, filtered transaction ledger")
    public ResponseEntity<Page<Transaction>> getTransactions(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "type", required = false) TransactionType type,
            @RequestParam(name = "category", required = false, defaultValue = "ALL") String category,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "date") String sortBy,
            @RequestParam(name = "sortDir", defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Transaction> transactions = transactionService.getTransactions(search, type, category, pageable);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    @Operation(summary = "Log a new transaction")
    public ResponseEntity<Transaction> createTransaction(@Valid @RequestBody TransactionRequest request) {
        Transaction transaction = transactionService.createTransaction(request);
        return ResponseEntity.ok(transaction);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modify a transaction record")
    public ResponseEntity<Transaction> updateTransaction(
            @PathVariable("id") Long id,
            @Valid @RequestBody TransactionRequest request) {
        Transaction transaction = transactionService.updateTransaction(id, request);
        return ResponseEntity.ok(transaction);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove a transaction record")
    public ResponseEntity<MessageResponse> deleteTransaction(@PathVariable("id") Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok(new MessageResponse("Transaction deleted successfully!"));
    }
}
