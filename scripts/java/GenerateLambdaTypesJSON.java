/*
 * Copyright (c) 2026, FusionAuth, All Rights Reserved
 */

import java.io.File;
import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.fusionauth.domain.LambdaType;

/**
 * Writes each lambda type in the release with the function name and parameters from the default body the Admin UI shows.
 * <p>
 * Usage: java GenerateLambdaTypesJSON <output file>
 */
public class GenerateLambdaTypesJSON {
  public static void main(String[] args) throws Exception {
    ObjectMapper objectMapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
    ArrayNode types = objectMapper.createArrayNode();
    for (LambdaType type : LambdaType.values()) {
      Matcher signature = Pattern.compile("function\\s+" + Pattern.quote(type.getFunctionName()) + "\\s*\\(([^)]*)\\)").matcher(type.getExample());
      if (!signature.find()) {
        throw new IllegalStateException("No " + type.getFunctionName() + "() signature in the default body for " + type);
      }

      ObjectNode node = types.addObject();
      node.put("type", type.name());
      node.put("function", type.getFunctionName());
      ArrayNode parameters = node.putArray("parameters");
      Arrays.stream(signature.group(1).split(","))
            .map(String::trim)
            .filter(parameter -> !parameter.isEmpty())
            .forEach(parameters::add);
    }
    objectMapper.writeValue(new File(args[0]), types);
  }
}
