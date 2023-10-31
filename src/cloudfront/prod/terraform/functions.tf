#
# fusionauth-security-headers function - used as the viewer-response handler for most behaviors.
#
resource "aws_cloudfront_function" "fusionauth_security_headers" {
  name    = "fusionauth-security-headers"
  comment = "Adds the security headers for the FusionAuth website."
  runtime = "cloudfront-js-1.0"
  code    = file("../functions/fusionauth-security-headers.js")
}
