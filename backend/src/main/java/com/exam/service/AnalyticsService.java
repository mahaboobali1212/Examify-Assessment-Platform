package com.exam.service;

import com.exam.dto.*;
import com.exam.entity.*;
import com.exam.enums.RoleName;
import com.exam.exception.ResourceNotFoundException;
import com.exam.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final ExamRepository examRepository;
    private final ExamAttemptRepository attemptRepository;
    private final ResultRepository resultRepository;
    private final QuestionRepository questionRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final EvaluationService evaluationService;

    @Transactional(readOnly = true)
    public AdminOverviewAnalytics getAdminOverview() {
        long totalStudents = userRepository.countByRole(RoleName.ROLE_STUDENT);
        long totalExams = examRepository.count();
        long totalAttempts = attemptRepository.count();

        List<Result> allResults = resultRepository.findAll();
        double overallAvg = allResults.stream()
                .mapToDouble(Result::getPercentage)
                .average()
                .orElse(0.0);
        overallAvg = Math.round(overallAvg * 10.0) / 10.0;

        long passedCount = allResults.stream().filter(Result::getIsPassed).count();
        double passRate = allResults.isEmpty() ? 0.0 : ((double) passedCount / allResults.size()) * 100.0;
        passRate = Math.round(passRate * 10.0) / 10.0;

        List<ResultResponse> recent = allResults.stream()
                .sorted((r1, r2) -> r2.getEvaluatedAt().compareTo(r1.getEvaluatedAt()))
                .limit(5)
                .map(r -> evaluationService.mapToResultResponse(r, false))
                .collect(Collectors.toList());

        return AdminOverviewAnalytics.builder()
                .totalStudents(totalStudents)
                .totalExams(totalExams)
                .totalAttempts(totalAttempts)
                .overallAverageScore(overallAvg)
                .overallPassRate(passRate)
                .recentResults(recent)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminExamAnalytics getExamAnalytics(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        List<Result> results = resultRepository.findByExamIdOrderByTotalMarksObtainedDesc(examId);
        long totalAttempts = results.size();

        double avgPercentage = results.stream().mapToDouble(Result::getPercentage).average().orElse(0.0);
        avgPercentage = Math.round(avgPercentage * 10.0) / 10.0;

        double highest = results.stream().mapToDouble(Result::getTotalMarksObtained).max().orElse(0.0);
        double lowest = results.stream().mapToDouble(Result::getTotalMarksObtained).min().orElse(0.0);

        long passCount = results.stream().filter(Result::getIsPassed).count();
        long failCount = totalAttempts - passCount;
        double passRate = totalAttempts > 0 ? ((double) passCount / totalAttempts) * 100.0 : 0.0;
        passRate = Math.round(passRate * 10.0) / 10.0;

        // Question-level accuracy breakdown
        List<Question> questions = questionRepository.findByExamIdOrderByOrderNumAsc(examId);
        List<QuestionAccuracyDto> questionPerf = new ArrayList<>();

        for (Question q : questions) {
            Option correctOpt = q.getOptions().stream()
                    .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                    .findFirst()
                    .orElse(null);

            long qTotalAttempts = 0;
            long qCorrectAttempts = 0;

            for (Result r : results) {
                Optional<StudentAnswer> ans = studentAnswerRepository.findByAttemptIdAndQuestionId(r.getAttempt().getId(), q.getId());
                if (ans.isPresent() && ans.get().getSelectedOption() != null) {
                    qTotalAttempts++;
                    if (correctOpt != null && correctOpt.getId().equals(ans.get().getSelectedOption().getId())) {
                        qCorrectAttempts++;
                    }
                }
            }

            double accuracy = qTotalAttempts > 0 ? ((double) qCorrectAttempts / qTotalAttempts) * 100.0 : 0.0;
            accuracy = Math.round(accuracy * 10.0) / 10.0;

            questionPerf.add(QuestionAccuracyDto.builder()
                    .questionId(q.getId())
                    .questionText(q.getQuestionText())
                    .difficulty(q.getDifficulty())
                    .marks(q.getMarks())
                    .totalAttempts(qTotalAttempts)
                    .correctAttempts(qCorrectAttempts)
                    .accuracyPercentage(accuracy)
                    .build());
        }

        return AdminExamAnalytics.builder()
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .subject(exam.getSubject())
                .totalAttempts(totalAttempts)
                .averagePercentage(avgPercentage)
                .highestScore(highest)
                .lowestScore(lowest)
                .passCount(passCount)
                .failCount(failCount)
                .passRate(passRate)
                .questionPerformance(questionPerf)
                .build();
    }

    @Transactional(readOnly = true)
    public StudentDashboardDto getStudentDashboard(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<Result> results = resultRepository.findByUserId(student.getId());
        long completed = results.size();
        long passed = results.stream().filter(Result::getIsPassed).count();
        long failed = completed - passed;

        double avgPercentage = results.stream().mapToDouble(Result::getPercentage).average().orElse(0.0);
        avgPercentage = Math.round(avgPercentage * 10.0) / 10.0;

        long availableExams = examRepository.findByIsPublishedTrue().size();

        List<ResultResponse> recent = results.stream()
                .limit(5)
                .map(r -> evaluationService.mapToResultResponse(r, false))
                .collect(Collectors.toList());

        return StudentDashboardDto.builder()
                .availableExamsCount(availableExams)
                .completedExamsCount(completed)
                .averagePercentage(avgPercentage)
                .passedCount(passed)
                .failedCount(failed)
                .recentResults(recent)
                .build();
    }

    @Transactional(readOnly = true)
    public String exportExamResultsCsv(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        List<Result> results = resultRepository.findByExamIdOrderByTotalMarksObtainedDesc(examId);

        StringBuilder csv = new StringBuilder();
        csv.append("Attempt ID,Student Name,Student Email,Marks Obtained,Total Marks,Percentage,Pass/Fail Status,Evaluated Date\n");

        for (Result r : results) {
            ExamAttempt attempt = r.getAttempt();
            User student = attempt.getUser();
            csv.append(attempt.getId()).append(",")
                    .append("\"").append(student.getFullName().replace("\"", "\"\"")).append("\",")
                    .append(student.getEmail()).append(",")
                    .append(r.getTotalMarksObtained()).append(",")
                    .append(r.getTotalExamMarks()).append(",")
                    .append(r.getPercentage()).append("%,")
                    .append(r.getIsPassed() ? "PASSED" : "FAILED").append(",")
                    .append(r.getEvaluatedAt()).append("\n");
        }

        return csv.toString();
    }
}
