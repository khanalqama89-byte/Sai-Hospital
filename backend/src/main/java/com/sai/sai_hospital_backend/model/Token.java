package com.sai.sai_hospital_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tokens")
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 500)
    private String token;

    private boolean isLoggedOut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public Token() {
    }

    public Token(String token, boolean isLoggedOut, User user) {
        this.token = token;
        this.isLoggedOut = isLoggedOut;
        this.user = user;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public boolean isLoggedOut() {
        return isLoggedOut;
    }

    public void setLoggedOut(boolean loggedOut) {
        isLoggedOut = loggedOut;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
