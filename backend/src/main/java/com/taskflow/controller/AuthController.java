package com.taskflow.controller;

import com.taskflow.domain.User;
import com.taskflow.dto.AuthRequest;
import com.taskflow.dto.AuthResponse;
import com.taskflow.dto.RegisterRequest;
import com.taskflow.dto.UserDto;
import com.taskflow.repository.UserRepository;
import com.taskflow.security.CustomUserDetails;
import com.taskflow.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;
    private static final int RATE_LIMIT_WINDOW_MINUTES = 1;
    private static final int RATE_LIMIT_MAX_REQUESTS = 10;

    // In-memory rate limiter: IP -> (count, windowStart)
    private final ConcurrentHashMap<String, long[]> rateLimitMap = new ConcurrentHashMap<>();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    private boolean isRateLimited(String ip) {
        long now = System.currentTimeMillis();
        long windowMs = RATE_LIMIT_WINDOW_MINUTES * 60 * 1000L;
        rateLimitMap.merge(ip, new long[]{1, now}, (existing, newVal) -> {
            if (now - existing[1] > windowMs) {
                existing[0] = 1;
                existing[1] = now;
            } else {
                existing[0]++;
            }
            return existing;
        });
        return rateLimitMap.get(ip)[0] > RATE_LIMIT_MAX_REQUESTS;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "An account with this email already exists. Try logging in instead.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);
        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtService.generateToken(userDetails, savedUser.getId().toString());
        UserDto userDto = new UserDto(savedUser.getId(), savedUser.getName(), savedUser.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token, userDto));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody AuthRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {

        String clientIp = httpRequest.getRemoteAddr();

        // Rate limiting check
        if (isRateLimited(clientIp)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                "Too many login attempts. Please wait a moment before trying again.");
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        // Account does not exist
        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "No account found with that email. Please check the address or create a new account.");
        }

        User user = userOpt.get();

        // Account locked
        if (user.isLocked()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Your account has been temporarily locked after too many failed attempts. Please try again in " + LOCK_DURATION_MINUTES + " minutes.");
        }

        // Attempt authentication
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            // Increment failed attempts
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);

            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
                user.setFailedLoginAttempts(0);
                userRepository.save(user);
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Your account has been locked after " + MAX_FAILED_ATTEMPTS + " failed attempts. Please try again in " + LOCK_DURATION_MINUTES + " minutes.");
            }

            userRepository.save(user);
            int remaining = MAX_FAILED_ATTEMPTS - attempts;
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "The email or password you entered is incorrect. " + remaining + " attempt(s) remaining before your account is locked.");
        }

        // Successful login — reset failed attempts
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtService.generateToken(userDetails, user.getId().toString());
        UserDto userDto = new UserDto(user.getId(), user.getName(), user.getEmail());
        return ResponseEntity.ok(new AuthResponse(token, userDto));
    }
}

