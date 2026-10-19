package com.exam.dto;

import com.exam.enums.DifficultyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionAccuracyDto {
    private Long questionId;
    private String questionText;
    private DifficultyLevel difficulty;
    private Integer marks;
    private long totalAttempts;
    private long correctAttempts;
    private double accuracyPercentage;
}
