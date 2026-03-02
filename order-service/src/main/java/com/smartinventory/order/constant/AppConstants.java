package com.smartinventory.order.constant;

/**
 * 🔐 Application Secrets & Constants
 * Used for storing sensitive keys and global configuration
 */
public class AppConstants {

    // Stripe API Configuration - Loaded from Environment or System Property
    public static final String STRIPE_SECRET_KEY = getVal("STRIPE_SECRET_KEY", "PLACEHOLDER_KEY");
    
    // JWT configuration loaded from Environment or System Property
    public static final String JWT_SECRET = getVal("JWT_SECRET", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
    
    // Other constants
    public static final String STRIPE_CLIENT_URL = getVal("STRIPE_CLIENT_URL", "http://localhost:3000");

    private static String getVal(String key, String def) {
        String val = System.getenv(key);
        if (val == null || val.isEmpty()) {
            val = System.getProperty(key);
        }
        return (val != null && !val.isEmpty()) ? val : def;
    }
}
