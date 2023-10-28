#
# origin access control for astro s3 bucket
#
resource "aws_cloudfront_origin_access_control" "astro" {
  name                              = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

#
# basic-auth function - used as the viewer-request handler for most behaviors.
#
resource "aws_cloudfront_function" "basic_auth" {
  name    = "basic-auth"
  runtime = "cloudfront-js-1.0"
  code    = file("../functions/basic-auth.js")
}

#
# dev-site-response function - used as the viewer-response handler for many behaviors.
#
resource "aws_cloudfront_function" "fusionauth_dev_response" {
  name    = "fusionauth-dev-response"
  runtime = "cloudfront-js-1.0"
  code    = file("../functions/fusionauth-dev-response.js")
}

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

  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 10
  }

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
  origin {
    domain_name              = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    origin_id                = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    origin_access_control_id = "E2EQIBLOLKM4ZQ"
  }
  origin {
    domain_name              = "fusionauth-dev-site.s3.us-east-2.amazonaws.com"
    origin_id                = "fusionauth-dev-site.s3.us-east-2.amazonaws.com"
    origin_access_control_id = "E38FYPU7E1AY7S"
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
    acm_certificate_arn            = "arn:aws:acm:us-east-1:172023253951:certificate/fbe87f1f-f149-4313-a5ee-60e7229a5b70"
    cloudfront_default_certificate = false
    minimum_protocol_version       = "TLSv1.2_2021"
    ssl_support_method             = "sni-only"
  }

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    target_origin_id       = "webflow.fusionauth.dev"
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-website-request-handler"
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-dev-fix-webflow-redirect"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/community/forum/*"
    target_origin_id       = "fusionauth.nodebb.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    compress               = false
    cache_policy_id        = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # Managed-CachingDisabled
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-website-request-handler"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/img/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/basic-auth"
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-dev-response"
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = "arn:aws:lambda:us-east-1:172023253951:function:cloudfront-redirect:20"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/js/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/basic-auth"
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-dev-response"
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = "arn:aws:lambda:us-east-1:172023253951:function:cloudfront-redirect:20"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/css/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/basic-auth"
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-dev-response"
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = "arn:aws:lambda:us-east-1:172023253951:function:cloudfront-redirect:20"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/docs/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/basic-auth"
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-dev-response"
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = "arn:aws:lambda:us-east-1:172023253951:function:cloudfront-redirect:20"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/blog/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/basic-auth"
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-dev-response"
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = "arn:aws:lambda:us-east-1:172023253951:function:cloudfront-redirect:20"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/articles/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/basic-auth"
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-dev-response"
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = "arn:aws:lambda:us-east-1:172023253951:function:cloudfront-redirect:20"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/dev-tools/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/basic-auth"
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-dev-response"
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = "arn:aws:lambda:us-east-1:172023253951:function:cloudfront-redirect:20"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/legal/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/basic-auth"
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-dev-response"
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = "arn:aws:lambda:us-east-1:172023253951:function:cloudfront-redirect:20"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/resources/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/basic-auth"
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-dev-response"
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = "arn:aws:lambda:us-east-1:172023253951:function:cloudfront-redirect:20"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/sitemap*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/basic-auth"
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = "arn:aws:lambda:us-east-1:172023253951:function:cloudfront-redirect:20"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/robots.txt"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/basic-auth"
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = "arn:aws:lambda:us-east-1:172023253951:function:cloudfront-redirect:20"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/_astro/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/basic-auth"
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-dev-response"
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = "arn:aws:lambda:us-east-1:172023253951:function:cloudfront-redirect:20"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/_pagefind/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/basic-auth"
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-dev-response"
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = "arn:aws:lambda:us-east-1:172023253951:function:cloudfront-redirect:20"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/cdn/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/basic-auth"
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-dev-response"
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = "arn:aws:lambda:us-east-1:172023253951:function:cloudfront-redirect:20"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/webfonts/*"
    target_origin_id       = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    viewer_protocol_policy = "redirect-to-https"
    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::172023253951:function/basic-auth"
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = "arn:aws:cloudfront::172023253951:function/fusionauth-dev-response"
    }
    lambda_function_association {
      event_type   = "origin-request"
      include_body = false
      lambda_arn   = "arn:aws:lambda:us-east-1:172023253951:function:cloudfront-redirect:20"
    }
  }
}
