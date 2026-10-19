package com.exam.config;

import com.exam.entity.Exam;
import com.exam.entity.Option;
import com.exam.entity.Question;
import com.exam.entity.User;
import com.exam.enums.DifficultyLevel;
import com.exam.enums.RoleName;
import com.exam.repository.ExamRepository;
import com.exam.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ExamRepository examRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedSampleExams();
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@exam.com")) {
            User admin = User.builder()
                    .fullName("System Administrator")
                    .email("admin@exam.com")
                    .password(passwordEncoder.encode("adminpassword"))
                    .role(RoleName.ROLE_ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Default Admin seeded: admin@exam.com / adminpassword");
        }

        if (!userRepository.existsByEmail("student@exam.com")) {
            User student = User.builder()
                    .fullName("Alex Morgan")
                    .email("student@exam.com")
                    .password(passwordEncoder.encode("studentpassword"))
                    .role(RoleName.ROLE_STUDENT)
                    .enabled(true)
                    .build();
            userRepository.save(student);
            log.info("Default Student seeded: student@exam.com / studentpassword");
        }
    }

    private void seedSampleExams() {
        if (examRepository.count() > 0) {
            return;
        }

        // Exam 1: Java & Spring Boot Fundamentals
        Exam javaExam = Exam.builder()
                .title("Java 21 & Spring Boot 3 Professional Assessment")
                .description("Comprehensive test assessing core Java concepts, OOP principles, Spring Data JPA, and Spring Security architecture.")
                .subject("Java / Backend Engineering")
                .durationMinutes(15)
                .totalMarks(50)
                .passMarks(25)
                .isPublished(true)
                .randomizeQuestions(false)
                .allowedAttempts(2)
                .questions(new ArrayList<>())
                .build();

        addQuestion(javaExam,
                "What is the primary benefit of using Spring Boot auto-configuration?",
                10,
                DifficultyLevel.EASY,
                1,
                List.of(
                        new OptionData("It eliminates boilerplate configuration by automatically registering beans based on classpath dependencies.", true),
                        new OptionData("It compiles Java code to native C++ machine binaries at runtime.", false),
                        new OptionData("It bypasses Spring Security filters entirely for faster execution.", false),
                        new OptionData("It automatically creates front-end HTML templates for every REST endpoint.", false)
                )
        );

        addQuestion(javaExam,
                "Which HTTP status code is most appropriate when a requested resource is not found?",
                10,
                DifficultyLevel.EASY,
                2,
                List.of(
                        new OptionData("400 Bad Request", false),
                        new OptionData("401 Unauthorized", false),
                        new OptionData("404 Not Found", true),
                        new OptionData("500 Internal Server Error", false)
                )
        );

        addQuestion(javaExam,
                "How does Spring Data JPA manage database transactions in @Transactional service methods?",
                10,
                DifficultyLevel.MEDIUM,
                3,
                List.of(
                        new OptionData("It uses Spring AOP proxies to begin, commit, or rollback transactions around method execution.", true),
                        new OptionData("It runs a separate background thread that polls MySQL every 10 milliseconds.", false),
                        new OptionData("It converts JPA entities into plain JSON files on the server hard drive.", false),
                        new OptionData("It stores all database writes in browser local storage until the session ends.", false)
                )
        );

        addQuestion(javaExam,
                "Why should password hashes like BCrypt be used instead of plain text or MD5?",
                10,
                DifficultyLevel.MEDIUM,
                4,
                List.of(
                        new OptionData("BCrypt incorporates cryptographic salts and an adjustable work factor to resist rainbow-table and brute-force attacks.", true),
                        new OptionData("BCrypt decrypts passwords back into clear text quickly during login.", false),
                        new OptionData("BCrypt reduces database disk size by compressing passwords into 2-letter tokens.", false),
                        new OptionData("BCrypt enables passwords to be shared securely between different users.", false)
                )
        );

        addQuestion(javaExam,
                "In a timed examination system, where should the remaining duration strictly be validated?",
                10,
                DifficultyLevel.HARD,
                5,
                List.of(
                        new OptionData("On the backend server using the recorded start time and duration to prevent client device clock manipulation.", true),
                        new OptionData("Solely in JavaScript window.localStorage on the student's browser.", false),
                        new OptionData("In a cookie that can be edited by browser extensions.", false),
                        new OptionData("In the React component state which resets on page reload.", false)
                )
        );

        examRepository.save(javaExam);

        // Exam 2: Web Architecture & React
        Exam webExam = Exam.builder()
                .title("Modern Frontend & React Architecture")
                .description("Test covering React component lifecycle, Hooks, state management, REST API consumption, and security best practices.")
                .subject("Web Development")
                .durationMinutes(10)
                .totalMarks(30)
                .passMarks(15)
                .isPublished(true)
                .randomizeQuestions(true)
                .allowedAttempts(1)
                .questions(new ArrayList<>())
                .build();

        addQuestion(webExam,
                "What hook is used in React to perform side effects like fetching data from a REST API?",
                10,
                DifficultyLevel.EASY,
                1,
                List.of(
                        new OptionData("useState", false),
                        new OptionData("useEffect", true),
                        new OptionData("useReducer", false),
                        new OptionData("useContext", false)
                )
        );

        addQuestion(webExam,
                "What is the purpose of Axios request interceptors?",
                10,
                DifficultyLevel.MEDIUM,
                2,
                List.of(
                        new OptionData("To attach Authorization Bearer headers or log outgoing requests before they leave the browser.", true),
                        new OptionData("To compile JSX into standard JavaScript.", false),
                        new OptionData("To encrypt the entire MySQL database from the client side.", false),
                        new OptionData("To prevent CSS styles from reloading.", false)
                )
        );

        addQuestion(webExam,
                "How can you prevent answers from being lost if a student accidentally closes the browser during an exam?",
                10,
                DifficultyLevel.HARD,
                3,
                List.of(
                        new OptionData("By implementing background periodic or on-change autosave requests to persist selections to the database.", true),
                        new OptionData("By disabling all mouse clicks and keyboard shortcuts on the student's computer.", false),
                        new OptionData("By forcing students to use paper and pencil instead.", false),
                        new OptionData("By automatically submitting the exam the moment a key is pressed.", false)
                )
        );

        examRepository.save(webExam);
        log.info("Sample Exams seeded successfully with realistic questions and options.");
    }

    private void addQuestion(Exam exam, String text, int marks, DifficultyLevel difficulty, int order, List<OptionData> options) {
        Question q = Question.builder()
                .exam(exam)
                .questionText(text)
                .marks(marks)
                .difficulty(difficulty)
                .orderNum(order)
                .options(new ArrayList<>())
                .build();

        for (OptionData opt : options) {
            Option o = Option.builder()
                    .question(q)
                    .optionText(opt.text)
                    .isCorrect(opt.isCorrect)
                    .build();
            q.getOptions().add(o);
        }
        exam.getQuestions().add(q);
    }

    private record OptionData(String text, boolean isCorrect) {}
}
