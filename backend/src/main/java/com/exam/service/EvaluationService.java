package com.exam.service;

import com.exam.dto.OptionResponse;
import com.exam.dto.ResultResponse;
import com.exam.entity.*;
import com.exam.enums.AttemptStatus;
import com.exam.exception.BadRequestException;
import com.exam.exception.ResourceNotFoundException;
import com.exam.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final ExamAttemptRepository attemptRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final QuestionRepository questionRepository;
    private final ResultRepository resultRepository;
    private final UserRepository userRepository;

    @Transactional
    public ResultResponse submitAndEvaluate(Long attemptId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized attempt submission");
        }

        if (attempt.getStatus() == AttemptStatus.SUBMITTED) {
            // Idempotent: If already submitted, return the existing result!
            return resultRepository.findByAttemptId(attemptId)
                    .map(r -> mapToResultResponse(r, true))
                    .orElseThrow(() -> new BadRequestException("Attempt already submitted"));
        }

        Exam exam = attempt.getExam();
        LocalDateTime now = LocalDateTime.now();

        // Mark attempt as submitted
        attempt.setSubmitTime(now);
        attempt.setStatus(AttemptStatus.SUBMITTED);
        attemptRepository.save(attempt);

        // Fetch all questions and student answers
        List<Question> questions = questionRepository.findByExamIdOrderByOrderNumAsc(exam.getId());
        List<StudentAnswer> answers = studentAnswerRepository.findByAttemptId(attemptId);

        Map<Long, StudentAnswer> answerMap = answers.stream()
                .collect(Collectors.toMap(ans -> ans.getQuestion().getId(), ans -> ans, (a1, a2) -> a1));

        int totalQuestions = questions.size();
        int attemptedCount = 0;
        int correctCount = 0;
        int wrongCount = 0;
        double totalMarksObtained = 0.0;
        double totalExamMarks = exam.getTotalMarks().doubleValue();

        for (Question question : questions) {
            StudentAnswer studentAns = answerMap.get(question.getId());

            // Find the correct option for this question from the server DB
            Option correctOption = question.getOptions().stream()
                    .filter(opt -> Boolean.TRUE.equals(opt.getIsCorrect()))
                    .findFirst()
                    .orElse(null);

            if (studentAns != null && studentAns.getSelectedOption() != null) {
                attemptedCount++;
                if (correctOption != null && correctOption.getId().equals(studentAns.getSelectedOption().getId())) {
                    correctCount++;
                    totalMarksObtained += question.getMarks();
                } else {
                    wrongCount++;
                }
            }
        }

        double percentage = totalExamMarks > 0 ? (totalMarksObtained / totalExamMarks) * 100.0 : 0.0;
        percentage = Math.round(percentage * 100.0) / 100.0; // 2 decimal places

        boolean isPassed = totalMarksObtained >= exam.getPassMarks();

        Result result = Result.builder()
                .attempt(attempt)
                .totalQuestions(totalQuestions)
                .attemptedQuestions(attemptedCount)
                .correctAnswers(correctCount)
                .wrongAnswers(wrongCount)
                .totalMarksObtained(totalMarksObtained)
                .totalExamMarks(totalExamMarks)
                .percentage(percentage)
                .isPassed(isPassed)
                .build();

        Result savedResult = resultRepository.save(result);
        return mapToResultResponse(savedResult, true);
    }

    @Transactional(readOnly = true)
    public ResultResponse getResultByAttemptId(Long attemptId, String userEmail, boolean isAdmin) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Result result = resultRepository.findByAttemptId(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found for attempt id: " + attemptId));

        if (!isAdmin && !result.getAttempt().getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to result");
        }

        return mapToResultResponse(result, true);
    }

    @Transactional(readOnly = true)
    public List<ResultResponse> getStudentResults(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return resultRepository.findByUserId(user.getId()).stream()
                .map(r -> mapToResultResponse(r, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResultResponse> getExamResultsForAdmin(Long examId) {
        return resultRepository.findByExamIdOrderByTotalMarksObtainedDesc(examId).stream()
                .map(r -> mapToResultResponse(r, false))
                .collect(Collectors.toList());
    }

    public ResultResponse mapToResultResponse(Result result, boolean includeReview) {
        ExamAttempt attempt = result.getAttempt();
        Exam exam = attempt.getExam();
        User student = attempt.getUser();

        int unattempted = result.getTotalQuestions() - result.getAttemptedQuestions();

        List<ResultResponse.QuestionReviewDto> reviews = new ArrayList<>();
        if (includeReview) {
            List<Question> questions = questionRepository.findByExamIdOrderByOrderNumAsc(exam.getId());
            List<StudentAnswer> answers = studentAnswerRepository.findByAttemptId(attempt.getId());
            Map<Long, Long> selectedMap = answers.stream()
                    .filter(a -> a.getSelectedOption() != null)
                    .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a.getSelectedOption().getId(), (k1, k2) -> k1));

            for (Question q : questions) {
                Long selectedOptId = selectedMap.get(q.getId());
                Option correctOpt = q.getOptions().stream()
                        .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                        .findFirst()
                        .orElse(null);

                Long correctOptId = correctOpt != null ? correctOpt.getId() : null;
                boolean isCorrect = selectedOptId != null && selectedOptId.equals(correctOptId);

                List<OptionResponse> optDtos = q.getOptions().stream()
                        .map(o -> OptionResponse.builder()
                                .id(o.getId())
                                .optionText(o.getOptionText())
                                .isCorrect(o.getIsCorrect())
                                .build())
                        .collect(Collectors.toList());

                reviews.add(ResultResponse.QuestionReviewDto.builder()
                        .questionId(q.getId())
                        .questionText(q.getQuestionText())
                        .marks(q.getMarks())
                        .selectedOptionId(selectedOptId)
                        .correctOptionId(correctOptId)
                        .isCorrect(isCorrect)
                        .options(optDtos)
                        .build());
            }
        }

        return ResultResponse.builder()
                .resultId(result.getId())
                .attemptId(attempt.getId())
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .subject(exam.getSubject())
                .studentName(student.getFullName())
                .studentEmail(student.getEmail())
                .totalQuestions(result.getTotalQuestions())
                .attemptedQuestions(result.getAttemptedQuestions())
                .unattemptedQuestions(unattempted)
                .correctAnswers(result.getCorrectAnswers())
                .wrongAnswers(result.getWrongAnswers())
                .totalMarksObtained(result.getTotalMarksObtained())
                .totalExamMarks(result.getTotalExamMarks())
                .percentage(result.getPercentage())
                .isPassed(result.getIsPassed())
                .evaluatedAt(result.getEvaluatedAt())
                .reviewList(reviews)
                .build();
    }
}
