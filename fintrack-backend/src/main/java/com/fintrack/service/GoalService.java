package com.fintrack.service;

import com.fintrack.dto.GoalRequest;
import com.fintrack.entity.Goal;
import com.fintrack.entity.GoalStatus;
import com.fintrack.entity.User;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.repository.GoalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserService userService;

    public GoalService(GoalRepository goalRepository, UserService userService) {
        this.goalRepository = goalRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<Goal> getGoals() {
        User user = userService.getCurrentUser();
        return goalRepository.findByUser(user);
    }

    @Transactional
    public Goal createGoal(GoalRequest request) {
        User user = userService.getCurrentUser();
        BigDecimal current = request.getCurrentAmount() != null ? request.getCurrentAmount() : BigDecimal.ZERO;

        Goal goal = Goal.builder()
                .user(user)
                .name(request.getName())
                .targetAmount(request.getTargetAmount())
                .currentAmount(current)
                .targetDate(request.getTargetDate())
                .status(current.compareTo(request.getTargetAmount()) >= 0 ? GoalStatus.COMPLETED : GoalStatus.IN_PROGRESS)
                .build();

        return goalRepository.save(goal);
    }

    @Transactional
    public Goal contributeToGoal(Long id, BigDecimal amount) {
        User user = userService.getCurrentUser();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + id));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this goals record.");
        }

        BigDecimal newCurrent = goal.getCurrentAmount().add(amount);
        goal.setCurrentAmount(newCurrent);

        if (newCurrent.compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(GoalStatus.COMPLETED);
        } else {
            goal.setStatus(GoalStatus.IN_PROGRESS);
        }

        return goalRepository.save(goal);
    }

    @Transactional
    public void deleteGoal(Long id) {
        User user = userService.getCurrentUser();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + id));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this goals record.");
        }

        goalRepository.delete(goal);
    }
}
