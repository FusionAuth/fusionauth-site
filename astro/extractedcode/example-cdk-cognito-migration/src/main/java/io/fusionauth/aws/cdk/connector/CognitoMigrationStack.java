package io.fusionauth.aws.cdk.connector;


import java.util.HashMap;
import java.util.Map;
import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Duration;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.services.apigateway.LambdaIntegration;
import software.amazon.awscdk.services.apigateway.RestApi;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;


public class CognitoMigrationStack extends Stack {
  public CognitoMigrationStack(final Construct scope, final String id) {
    super(scope, id, null);

    RestApi api =
        RestApi.Builder.create(this, "connector-endpoint")
            .restApiName("Connector Endpoint")
            .description("This service responds to login requests from a FusionAuth Connector")
            .build();

    Function lambdaFunction =
        Function.Builder.create(this, "ConnectorHandler")
            .code(Code.fromAsset("resources"))
            .handler("index.handler")
            .timeout(Duration.seconds(10))
            .runtime(Runtime.NODEJS_14_X)
            .build();
    
    LambdaIntegration postIntegration = new LambdaIntegration(lambdaFunction);
    
    api.getRoot().addMethod("POST", postIntegration);
  }
}
