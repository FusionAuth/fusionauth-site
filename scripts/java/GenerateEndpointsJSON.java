/*
 * Copyright (c) 2025, FusionAuth, All Rights Reserved
 */

import java.io.File;
import java.io.IOException;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Enumeration;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.TreeSet;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

import org.primeframework.mvc.util.DefaultURIBuilder;

/**
 * Scans compiled fusionauth-app action classes using reflection to discover API endpoints
 * that are managed via API key permissions.
 * <p>
 * This tool uses the fusionauth-app jars from the release zip as its classpath. It must be compiled
 * and run with those jars on the classpath (see bin/generate-endpoints.sh).
 * <p>
 * It uses Prime MVC's DefaultURIBuilder to derive URL paths from class names/packages.
 * <p>
 * Filtering logic matches fusionauth-app's BaseFormAction endpoint collection to identify
 * endpoints that can be managed via API key permissions. Only endpoints that meet ALL of the
 * following criteria are included:
 * <ul>
 *   <li>URI starts with /api/ or /oauth2/ (scanned from io.fusionauth.app.action package)</li>
 *   <li>URI does NOT start with /api/api-key (API keys use keyManager attribute, not permissions)</li>
 *   <li>Requires authentication (@Action.requiresAuthentication = true)</li>
 *   <li>Scheme includes "api" (@Action.scheme contains "api")</li>
 *   <li>Not marked as @UndocumentedAPI</li>
 * </ul>
 * See: https://github.com/fusionauth-eng/fusionauth-app/blob/main/src/main/java/io/fusionauth/app/action/admin/apiKey/BaseFormAction.java#L52
 *
 * @author FusionAuth
 */
public class GenerateEndpointsJSON {

  // The package prefix for action classes to scan
  private static final String ACTION_PACKAGE = "io.fusionauth.app.action";

  // The package prefix as a path (for scanning JAR entries)
  private static final String ACTION_PACKAGE_PATH = ACTION_PACKAGE.replace('.', '/');

  // HTTP method names to look for on action classes
  private static final Set<String> HTTP_METHODS = Set.of("get", "post", "put", "delete", "patch");

  private static final String GLOBAL_SCHEME = "api-no-tenant";

  private static final String TENANT_SCHEME = "api";

  public static void main(String[] args) {
    if (args.length < 1) {
      System.err.println("Usage: GenerateEndpointsJSON <output-file>");
      System.err.println();
      System.err.println("Must be run with fusionauth-app jars on the classpath.");
      System.err.println("See bin/generate-endpoints.sh");
      System.exit(1);
    }

    String outputFile = args[0];

    try {
      List<EndpointInfo> endpoints = scanEndpoints();
      String json = toJson(endpoints);

      File outFile = new File(outputFile);
      File parentDir = outFile.getParentFile();
      if (parentDir != null && !parentDir.exists()) {
        throw new IOException("Output directory does not exist: " + parentDir);
      }
      Files.writeString(outFile.toPath(), json);
      System.err.println("Wrote " + endpoints.size() + " endpoints to " + outputFile);
    } catch (Exception e) {
      System.err.println("Error: " + e.getMessage());
      e.printStackTrace(System.err);
      System.exit(1);
    }
  }

  /**
   * Scan for all API endpoint classes on the classpath and extract their metadata.
   */
  private static List<EndpointInfo> scanEndpoints() throws Exception {
    // Find the @Action annotation class, @UndocumentedAPI, and Patchable interface from the classpath
    Class<? extends Annotation> actionAnnotation = loadActionAnnotation();
    Class<? extends Annotation> undocumentedAnnotation = loadUndocumentedAnnotation();
    Class<?> patchableInterface = loadPatchableInterface();

    // Discover all class names under the action package by scanning jars on the classpath
    List<String> classNames = discoverActionClassNames();
    System.err.println("Discovered " + classNames.size() + " action classes in " + ACTION_PACKAGE);

    // Use Prime MVC's URI builder to derive URL paths from class names
    DefaultURIBuilder uriBuilder = new DefaultURIBuilder();

    List<EndpointInfo> endpoints = new ArrayList<>();

    for (String className : classNames) {
      Class<?> clazz;
      try {
        clazz = Class.forName(className);
      } catch (Throwable e) {
        // Skip classes that can't be loaded (e.g., missing dependencies)
        System.err.println("Warning: Could not load " + className + ": " + e.getMessage());
        continue;
      }

      // Skip interfaces and abstract classes
      if (clazz.isInterface() || Modifier.isAbstract(clazz.getModifiers())) {
        continue;
      }

      // Skip classes without @Action
      if (!clazz.isAnnotationPresent(actionAnnotation)) {
        continue;
      }

      // Skip @UndocumentedAPI
      if (undocumentedAnnotation != null && clazz.isAnnotationPresent(undocumentedAnnotation)) {
        continue;
      }

      // Extract @Action attributes via reflection
      Annotation action = clazz.getAnnotation(actionAnnotation);
      String baseURI = invokeAnnotationMethod(action, "baseURI", String.class);
      boolean requiresAuth = invokeAnnotationMethod(action, "requiresAuthentication", Boolean.class);
      String[] scheme = invokeAnnotationMethod(action, "scheme", String[].class);

      // Filter: only include endpoints that require authentication
      // See: https://github.com/fusionauth-eng/fusionauth-app/blob/main/src/main/java/io/fusionauth/app/action/admin/apiKey/BaseFormAction.java#L52
      if (!requiresAuth) {
        continue;
      }

      // Filter: only include endpoints where scheme contains "api" or "api-no-tenant"
      if (Collections.disjoint(Arrays.asList(scheme), List.of(TENANT_SCHEME, GLOBAL_SCHEME))) {
        continue;
      }

      String apiKeyTypeValue = Arrays.asList(scheme).contains(TENANT_SCHEME) ? "tenant" : "global";

      // Discover HTTP methods (get, post, put, delete, patch)
      // Class.getMethods() returns all public methods including inherited and default interface methods
      Set<String> httpMethods = new TreeSet<>();
      for (Method method : clazz.getMethods()) {
        if (HTTP_METHODS.contains(method.getName())
            && method.getParameterCount() == 0
            && method.getReturnType() == String.class) {
          httpMethods.add(method.getName().toUpperCase(Locale.ROOT));
        }
      }

      // Also check Patchable interface (adds PATCH via default method)
      if (patchableInterface != null && patchableInterface.isAssignableFrom(clazz)) {
        httpMethods.add("PATCH");
      }

      if (httpMethods.isEmpty()) {
        continue; // Not a real endpoint
      }

      // Derive the URL path — @Action.baseURI overrides the default, otherwise use Prime MVC's builder
      String url;
      if (baseURI != null && !baseURI.isEmpty()) {
        url = baseURI.toLowerCase(Locale.ROOT);
      } else {
        url = uriBuilder.build(clazz);
      }

      // Filter: only include URLs starting with /api/ or /oauth2/
      if (!url.startsWith("/api/") && !url.startsWith("/oauth2/")) {
        continue;
      }

      EndpointInfo endpoint = new EndpointInfo();
      endpoint.url = url;
      endpoint.className = clazz.getName();
      endpoint.methods = new ArrayList<>(httpMethods);
      endpoint.apiKeyType = apiKeyTypeValue;
      endpoints.add(endpoint);
    }

    // Sort by URL
    endpoints.sort(Comparator.comparing(e -> e.url));
    return endpoints;
  }

  /**
   * Discover all class names under the action package by scanning JAR files on the classpath.
   */
  private static List<String> discoverActionClassNames() throws IOException {
    List<String> classNames = new ArrayList<>();
    String classpath = System.getProperty("java.class.path", "");
    String[] entries = classpath.split(File.pathSeparator);

    for (String entry : entries) {
      File file = new File(entry);
      if (file.isFile() && file.getName().endsWith(".jar")) {
        try (JarFile jar = new JarFile(file)) {
          Enumeration<JarEntry> jarEntries = jar.entries();
          while (jarEntries.hasMoreElements()) {
            JarEntry jarEntry = jarEntries.nextElement();
            String name = jarEntry.getName();
            if (name.startsWith(ACTION_PACKAGE_PATH + "/")
                && name.endsWith(".class")
                && !name.contains("$")) { // Skip inner classes
              // Convert path to class name: io/fusionauth/app/action/api/Foo.class -> io.fusionauth.app.action.api.Foo
              String className = name.substring(0, name.length() - 6).replace('/', '.');
              classNames.add(className);
            }
          }
        }
      } else if (file.isDirectory()) {
        // Support exploded class directories too
        Path actionDir = file.toPath().resolve(ACTION_PACKAGE_PATH.replace('/', File.separatorChar));
        if (Files.isDirectory(actionDir)) {
          try (var walk = Files.walk(actionDir)) {
            walk.filter(p -> p.toString().endsWith(".class") && !p.getFileName().toString().contains("$"))
                .forEach(p -> {
                  String relative = file.toPath().relativize(p).toString();
                  String className = relative.substring(0, relative.length() - 6)
                      .replace(File.separatorChar, '.');
                  classNames.add(className);
                });
          }
        }
      }
    }

    return classNames;
  }

  /**
   * Load the @Action annotation class from the classpath.
   */
  @SuppressWarnings("unchecked")
  private static Class<? extends Annotation> loadActionAnnotation() throws ClassNotFoundException {
    return (Class<? extends Annotation>) Class.forName("org.primeframework.mvc.action.annotation.Action");
  }

  /**
   * Load the @UndocumentedAPI annotation class from the classpath (may not exist in all versions).
   */
  @SuppressWarnings("unchecked")
  private static Class<? extends Annotation> loadUndocumentedAnnotation() {
    try {
      return (Class<? extends Annotation>) Class.forName("io.fusionauth.app.primeframework.UndocumentedAPI");
    } catch (ClassNotFoundException e) {
      System.err.println("Warning: @UndocumentedAPI annotation not found on classpath. Skipping filter.");
      return null;
    }
  }

  /**
   * Load the Patchable interface from the classpath (may not exist in all versions).
   */
  private static Class<?> loadPatchableInterface() {
    try {
      return Class.forName("io.fusionauth.app.action.api.Patchable");
    } catch (ClassNotFoundException e) {
      System.err.println("Warning: Patchable interface not found on classpath. PATCH detection will rely on method scanning only.");
      return null;
    }
  }

  /**
   * Invoke an annotation method by name using reflection (since we load the annotation class dynamically).
   */
  @SuppressWarnings("unchecked")
  private static <T> T invokeAnnotationMethod(Annotation annotation, String methodName, Class<T> returnType) {
    try {
      Method method = annotation.annotationType().getMethod(methodName);
      return (T) method.invoke(annotation);
    } catch (Exception e) {
      throw new RuntimeException("Failed to read @Action." + methodName + ": " + e.getMessage(), e);
    }
  }

  /**
   * Produce JSON output without any external dependencies.
   */
  private static String toJson(List<EndpointInfo> endpoints) {
    StringBuilder sb = new StringBuilder();
    sb.append("[\n");

    for (int i = 0; i < endpoints.size(); i++) {
      EndpointInfo ep = endpoints.get(i);
      sb.append("  {\n");
      sb.append("    \"url\": ").append(jsonString(ep.url)).append(",\n");
      sb.append("    \"methods\": [");
      for (int j = 0; j < ep.methods.size(); j++) {
        if (j > 0) sb.append(", ");
        sb.append(jsonString(ep.methods.get(j)));
      }
      sb.append("],\n");
      sb.append("    \"apiKeyType\": ").append(jsonString(ep.apiKeyType));
      sb.append("\n");
      sb.append("  }");

      if (i < endpoints.size() - 1) {
        sb.append(",");
      }
      sb.append("\n");
    }

    sb.append("]\n");
    return sb.toString();
  }

  private static String jsonString(String value) {
    if (value == null) {
      return "null";
    }
    return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
  }

  /**
   * A discovered API endpoint.
   */
  static class EndpointInfo {
    String url;
    String className;
    List<String> methods;
    String apiKeyType;
  }

  /*
   * ============================================================================
   * DEVELOPMENT UTILITIES (for reference only - not used in production)
   * ============================================================================
   * 
   * The methods below are utility tools used during development to analyze
   * action classes and understand the structure of the fusionauth-app codebase.
   * They are kept here as documentation but are not invoked by the main scanner.
   * 
   * To use these utilities, simply add a main() entry point, then compile and
   * run separately.
   * ============================================================================
   */

  /*
   * UTILITY 1: Get URLs for specific action classes
   * 
   * Usage: Uncomment and modify the class names, then run separately.
   *
   */
  private static void utilityGetURIs() throws Exception {
    DefaultURIBuilder builder = new DefaultURIBuilder();
    
    // Example: check URLs for specific action classes
    Class<?> webhookAction = Class.forName("io.fusionauth.app.action.internal.WebhookAction");
    Class<?> userCodeAction = Class.forName("io.fusionauth.app.action.oauth2.device.UserCodeAction");
    
    System.out.println("WebhookAction URL: " + builder.build(webhookAction));
    System.out.println("UserCodeAction URL: " + builder.build(userCodeAction));
  }

  /*
   * UTILITY 2: Scan all action classes for scheme="api" and requiresAuthentication
   * 
   * Usage: Uncomment and run as a separate main() to find all actions with
   * scheme containing "api" and requiresAuthentication=true across all packages.
   *
  */
  private static void utilityScanAllApiSchemeActions() throws Exception {
    Class<? extends Annotation> actionAnnotation = loadActionAnnotation();
    
    // Scan all action classes
    List<String> classNames = discoverActionClassNames();
    System.out.println("Found " + classNames.size() + " action classes total\n");
    
    int apiSchemeCount = 0;
    int apiSchemeAuthCount = 0;
    int apiSchemeAuthOutsideApiPackage = 0;
    
    for (String className : classNames) {
      try {
        Class<?> clazz = Class.forName(className);
        
        if (clazz.isInterface() || Modifier.isAbstract(clazz.getModifiers())) {
          continue;
        }
        
        if (!clazz.isAnnotationPresent(actionAnnotation)) {
          continue;
        }
        
        Annotation action = clazz.getAnnotation(actionAnnotation);
        boolean requiresAuth = invokeAnnotationMethod(action, "requiresAuthentication", Boolean.class);
        String[] scheme = invokeAnnotationMethod(action, "scheme", String[].class);
        
        boolean hasApiScheme = !Collections.disjoint(Arrays.asList(scheme), List.of(TENANT_SCHEME, GLOBAL_SCHEME));
        
        if (hasApiScheme) {
          apiSchemeCount++;
          
          if (requiresAuth) {
            apiSchemeAuthCount++;
            
            if (!className.startsWith("io.fusionauth.app.action.api.")) {
              apiSchemeAuthOutsideApiPackage++;
              String baseURI = invokeAnnotationMethod(action, "baseURI", String.class);
              System.out.println("FOUND: " + className);
              System.out.println("  baseURI: " + (baseURI.isEmpty() ? "(empty)" : baseURI));
              System.out.println("  scheme: " + Arrays.toString(scheme));
              System.out.println("  requiresAuthentication: " + requiresAuth);
              System.out.println();
            }
          }
        }
      } catch (Throwable e) {
        // Skip
      }
    }
    
    System.out.println("\n=== SUMMARY ===");
    System.out.println("Total actions with scheme='api': " + apiSchemeCount);
    System.out.println("  - With requiresAuthentication=true: " + apiSchemeAuthCount);
    System.out.println("  - Outside /api/ package: " + apiSchemeAuthOutsideApiPackage);
  }

  /*
   * UTILITY 3: Scan OAuth2 package for API-schemed actions
   * 
   * Usage: Uncomment and run as a separate main() to analyze OAuth2 actions
   * and see which ones meet the API endpoint criteria.
   *
   */
  private static void utilityScanOAuth2Actions() throws Exception {
    Class<? extends Annotation> actionAnnotation = loadActionAnnotation();
    DefaultURIBuilder uriBuilder = new DefaultURIBuilder();
    
    // List of OAuth2 action classes to examine
    String[] oauth2Classes = {
      "io.fusionauth.app.action.oauth2.AuthorizeAction",
      "io.fusionauth.app.action.oauth2.IntrospectAction",
      "io.fusionauth.app.action.oauth2.TokenAction",
      "io.fusionauth.app.action.oauth2.UserinfoAction",
      "io.fusionauth.app.action.oauth2.device.ApproveAction",
      "io.fusionauth.app.action.oauth2.device.UserCodeAction",
      "io.fusionauth.app.action.oauth2.device.ValidateAction"
    };
    
    System.out.println("Scanning OAuth2 actions for scheme='api' and requiresAuthentication=true\n");
    
    for (String className : oauth2Classes) {
      try {
        Class<?> clazz = Class.forName(className);
        
        if (clazz.isInterface() || Modifier.isAbstract(clazz.getModifiers())) {
          continue;
        }
        
        if (!clazz.isAnnotationPresent(actionAnnotation)) {
          System.out.println(className + " - NO @Action annotation");
          continue;
        }
        
        Annotation action = clazz.getAnnotation(actionAnnotation);
        boolean requiresAuth = invokeAnnotationMethod(action, "requiresAuthentication", Boolean.class);
        String[] scheme = invokeAnnotationMethod(action, "scheme", String[].class);
        String baseURI = invokeAnnotationMethod(action, "baseURI", String.class);
        
        String url;
        if (baseURI != null && !baseURI.isEmpty()) {
          url = baseURI.toLowerCase();
        } else {
          url = uriBuilder.build(clazz);
        }
        
        boolean hasApiScheme = !Collections.disjoint(Arrays.asList(scheme), List.of(TENANT_SCHEME, GLOBAL_SCHEME));
        
        System.out.println(className);
        System.out.println("  URL: " + url);
        System.out.println("  scheme: " + Arrays.toString(scheme));
        System.out.println("  requiresAuthentication: " + requiresAuth);
        System.out.println("  has 'api' in scheme: " + hasApiScheme);
        
        if (hasApiScheme && requiresAuth) {
          System.out.println("  >>> MATCHES CRITERIA <<<");
        }
        System.out.println();
      } catch (Throwable e) {
        System.out.println(className + " - ERROR: " + e.getMessage());
      }
    }
  }
}
