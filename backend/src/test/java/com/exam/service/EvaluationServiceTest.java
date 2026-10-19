package com.exam.service;

import com.exam.dto.ResultResponse;
import com.exam.entity.*;
import com.exam.enums.AttemptStatus;
import com.exam.enums.DifficultyLevel;
import com.exam.enums.RoleName;
import com.exam.repository.ExamAttemptRepository;
import com.exam.repository.QuestionRepository;
import com.exam.repository.ResultRepository;
import com.exam.repository.StudentAnswerRepository;
import com.exam.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EvaluationServiceTest {

    @Mock
    private ExamAttemptRepository attemptRepository;

    @Mock
    private StudentAnswerRepository studentAnswerRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private ResultRepository resultRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EvaluationService evaluationService;

    private User student;
    private Exam exam;
    private ExamAttempt attempt;
    private Question question1;
    private Option opt1Correct;
    private Option opt2Wrong;

    @BeforeEach
    void setUp() {
        student = User.builder()
                .id(10L)
                .email("student@exam.com")
                .fullName("Jane Student")
                .role(RoleName.ROLE_STUDENT)
                .build();

        exam = Exam.builder()
                .id(100L)
                .title("Java Basics")
                .subject("Computer Science")
                .durationMinutes(30)
                .totalMarks(20)
                .passMarks(10)
                .build();

        attempt = ExamAttempt.builder()
                .id(500L)
                .user(student)
                .exam(exam)
                .startTime(LocalDateTime.now().minusMinutes(10))
                .maxEndTime(LocalDateTime.now().plusMinutes(20))
                .status(AttemptStatus.IN_PROGRESS)
                .build();

        opt1Correct = Option.builder().id(1L).optionText("Correct A").isCorrect(true).build();
        opt2Wrong = Option.builder().id(2L).optionText("Wrong B").isCorrect(false).build();

        question1 = Question.builder()
                .id(1001L)
                .exam(exam)
                .questionText("What is 2 + 2?")
                .marks(10)
                .difficulty(DifficultyLevel.EASY)
                .orderNum(1)
                .options(new ArrayList<>(List.of(opt1Correct, opt2Wrong)))
                .build();
    }

    @Test
    @DisplayName("Should accurately evaluate correct answer, award marks, and mark as PASSED")
    void testEvaluationPassed() {
        when(userRepository.findByEmail("student@exam.com")).thenReturn(Optional.of(student));
        when(attemptRepository.findById(500L)).thenReturn(Optional.of(attempt));
        when(questionRepository.findByExamIdOrderByOrderNumAsc(100L)).thenReturn(List.of(question1));

        StudentAnswer answer = StudentAnswer.builder()
                .attempt(attempt)
                .question(question1)
                .selectedOption(opt1Correct)
                .build();

        when(studentAnswerRepository.findByAttemptId(500L)).thenReturn(List.of(answer));

        Result mockSavedResult = Result.builder()
                .id(999L)
                .attempt(attempt)
                .totalQuestions(1)
                .attemptedQuestions(1)
                .correctAnswers(1)
                .wrongAnswers(0)
                .totalMarksObtained(10.0)
                .totalExamMarks(20.0)
                .percentage(50.0)
                .isPassed(true)
                .evaluatedAt(LocalDateTime.now())
                .build();

        when(resultRepository.save(any(Result.class))).thenReturn(mockSavedResult);

        ResultResponse response = evaluationService.submitAndEvaluate(500L, "student@exam.com");

        assertNotNull(response);
        assertEquals(AttemptStatus.SUBMITTED, attempt.getStatus());
        assertEquals(1, response.getCorrectAnswers());
        assertEquals(10.0, response.getTotalMarksObtained());
        assertTrue(response.getIsPassed());
        verify(resultRepository, times(1)).save(any(Result.class));
    }

    @Test
    @DisplayName("Should evaluate wrong answer, award 0 marks, and mark as FAILED")
    void testEvaluationFailed() {
        when(userRepository.findByEmail("student@exam.com")).thenReturn(Optional.of(student));
        when(attemptRepository.findById(500L)).thenReturn(Optional.of(attempt));
        when(questionRepository.findByExamIdOrderByOrderNumAsc(100L)).thenReturn(List.of(question1));

        StudentAnswer answer = StudentAnswer.builder()
                .attempt(attempt)
                .question(question1)
                .selectedOption(opt2Wrong)
                .build();

        when(studentAnswerRepository.findByAttemptId(500L)).thenReturn(List.of(answer));

        Result mockSavedResult = Result.builder()
                .id(999L)
                .attempt(attempt)
                .totalQuestions(1)
                .attemptedQuestions(1)
                .correctAnswers(0)
                .wrongAnswers(1)
                .totalMarksObtained(0.0)
                .totalExamMarks(20.0)
                .percentage(0.0)
                .isPassed(false)
                .evaluatedAt(LocalDateTime.now())
                .build();

        when(resultRepository.save(any(Result.class))).thenReturn(mockSavedResult);

        ResultResponse response = evaluationService.submitAndEvaluate(500L, "student@exam.com");

        assertNotNull(response);
        assertEquals(0, response.getCorrectAnswers());
        assertEquals(1, response.getWrongAnswers());
        assertEquals(0.0, response.getTotalMarksObtained());
        assertFalse(response.getIsPassed());
    }
}
