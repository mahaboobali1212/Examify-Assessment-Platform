package com.exam.repository;

import com.exam.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
    Optional<Result> findByAttemptId(Long attemptId);
    
    @Query("SELECT r FROM Result r WHERE r.attempt.user.id = :userId ORDER BY r.evaluatedAt DESC")
    List<Result> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT r FROM Result r WHERE r.attempt.exam.id = :examId ORDER BY r.totalMarksObtained DESC")
    List<Result> findByExamIdOrderByTotalMarksObtainedDesc(@Param("examId") Long examId);

    @Query("SELECT AVG(r.percentage) FROM Result r WHERE r.attempt.exam.id = :examId")
    Double getAveragePercentageByExamId(@Param("examId") Long examId);

    @Query("SELECT COUNT(r) FROM Result r WHERE r.attempt.exam.id = :examId AND r.isPassed = true")
    long countPassedByExamId(@Param("examId") Long examId);
}
