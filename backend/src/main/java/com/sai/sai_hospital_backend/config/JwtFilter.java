package com.sai.sai_hospital_backend.config;

import com.sai.sai_hospital_backend.repository.TokenRepository;
import com.sai.sai_hospital_backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TokenRepository tokenRepository;

    @Override
    protected void doFilterInternal(@org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String identifier = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                identifier = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                // Token extraction failed
                System.out.println("JWT Token extraction failed: " + e.getMessage());
            }
        }

        if (identifier != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Check if token exists in DB and is not logged out
            boolean isTokenValidDatabase = tokenRepository.findByToken(jwt)
                    .map(t -> !t.isLoggedOut())
                    .orElse(false);

            // Validate the token. We use an empty list of authorities since we don't have
            // roles yet.
            if (jwtUtil.validateToken(jwt, identifier) && isTokenValidDatabase) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        identifier, null, new ArrayList<>());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
