package example.notes;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SecurityConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/login").setViewName("login");
    }

    @Bean
    SecurityFilterChain security(HttpSecurity http, ClientRegistrationRepository clients) throws Exception {
        var logoutHandler = new OidcClientInitiatedLogoutSuccessHandler(clients);
        logoutHandler.setPostLogoutRedirectUri("{baseUrl}/login");

        return http
            .authorizeHttpRequests(routes -> routes
                .requestMatchers("/login").permitAll()
                .anyRequest().authenticated())
            .oauth2Login(login -> login
                .loginPage("/login")
                .redirectionEndpoint(callback -> callback.baseUri("/oauth-callback")))
            .logout(logout -> logout.logoutSuccessHandler(logoutHandler))
            .build();
    }
}
