resource "aws_iam_policy" "lambda_execution_policy" {
  name = "site-origin-request-handler-s3"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject"
        ]
        Resource = [
          "arn:aws:s3:::fusionauth-dev-us-east-1-artifacts/*",
        ]
      }
    ]
  })
}

module "lambda" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "6.0.1"

  lambda_at_edge = true

  function_name = "site-origin-request-handler"
  description   = "origin-request handler for fusionauth-site cloudfront behaviors"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  architectures = ["x86_64"]

  source_path = "../src/index.mjs"

  attach_policy = true
  policy        = aws_iam_policy.lambda_execution_policy.arn
}
