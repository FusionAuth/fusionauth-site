#
# cloudfront for fusionauth.dev site
#
resource "aws_cloudfront_distribution" "fusionauth_prod_site" {
  aliases             = ["fusionauth.io", "www.fusionauth.io"]
  comment             = "FusionAuth website and forum"
  enabled             = true
  http_version        = "http2"
  is_ipv6_enabled     = true
  price_class         = "PriceClass_All"
  retain_on_delete    = false
  wait_for_deployment = true

  # This is not used!
  origin {
    domain_name = "fusionauth.nodebb.com"
    origin_id   = "fusionauth.nodebb.com"
    custom_header {
      name  = "x-forwarded-host"
      value = "forum.fusionauth.io"
    }
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Old site
  origin {
    domain_name = "fusionauth-io-website-2022.s3-website-us-east-1.amazonaws.com"
    origin_id   = "fusionauth-io-website-2022.s3-website-us-east-1.amazonaws.com"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }

  # New site
  origin {
    domain_name = "fusionauth-io-website-2023.s3-website-us-east-1.amazonaws.com"
    origin_id   = "fusionauth-io-website-2023.s3.us-east-1.amazonaws.com"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Community forums
  origin {
    domain_name = "forum.fusionauth.io"
    origin_id   = "forum.fusionauth.io"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # This is not used!
  origin {
    domain_name = "fusionauth.webflow.io"
    origin_id   = "fusionauth.webflow.io"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
    origin_shield {
      enabled              = true
      origin_shield_region = "us-west-2"
    }
  }

  # Webflow
  origin {
    domain_name = "webflow.fusionauth.io"
    origin_id   = "webflow.fusionauth.io"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
    origin_shield {
      enabled              = true
      origin_shield_region = "us-west-2"
    }
  }

  # New site - OAC
  origin {
    domain_name              = "fusionauth-io-website-2023.s3.us-east-1.amazonaws.com"
    origin_id                = "website-2023-S3"
    origin_access_control_id = "E8TFVBUWC8MJ2"
  }

  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404"
    error_caching_min_ttl = 10
  }

  logging_config {
    bucket          = "fusionauth-io-website-2022-logs.s3.amazonaws.com"
    prefix          = "fusionauth-io-logs"
    include_cookies = true
  }

  restrictions {
    geo_restriction {
      locations        = []
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn            = local.acm_certificate.fusionauth_io
    cloudfront_default_certificate = false
    minimum_protocol_version       = "TLSv1.2_2021"
    ssl_support_method             = "sni-only"
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    target_origin_id       = "webflow.fusionauth.io"
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern             = "/community/forum/*"
    target_origin_id         = "forum.fusionauth.io"
    allowed_methods          = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    compress                 = false
    cache_policy_id          = local.cache_policy.caching_disabled
    origin_request_policy_id = local.origin_request_policy.all_viewer
    viewer_protocol_policy   = "redirect-to-https"
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern             = "/community/forum"
    target_origin_id         = "forum.fusionauth.io"
    allowed_methods          = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    compress                 = false
    cache_policy_id          = local.cache_policy.caching_disabled
    origin_request_policy_id = local.origin_request_policy.all_viewer
    viewer_protocol_policy   = "redirect-to-https"
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  # TO BE REMOVED!
  ordered_cache_behavior {
    path_pattern           = "/assets/*"
    target_origin_id       = "fusionauth-io-website-2022.s3-website-us-east-1.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/blog/*"
    target_origin_id       = "website-2023-S3"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  # TO BE REMOVED!
  ordered_cache_behavior {
    path_pattern           = "/docs/quickstarts/*"
    target_origin_id       = "website-2023-S3"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  # TO BE REMOVED!
  ordered_cache_behavior {
    path_pattern           = "/docs/"
    target_origin_id       = "website-2023-S3"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/docs/*"
    target_origin_id       = "fusionauth-io-website-2022.s3-website-us-east-1.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  # TO BE REMOVED!
  ordered_cache_behavior {
    path_pattern           = "/learn/*"
    target_origin_id       = "fusionauth-io-website-2022.s3-website-us-east-1.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/legal/*"
    target_origin_id       = "fusionauth-io-website-2022.s3-website-us-east-1.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/resources/*"
    target_origin_id       = "fusionauth-io-website-2022.s3-website-us-east-1.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/direct-download"
    target_origin_id       = "fusionauth-io-website-2022.s3-website-us-east-1.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/license"
    target_origin_id       = "fusionauth-io-website-2022.s3-website-us-east-1.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/robots.txt"
    target_origin_id       = "fusionauth-io-website-2022.s3-website-us-east-1.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/sitemap*"
    target_origin_id       = "fusionauth-io-website-2023.s3.us-east-1.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/landing/*"
    target_origin_id       = "fusionauth-io-website-2022.s3-website-us-east-1.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  # TO BE REMOVED!
  ordered_cache_behavior {
    path_pattern           = "/how-to/*"
    target_origin_id       = "fusionauth-io-website-2022.s3-website-us-east-1.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
  }


  ordered_cache_behavior {
    path_pattern           = "/articles/*"
    target_origin_id       = "fusionauth-io-website-2023.s3.us-east-1.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/dev-tools/*"
    target_origin_id       = "fusionauth-io-website-2023.s3.us-east-1.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/css/*"
    target_origin_id       = "fusionauth-io-website-2023.s3.us-east-1.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/img/*"
    target_origin_id       = "fusionauth-io-website-2023.s3.us-east-1.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/js/*"
    target_origin_id       = "fusionauth-io-website-2023.s3.us-east-1.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/webfonts/*"
    target_origin_id       = "fusionauth-io-website-2023.s3.us-east-1.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/_astro/*"
    target_origin_id       = "fusionauth-io-website-2023.s3.us-east-1.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/_pagefind/*"
    target_origin_id       = "fusionauth-io-website-2023.s3.us-east-1.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/favicon.svg"
    target_origin_id       = "fusionauth-io-website-2022.s3-website-us-east-1.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/cdn/*"
    target_origin_id       = "fusionauth-io-website-2023.s3.us-east-1.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.fusionauth_website_request_handler.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_security_headers.arn
    }
  }
}

#
# origin access control for astro s3 bucket
#
resource "aws_cloudfront_origin_access_control" "astro" {
  name                              = "fusionauth-io-website-2023.s3.us-east-1.amazonaws.com"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
