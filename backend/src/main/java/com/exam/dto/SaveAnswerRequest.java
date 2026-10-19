package com.exam.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveAnswerRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    private Long selectedOptionId; // Nullable if clearing answer

    private Boolean isMarkedForReview;
}
