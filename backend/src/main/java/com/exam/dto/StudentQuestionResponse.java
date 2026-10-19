package com.exam.dto;

import com.exam.enums.DifficultyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Sanitized Question representation for students during the active examination.
 * Contains only public question text and sanitized options.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentQuestionResponse {
    private Long id;
    private String questionText;
    private Integer marks;
    private DifficultyLevel difficulty;
    private Integer orderNum;
    private List<StudentOptionResponse> options;
}
