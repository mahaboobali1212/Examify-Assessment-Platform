package com.exam.service;

import com.exam.dto.AttemptStartResponse;
import com.exam.dto.SaveAnswerRequest;
import com.exam.dto.StudentAnswerResponse;
import com.exam.dto.StudentOptionResponse;
import com.exam.dto.StudentQuestionResponse;
import com.exam.entity.*;
import com.exam.enums.AttemptStatus;
import com.exam.exception.BadRequestException;
import com.exam.exception.ResourceNotFoundException;
import com.exam.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttemptService {

    private final ExamRepository examRepository;
    private final ExamAttemptRepository attemptRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final UserRepository userRepository;

    @Transactional
    public AttemptStartResponse startOrResumeExam(Long examId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        if (!Boolean.TRUE.equals(exam.getIsPublished())) {
            throw new BadRequestException("This examination is not published yet");
        }

        LocalDateTime now = LocalDateTime.now();
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
            throw new BadRequestException("Examination has not started yet. Starts at: " + exam.getStartTime());
        }
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
            throw new BadRequestException("Examination schedule has closed. Closed at: " + exam.getEndTime());
        }

        // 1. Check if user already has an IN_PROGRESS attempt (Resume it)
        Optional<ExamAttempt> activeAttempt = attemptRepository.findFirstByUserIdAndExamIdAndStatus(
                user.getId(), exam.getId(), AttemptStatus.IN_PROGRESS);

        if (activeAttempt.isPresent()) {
            ExamAttempt attempt = activeAttempt.get();
            // Check if timer expired in background
            if (now.isAfter(attempt.getMaxEndTime())) {
                attempt.setStatus(AttemptStatus.EXPIRED);
                attemptRepository.save(attempt);
                throw new BadRequestException("Your previous exam attempt has expired");
            }
            return buildAttemptResponse(attempt, exam);
        }

        // 2. Check maximum allowed attempts
        long completedAttempts = attemptRepository.countByUserIdAndExamId(user.getId(), exam.getId());
        if (exam.getAllowedAttempts() != null && exam.getAllowedAttempts() > 0 && completedAttempts >= exam.getAllowedAttempts()) {
            throw new BadRequestException("You have already reached the maximum attempts (" + exam.getAllowedAttempts() + ") for this exam.");
        }

        // 3. Create new attempt
        // Grace period of 30 seconds for network latency
        LocalDateTime maxEndTime = now.plusMinutes(exam.getDurationMinutes()).plusSeconds(30);

        ExamAttempt newAttempt = ExamAttempt.builder()
                .user(user)
                .exam(exam)
                .startTime(now)
                .maxEndTime(maxEndTime)
                .status(AttemptStatus.IN_PROGRESS)
                .build();

        ExamAttempt savedAttempt = attemptRepository.save(newAttempt);
        return buildAttemptResponse(savedAttempt, exam);
    }

    @Transactional
    public void saveAnswer(Long attemptId, SaveAnswerRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized attempt access");
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Cannot save answer. Attempt status is " + attempt.getStatus());
        }

        // Strict Server-Side Timer check
        if (LocalDateTime.now().isAfter(attempt.getMaxEndTime())) {
            attempt.setStatus(AttemptStatus.EXPIRED);
            attemptRepository.save(attempt);
            throw new BadRequestException("Exam time limit has expired. Submission locked.");
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + request.getQuestionId()));

        Option selectedOption = null;
        if (request.getSelectedOptionId() != null) {
            selectedOption = optionRepository.findById(request.getSelectedOptionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Option not found with id: " + request.getSelectedOptionId()));

            if (!selectedOption.getQuestion().getId().equals(question.getId())) {
                throw new BadRequestException("Option does not belong to the question");
            }
        }

        Optional<StudentAnswer> existingAnswer = studentAnswerRepository.findByAttemptIdAndQuestionId(attemptId, question.getId());

        StudentAnswer answer;
        if (existingAnswer.isPresent()) {
            answer = existingAnswer.get();
            answer.setSelectedOption(selectedOption);
            if (request.getIsMarkedForReview() != null) {
                answer.setIsMarkedForReview(request.getIsMarkedForReview());
            }
        } else {
            answer = StudentAnswer.builder()
                    .attempt(attempt)
                    .question(question)
                    .selectedOption(selectedOption)
                    .isMarkedForReview(Boolean.TRUE.equals(request.getIsMarkedForReview()))
                    .build();
        }

        studentAnswerRepository.save(answer);
    }

    @Transactional(readOnly = true)
    public AttemptStartResponse getActiveAttempt(Long attemptId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized attempt access");
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Attempt is not currently in progress: " + attempt.getStatus());
        }

        return buildAttemptResponse(attempt, attempt.getExam());
    }

    private AttemptStartResponse buildAttemptResponse(ExamAttempt attempt, Exam exam) {
        LocalDateTime now = LocalDateTime.now();
        long remainingSeconds = Math.max(0, Duration.between(now, attempt.getMaxEndTime()).getSeconds());

        // Zero-Knowledge Questions preparation: strip isCorrect
        List<Question> questions = questionRepository.findByExamIdOrderByOrderNumAsc(exam.getId());

        if (Boolean.TRUE.equals(exam.getRandomizeQuestions())) {
            questions = new ArrayList<>(questions);
            Collections.shuffle(questions);
        }

        List<StudentQuestionResponse> studentQuestions = questions.stream()
                .map(q -> {
                    List<StudentOptionResponse> studentOpts = q.getOptions().stream()
                            .map(o -> StudentOptionResponse.builder()
                                    .id(o.getId())
                                    .optionText(o.getOptionText())
                                    .build())
                            .collect(Collectors.toList());

                    return StudentQuestionResponse.builder()
                            .id(q.getId())
                            .questionText(q.getQuestionText())
                            .marks(q.getMarks())
                            .difficulty(q.getDifficulty())
                            .orderNum(q.getOrderNum())
                            .options(studentOpts)
                            .build();
                })
                .collect(Collectors.toList());

        // Previously saved answers for this attempt (Session Recovery)
        List<StudentAnswerResponse> savedAnswers = studentAnswerRepository.findByAttemptId(attempt.getId()).stream()
                .map(ans -> StudentAnswerResponse.builder()
                        .questionId(ans.getQuestion().getId())
                        .selectedOptionId(ans.getSelectedOption() != null ? ans.getSelectedOption().getId() : null)
                        .isMarkedForReview(ans.getIsMarkedForReview())
                        .build())
                .collect(Collectors.toList());

        return AttemptStartResponse.builder()
                .attemptId(attempt.getId())
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .subject(exam.getSubject())
                .durationMinutes(exam.getDurationMinutes())
                .totalMarks(exam.getTotalMarks())
                .passMarks(exam.getPassMarks())
                .startTime(attempt.getStartTime())
                .maxEndTime(attempt.getMaxEndTime())
                .remainingSeconds(remainingSeconds)
                .questions(studentQuestions)
                .savedAnswers(savedAnswers)
                .build();
    }
}
