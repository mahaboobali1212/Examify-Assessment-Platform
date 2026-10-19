package com.exam.service;

import com.exam.dto.ExamRequest;
import com.exam.dto.ExamResponse;
import com.exam.entity.Exam;
import com.exam.entity.User;
import com.exam.exception.BadRequestException;
import com.exam.exception.ResourceNotFoundException;
import com.exam.repository.ExamAttemptRepository;
import com.exam.repository.ExamRepository;
import com.exam.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamAttemptRepository attemptRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional
    public ExamResponse createExam(ExamRequest request, String adminEmail) {
        if (request.getPassMarks() > request.getTotalMarks()) {
            throw new BadRequestException("Pass marks cannot be greater than total marks");
        }

        Exam exam = Exam.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .subject(request.getSubject())
                .durationMinutes(request.getDurationMinutes())
                .totalMarks(request.getTotalMarks())
                .passMarks(request.getPassMarks())
                .isPublished(request.getIsPublished() != null ? request.getIsPublished() : false)
                .randomizeQuestions(request.getRandomizeQuestions() != null ? request.getRandomizeQuestions() : false)
                .allowedAttempts(request.getAllowedAttempts() != null ? request.getAllowedAttempts() : 1)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();

        Exam saved = examRepository.save(exam);
        auditService.log(adminEmail, "CREATE_EXAM", "Created exam: " + saved.getTitle() + " (ID: " + saved.getId() + ")");
        return mapToResponse(saved);
    }

    @Transactional
    public ExamResponse updateExam(Long id, ExamRequest request, String adminEmail) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));

        if (request.getPassMarks() > request.getTotalMarks()) {
            throw new BadRequestException("Pass marks cannot be greater than total marks");
        }

        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setSubject(request.getSubject());
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setTotalMarks(request.getTotalMarks());
        exam.setPassMarks(request.getPassMarks());
        exam.setIsPublished(request.getIsPublished());
        exam.setRandomizeQuestions(request.getRandomizeQuestions());
        exam.setAllowedAttempts(request.getAllowedAttempts());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());

        Exam updated = examRepository.save(exam);
        auditService.log(adminEmail, "UPDATE_EXAM", "Updated exam ID: " + id + " (" + updated.getTitle() + ")");
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteExam(Long id, String adminEmail) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        examRepository.delete(exam);
        auditService.log(adminEmail, "DELETE_EXAM", "Deleted exam ID: " + id + " (" + exam.getTitle() + ")");
    }

    @Transactional(readOnly = true)
    public ExamResponse getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        return mapToResponse(exam);
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> getAllExams() {
        return examRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> getPublishedExamsForStudent(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return examRepository.findByIsPublishedTrueOrderByCreatedAtDesc().stream()
                .map(exam -> {
                    ExamResponse response = mapToResponse(exam);
                    long userAttempts = attemptRepository.countByUserIdAndExamId(student.getId(), exam.getId());
                    response.setTotalAttempts(userAttempts);
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ExamResponse togglePublish(Long id, String adminEmail) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));

        boolean newStatus = !Boolean.TRUE.equals(exam.getIsPublished());
        exam.setIsPublished(newStatus);
        Exam updated = examRepository.save(exam);

        auditService.log(adminEmail, "TOGGLE_PUBLISH", "Exam ID " + id + " published status changed to: " + newStatus);
        return mapToResponse(updated);
    }

    public ExamResponse mapToResponse(Exam exam) {
        long attemptsCount = attemptRepository.countByExamId(exam.getId());
        return ExamResponse.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .description(exam.getDescription())
                .subject(exam.getSubject())
                .durationMinutes(exam.getDurationMinutes())
                .totalMarks(exam.getTotalMarks())
                .passMarks(exam.getPassMarks())
                .isPublished(exam.getIsPublished())
                .randomizeQuestions(exam.getRandomizeQuestions())
                .allowedAttempts(exam.getAllowedAttempts())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .questionCount(exam.getQuestions() != null ? exam.getQuestions().size() : 0)
                .totalAttempts(attemptsCount)
                .createdAt(exam.getCreatedAt())
                .build();
    }
}
