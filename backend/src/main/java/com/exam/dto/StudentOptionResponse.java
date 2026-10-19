package com.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Strips isCorrect so students cannot inspect network tab to cheat.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentOptionResponse {
    private Long id;
    private String optionText;
}
