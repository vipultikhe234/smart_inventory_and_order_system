package com.smartinventory.gateway.filter;

import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    public static final List<String> openApiEndpoints = List.of(
            "/api/v1/users/auth/register",
            "/api/v1/users/auth/login",
            "/eureka"
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> {
                String path = request.getURI().getPath();
                
                // Always allow auth endpoints
                if (openApiEndpoints.stream().anyMatch(path::contains)) {
                    return false;
                }
                
                // Allow public read access to products, categories, and inventory
                if (request.getMethod() == HttpMethod.GET &&
                   (path.startsWith("/api/v1/products") ||
                    path.startsWith("/api/v1/categories") ||
                    path.startsWith("/api/v1/inventory"))) {
                    return false;
                }
                
                return true;
            };
}
