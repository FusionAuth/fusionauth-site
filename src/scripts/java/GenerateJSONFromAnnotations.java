/*
 * Copyright (c) 2025, FusionAuth, All Rights Reserved
 */

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Comparator;
import java.util.stream.Collectors;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import io.fusionauth.api.annotation.PublicDoc;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.io.File;
import java.io.IOException;

public class GenerateJSONFromAnnotations {

  public static ArrayNode getPublicStaticVariables(Class<?> clazz, ObjectMapper objectMapper) {
    if (clazz == null) {
      throw new IllegalArgumentException("Provided class cannot be null.");
    }

    ArrayNode jsonArray = objectMapper.createArrayNode();

    for (Field field : clazz.getFields()) {
      if (field.isAnnotationPresent(PublicDoc.class)) {
        ObjectNode jsonObject = objectMapper.createObjectNode();
        PublicDoc annotation = field.getAnnotation(PublicDoc.class);

        jsonObject.put("description", annotation.description());

        if (!"".equals(annotation.name())) {
          jsonObject.put("name", annotation.name());
        } else {
          jsonObject.put("name", field.getName());
        }

        if (!"".equals(annotation.extraDoc())) {
          jsonObject.put("extraDoc", annotation.extraDoc());
        }
        if (!"".equals(annotation.since())) {
          jsonObject.put("since", annotation.since());
        }
        jsonArray.add(jsonObject);
      }
    }

    return jsonArray;
  }

  public static void main(String[] args) {
    if (args.length < 2) {
      System.err.println("Usage: GenerateJSONFromAnnotations <output-dir> <class-name> [<class-name>...]");
      System.exit(1);
    }

    String outputDir = args[0];
    if (!outputDir.endsWith("/")) {
      outputDir = outputDir + "/";
    }

    try {
      ObjectMapper objectMapper = new ObjectMapper();
      objectMapper.enable(SerializationFeature.INDENT_OUTPUT);

      File dir = new File(outputDir);
      if (!dir.exists() || !dir.isDirectory()) {
        throw new IOException("Output directory does not exist: " + outputDir);
      }

      for (int i = 1; i < args.length; i++) {
        ArrayNode jsonArray = getPublicStaticVariables(Class.forName(args[i]), objectMapper);
        List<JsonNode> dataNodes = new ArrayList<>();

        for (JsonNode node : jsonArray) {
          dataNodes.add((ObjectNode) node);
        }

        List<JsonNode> sortedDataNodes = dataNodes.stream()
            .sorted(Comparator.comparing(o -> o.get("name").asText()))
            .collect(Collectors.toList());

        if (sortedDataNodes.size() == 0) {
          throw new IllegalArgumentException(args[i] + " generated an empty array. That indicates a problem");
        }

        ArrayNode arrayNode = objectMapper.createObjectNode().arrayNode().addAll(sortedDataNodes);

        String[] parts = args[i].split("\\.");
        String fileName = outputDir + parts[parts.length - 1].toLowerCase() + ".json";

        objectMapper.writeValue(new File(fileName), arrayNode);
        System.err.println("Wrote " + sortedDataNodes.size() + " entries to " + fileName);
      }

    } catch (JsonProcessingException e) {
      System.err.println("Error: " + e.getMessage());
      System.exit(1);
    } catch (IllegalArgumentException e) {
      System.err.println("Error: " + e.getMessage());
      System.exit(1);
    } catch (IOException e) {
      System.err.println("Error: " + e.getMessage());
      System.exit(1);
    } catch (ClassNotFoundException e) {
      System.err.println("Error: " + e.getMessage());
      System.exit(1);
    }
  }
}
