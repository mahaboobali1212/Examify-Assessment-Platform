package com.exam.service;

import com.exam.dto.OptionRequest;
import com.exam.dto.OptionResponse;
import com.exam.dto.QuestionRequest;
import com.exam.dto.QuestionResponse;
import com.exam.entity.Exam;
import com.exam.entity.Option;
import com.exam.entity.Question;
import com.exam.exception.BadRequestException;
import com.exam.exception.ResourceNotFoundException;
import com.exam.repository.ExamRepository;
import com.exam.repository.OptionRepository;
import com.exam.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final ExamRepository examRepository;
    private final AuditService auditService;

    @Transactional
    public QuestionResponse addQuestionToExam(Long examId, QuestionRequest request, String adminEmail) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        validateOptions(request.getOptions());

        long count = questionRepository.countByExamId(examId);

        Question question = Question.builder()
                .exam(exam)
                .questionText(request.getQuestionText())
                .marks(request.getMarks())
                .difficulty(request.getDifficulty())
                .orderNum(request.getOrderNum() != null ? request.getOrderNum() : (int) count + 1)
                .options(new ArrayList<>())
                .build();

        for (OptionRequest optReq : request.getOptions()) {
            Option option = Option.builder()
                    .question(question)
                    .optionText(optReq.getOptionText())
                    .isCorrect(optReq.getIsCorrect())
                    .build();
            question.getOptions().add(option);
        }

        Question saved = questionRepository.save(question);
        auditService.log(adminEmail, "ADD_QUESTION", "Added question to exam ID: " + examId + " (Q ID: " + saved.getId() + ")");
        return mapToResponse(saved);
    }

    @Transactional
    public QuestionResponse updateQuestion(Long questionId, QuestionRequest request, String adminEmail) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        validateOptions(request.getOptions());

        question.setQuestionText(request.getQuestionText());
        question.setMarks(request.getMarks());
        question.setDifficulty(request.getDifficulty());
        if (request.getOrderNum() != null) {
            question.setOrderNum(request.getOrderNum());
        }

        // Clear existing options and re-add
        question.getOptions().clear();
        for (OptionRequest optReq : request.getOptions()) {
            Option option = Option.builder()
                    .question(question)
                    .optionText(optReq.getOptionText())
                    .isCorrect(optReq.getIsCorrect())
                    .build();
            question.getOptions().add(option);
        }

        Question updated = questionRepository.save(question);
        auditService.log(adminEmail, "UPDATE_QUESTION", "Updated question ID: " + questionId);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteQuestion(Long questionId, String adminEmail) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));
        questionRepository.delete(question);
        auditService.log(adminEmail, "DELETE_QUESTION", "Deleted question ID: " + questionId);
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestionsByExamId(Long examId) {
        if (!examRepository.existsById(examId)) {
            throw new ResourceNotFoundException("Exam not found with id: " + examId);
        }
        return questionRepository.findByExamIdOrderByOrderNumAsc(examId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void validateOptions(List<OptionRequest> options) {
        if (options == null || options.size() != 4) {
            throw new BadRequestException("Exactly four options must be provided for a multiple-choice question");
        }

        long correctCount = options.stream().filter(o -> Boolean.TRUE.equals(o.getIsCorrect())).count();
        if (correctCount != 1) {
            throw new BadRequestException("Exactly one option must be marked as correct. Found: " + correctCount);
        }
    }

    public QuestionResponse mapToResponse(Question question) {
        List<OptionResponse> optionResponses = question.getOptions().stream()
                .map(opt -> OptionResponse.builder()
                        .id(opt.getId())
                        .optionText(opt.getOptionText())
                        .isCorrect(opt.getIsCorrect())
                        .build())
                .collect(Collectors.toList());

        return QuestionResponse.builder()
                .id(question.getId())
                .examId(question.getExam().getId())
                .questionText(question.getQuestionText())
                .marks(question.getMarks())
                .difficulty(question.getDifficulty())
                .orderNum(question.getOrderNum())
                .options(optionResponses)
                .build();
    }
}
