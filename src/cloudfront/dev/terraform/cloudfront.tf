#
# cloudfront for fusionauth.dev site
#
resource "aws_cloudfront_distribution" "fusionauth_dev_site" {
  aliases             = ["fusionauth.dev"]
  comment             = "fusionauth.dev"
  enabled             = true
  http_version        = "http2"
  is_ipv6_enabled     = true
  price_class         = "PriceClass_100"
  retain_on_delete    = false
  wait_for_deployment = true

  # Community forums
  origin {
    domain_name = "fusionauth.nodebb.com"
    origin_id   = "fusionauth.nodebb.com"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["SSLv3", "TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }
  # New site.
  origin {
    domain_name              = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    origin_id                = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    origin_access_control_id = "E2EQIBLOLKM4ZQ"
  }
  # Old site. Some behaviors are still using this.
  origin {
    domain_name              = "fusionauth-dev-site.s3.us-east-2.amazonaws.com"
    origin_id                = "fusionauth-dev-site.s3.us-east-2.amazonaws.com"
    origin_access_control_id = "E38FYPU7E1AY7S"
  }
  # Default origin. Requests that aren't caught by any other behaviors go here.
  origin {
    domain_name = "webflow.fusionauth.dev"
    origin_id   = "webflow.fusionauth.dev"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 10
  }

  logging_config {
    bucket = "fusionauth-dev-cloudfront-logs.s3.amazonaws.com"
  }

  restrictions {
    geo_restriction {
      locations        = []
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn            = local.acm_certificate.fusionauth_dev
    cloudfront_default_certificate = false
    minimum_protocol_version       = "TLSv1.2_2021"
    ssl_support_method             = "sni-only"
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    target_origin_id       = "webflow.fusionauth.dev"
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_fix_webflow_redirect.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern             = "/community/forum/*"
    target_origin_id         = "fusionauth.nodebb.com"
    allowed_methods          = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    compress                 = false
    cache_policy_id          = local.cache_policy.caching_disabled
    origin_request_policy_id = local.origin_request_policy.all_viewer
    viewer_protocol_policy   = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
  }

  ordered_cache_behavior {
    path_pattern             = "/community/forum"
    target_origin_id         = "fusionauth.nodebb.com"
    allowed_methods          = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    compress                 = false
    cache_policy_id          = local.cache_policy.caching_disabled
    origin_request_policy_id = local.origin_request_policy.all_viewer
    viewer_protocol_policy   = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/blog/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/docs/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/legal/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/resources/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/direct-download"
    target_origin_id       = "fusionauth-dev-site.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/license"
    target_origin_id       = "fusionauth-dev-site.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/robots.txt"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/sitemap*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/landing/*"
    target_origin_id       = "fusionauth-dev-site.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/articles/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/dev-tools/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/css/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/img/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/js/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/webfonts/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/_astro/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/_pagefind/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/favicon.svg"
    target_origin_id       = "fusionauth-dev-site.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/cdn/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy.caching_optimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basic_auth.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.fusionauth_dev_response.arn
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = module.site_origin_request_handler.lambda_function_qualified_arn
    }
  }
}

#
# origin access control for astro s3 bucket
#
resource "aws_cloudfront_origin_access_control" "astro" {
  name                              = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
