package io.fusionauth.quickstart.springapi;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class CustomJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final String ROLES_CLAIM = "roles";

    private static final String EMAIL_CLAIM = "email";

    private static final String AUD_CLAIM = "aud";

    private final List<String> audiences;

    public CustomJwtAuthenticationConverter(List<String> audiences) {
        this.audiences = audiences;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String email = jwt.getClaimAsString(EMAIL_CLAIM);
        if (!hasAudience(jwt)) {
            return new UsernamePasswordAuthenticationToken(email, "n/a");
        } else {
            Collection<GrantedAuthority> authorities = extractRoles(jwt);
            return new UsernamePasswordAuthenticationToken(email, "n/a", authorities);
        }
    }

    private boolean hasAudience(Jwt jwt) {
        return jwt.hasClaim(AUD_CLAIM)
                && jwt.getClaimAsStringList(AUD_CLAIM)
                .stream()
                .anyMatch(audiences::contains);
    }

    private List<GrantedAuthority> extractRoles(Jwt jwt) {
        return jwt.hasClaim(ROLES_CLAIM)
                ? jwt.getClaimAsStringList(ROLES_CLAIM)
                    .stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList())
                : List.of();
    }
}
