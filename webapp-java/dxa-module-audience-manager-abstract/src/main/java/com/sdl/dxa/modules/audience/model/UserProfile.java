package com.sdl.dxa.modules.audience.model;

import com.google.common.collect.Sets;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collection;

import static java.util.Collections.unmodifiableSet;

@Data
@RequiredArgsConstructor
public abstract class UserProfile implements UserDetails {

    public static final Collection<? extends GrantedAuthority> DEFAULT_AUTHORITIES = unmodifiableSet(
            Sets.<GrantedAuthority>newHashSet(new SimpleGrantedAuthority("ROLE_USER")));

    private static final String ENCRYPTED_TOKEN = "encrypted:";

    private final String username;

    private final String displayUsernameKey;

    private final String passwordKey;

    private final transient ContactIdentifiers identifiers;

    @NotNull
    protected abstract PasswordEncoder getPasswordEncoder();

    public abstract String getDisplayUsername();

    public abstract String getId();

    public boolean verifyPassword(@Nullable String password) {
        if (password == null) {
            return false;
        }

        String storedPassword = getPassword();
        return storedPassword.startsWith(ENCRYPTED_TOKEN) ?
                getPasswordEncoder().matches(password, storedPassword.substring(ENCRYPTED_TOKEN.length())) :
                password.equals(storedPassword);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return DEFAULT_AUTHORITIES;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Data
    @AllArgsConstructor
    public static class Details {

        private String id;

        private String displayUsername;

        @Override
        public String toString() {
            return getId() + ";" + getDisplayUsername();
        }
    }
}
