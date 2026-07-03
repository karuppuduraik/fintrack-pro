package com.fintrack.repository;

import com.fintrack.entity.Category;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.TransactionType;
import com.fintrack.entity.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByUser(User user, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user " +
           "AND (:search IS NULL OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.category.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:categoryName IS NULL OR LOWER(t.category.name) = LOWER(:categoryName))")
    Page<Transaction> searchTransactions(
            @Param("user") User user,
            @Param("search") String search,
            @Param("type") TransactionType type,
            @Param("categoryName") String categoryName,
            Pageable pageable
    );

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.date BETWEEN :start AND :end")
    BigDecimal sumAmountByUserAndTypeAndDateBetween(
            @Param("user") User user,
            @Param("type") TransactionType type,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.category = :category AND t.date BETWEEN :start AND :end")
    BigDecimal sumAmountByUserAndTypeAndCategoryAndDateBetween(
            @Param("user") User user,
            @Param("type") TransactionType type,
            @Param("category") Category category,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    @Query("SELECT t.category.name, SUM(t.amount), t.category.colorCode FROM Transaction t " +
           "WHERE t.user = :user AND t.type = :type AND t.date BETWEEN :start AND :end " +
           "GROUP BY t.category.name, t.category.colorCode")
    List<Object[]> sumAmountByUserAndTypeAndDateBetweenGroupByCategory(
            @Param("user") User user,
            @Param("type") TransactionType type,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    List<Transaction> findByUserAndDateBetweenOrderByDateDesc(User user, LocalDate start, LocalDate end);
}
