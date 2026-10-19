package com.exam.service;

import com.exam.config.JwtTokenProvider;
import com.exam.dto.AuthRequest;
import com.exam.dto.AuthResponse;
import com.exam.dto.RegisterRequest;
import com.exam.entity.User;
import com.exam.enums.RoleName;
import com.exam.exception.BadRequestException;
import com.exam.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private User sampleStudent;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        sampleStudent = User.builder()
                .id(1L)
                .fullName("John Doe")
                .email("john@exam.com")
                .password("encoded_pass")
                .role(RoleName.ROLE_STUDENT)
                .enabled(true)
                .build();

        registerRequest = RegisterRequest.builder()
                .fullName("John Doe")
                .email("john@exam.com")
                .password("password123")
                .role(RoleName.ROLE_STUDENT)
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new student user and return JWT token")
    void testRegisterSuccess() {
        when(userRepository.existsByEmail("john@exam.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(sampleStudent);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("mocked.jwt.token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("john@exam.com", response.getEmail());
        assertEquals(RoleName.ROLE_STUDENT, response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when registering duplicate email")
    void testRegisterDuplicateEmail() {
        when(userRepository.existsByEmail("john@exam.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully login and return JWT for valid credentials")
    void testLoginSuccess() {
        AuthRequest loginReq = AuthRequest.builder()
                .email("john@exam.com")
                .password("password123")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("mocked.login.jwt");
        when(userRepository.findByEmail("john@exam.com")).thenReturn(Optional.of(sampleStudent));

        AuthResponse response = authService.login(loginReq);

        assertNotNull(response);
        assertEquals("mocked.login.jwt", response.getToken());
        assertEquals("John Doe", response.getFullName());
    }
}
