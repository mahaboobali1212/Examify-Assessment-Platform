package com.exam.dto;

import com.exam.enums.DifficultyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private Long id;
    private Long examId;
    private String questionText;
    private Integer marks;
    private DifficultyLevel difficulty;
    private Integer orderNum;
    private List<OptionResponse> options;
}
