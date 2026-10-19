package com.exam.dto;

import com.exam.enums.DifficultyLevel;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionRequest {

    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotNull(message = "Marks is required")
    @Min(value = 1, message = "Marks must be at least 1")
    private Integer marks;

    @NotNull(message = "Difficulty level is required")
    private DifficultyLevel difficulty;

    private Integer orderNum;

    @NotNull(message = "Options are required")
    @Size(min = 4, max = 4, message = "Exactly four options are required for multiple-choice questions")
    @Valid
    private List<OptionRequest> options;
}
