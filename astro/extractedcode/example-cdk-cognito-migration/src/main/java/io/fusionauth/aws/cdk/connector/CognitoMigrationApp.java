package io.fusionauth.aws.cdk.connector;

import software.amazon.awscdk.core.App;

public class CognitoMigrationApp {
  public static void main(final String argv[]) {
    App app = new App();

    new CognitoMigrationStack(app, "CognitoMigration");

    app.synth();
  }
}
