package com.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAnswerResponse {
    private Long questionId;
    private Long selectedOptionId;
    private Boolean isMarkedForReview;
}
