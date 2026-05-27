package com.upblit.backend.core.user;

import com.upblit.backend.core.Plan;
import com.upblit.backend.core.User;
import com.upblit.backend.core.UserRepository;
import com.upblit.backend.security.UserdataUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User CreateUser(User user) {
        if (user.getPlan() == null || user.getPlan().isBlank()) {
            user.setPlan(Plan.PIRATES.name());
        }
        return userRepository.save(user);
    }

    public User updateCurrentUser(User user) {
        User existing = userRepository.findById(UserdataUtil.getCurrentUserId())
                .orElseThrow(() -> new IllegalStateException("Current user not found"));

        if (user.getUsername() != null) {
            existing.setUsername(user.getUsername());
        }

        if (user.getEmail() != null) {
            existing.setEmail(user.getEmail());
        }

        if (user.getAvatarUrl() != null) {
            existing.setAvatarUrl(user.getAvatarUrl());
        }

        if (user.getPlan() != null && !user.getPlan().isBlank()) {
            existing.setPlan(user.getPlan());
        }

        return userRepository.save(existing);
    }

    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
}
