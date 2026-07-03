package com.fintrack.repository;

import com.fintrack.entity.Goal;
import com.fintrack.entity.GoalStatus;
import com.fintrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUser(User user);
    List<Goal> findByUserAndStatus(User user, GoalStatus status);
}
