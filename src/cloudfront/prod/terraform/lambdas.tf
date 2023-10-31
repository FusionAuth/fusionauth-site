#
# execution policy for site-origin-request-handler
#
resource "aws_iam_policy" "site_origin_request_handler" {
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
          "arn:aws:s3:::fusionauth-prod-us-east-1-artifacts/*",
        ]
      }
    ]
  })
}

#
# lambda-at-edge site-origin-request-handler
#
module "site_origin_request_handler" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "6.2.0"

  lambda_at_edge = true

  function_name = "site-origin-request-handler"
  description   = "origin-request handler for fusionauth-site cloudfront behaviors"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  architectures = ["x86_64"]
  source_path   = "../lambdas/site-origin-request-handler/src/index.mjs"
  timeout       = 10

  attach_policy = true
  policy        = aws_iam_policy.site_origin_request_handler.arn
}
