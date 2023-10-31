#
# s3 bucket for astro
#
resource "aws_s3_bucket" "astro" {
  provider = aws.use2
  bucket   = "fusionauth-dev-astro"
}

resource "aws_s3_bucket_policy" "astro" {
  provider = aws.use2
  bucket   = aws_s3_bucket.astro.id
  policy = jsonencode({
    Id      = "PolicyForCloudFrontPrivateContent"
    Version = "2008-10-17"
    Statement = {
      Sid    = "AllowCloudFrontServicePrincipal"
      Effect = "Allow"
      Principal = {
        Service = "cloudfront.amazonaws.com"
      }
      Action   = "s3:GetObject"
      Resource = "${aws_s3_bucket.astro.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.fusionauth_dev_site.arn
        }
      }
    }
  })
}
