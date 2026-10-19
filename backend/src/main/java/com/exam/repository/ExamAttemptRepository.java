package com.exam.repository;

import com.exam.entity.ExamAttempt;
import com.exam.enums.AttemptStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    List<ExamAttempt> findByUserIdOrderByStartTimeDesc(Long userId);
    List<ExamAttempt> findByExamIdOrderByStartTimeDesc(Long examId);
    List<ExamAttempt> findByUserIdAndExamId(Long userId, Long examId);
    Optional<ExamAttempt> findFirstByUserIdAndExamIdAndStatus(Long userId, Long examId, AttemptStatus status);
    long countByExamId(Long examId);
    long countByUserIdAndExamId(Long userId, Long examId);
}
