package com.sai.sai_hospital_backend.repository;

import com.sai.sai_hospital_backend.model.Token;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {
    Optional<Token> findByToken(String token);

    // Find all tokens for a specific user id that are not logged out
    List<Token> findAllByUserIdAndIsLoggedOutFalse(Long id);
}
