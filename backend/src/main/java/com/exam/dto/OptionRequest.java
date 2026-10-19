package com.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionRequest {
    private Long id;

    @NotBlank(message = "Option text is required")
    private String optionText;

    @NotNull(message = "isCorrect flag is required")
    private Boolean isCorrect;
}
