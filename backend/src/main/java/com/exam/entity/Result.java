package com.exam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false, unique = true)
    private ExamAttempt attempt;

    @Column(nullable = false)
    private Integer totalQuestions;

    @Column(nullable = false)
    private Integer attemptedQuestions;

    @Column(nullable = false)
    private Integer correctAnswers;

    @Column(nullable = false)
    private Integer wrongAnswers;

    @Column(nullable = false)
    private Double totalMarksObtained;

    @Column(nullable = false)
    private Double totalExamMarks;

    @Column(nullable = false)
    private Double percentage;

    @Column(nullable = false)
    private Boolean isPassed;

    private LocalDateTime evaluatedAt;

    @PrePersist
    protected void onEvaluate() {
        this.evaluatedAt = LocalDateTime.now();
    }
}
