package com.smartinventory.order.constant;

/**
 * 🔐 Application Secrets & Constants
 * Used for storing sensitive keys and global configuration
 */
public class AppConstants {

    // Stripe API Configuration - Loaded from System Environment for Security
    public static final String STRIPE_SECRET_KEY = System.getProperty("STRIPE_SECRET_KEY", "PLACEHOLDER_KEY");
    
    // Other constants can go here
    public static final String STRIPE_CLIENT_URL = "http://localhost:3000";
}
