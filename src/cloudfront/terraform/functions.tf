#
# basic-auth function - used as the viewer-request handler for most behaviors.
#
resource "aws_cloudfront_function" "basic_auth" {
  name    = "basic-auth"
  runtime = "cloudfront-js-1.0"
  code    = file("../functions/basic-auth.js")
}

#
# fusionauth-dev-response function - used as the viewer-response handler for many behaviors.
#
resource "aws_cloudfront_function" "fusionauth_dev_response" {
  name    = "fusionauth-dev-response"
  runtime = "cloudfront-js-1.0"
  code    = file("../functions/fusionauth-dev-response.js")
}

#
# fusionauth-dev-fix-webflow-redirect function
#
resource "aws_cloudfront_function" "fusionauth_dev_fix_webflow_redirect" {
  name    = "fusionauth-dev-fix-webflow-redirect"
  comment = "This fixes Webflow redirects to use the correct domain."
  runtime = "cloudfront-js-1.0"
  code    = file("../functions/fusionauth-dev-fix-webflow-redirect.js")
}
