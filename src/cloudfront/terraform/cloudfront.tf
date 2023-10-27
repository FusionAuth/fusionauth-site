#
# basic-auth function - used as the viewer-request handler for most behaviors.
#
resource "aws_cloudfront_function" "dev_site_basic_auth" {
  name    = "dev-site-basic-auth"
  runtime = "cloudfront-js-1.0"
  code    = file("../functions/dev-site-basic-auth.js")
}

#
# dev-site-response function - used as the viewer-response handler for many behaviors.
#
resource "aws_cloudfront_function" "dev_site_response" {
  name    = "dev-site-response"
  runtime = "cloudfront-js-1.0"
  code    = file("../functions/dev-site-response.js")
}

#
# fusionauth-site cloudfront
#
module "fusionauth_dev_site" {
  source  = "terraform-aws-modules/cloudfront/aws"
  version = "3.2.1"

  # aliases = ["fusionauth.dev"]

  comment = "jj-test-distro"

  enabled             = true
  http_version        = "http2"
  is_ipv6_enabled     = true
  price_class         = "PriceClass_100"
  retain_on_delete    = false
  wait_for_deployment = false

  viewer_certificate = {
    acm_certificate_arn      = "arn:aws:acm:us-east-1:172023253951:certificate/fbe87f1f-f149-4313-a5ee-60e7229a5b70"
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }

  logging_config = {
    bucket = "fusionauth-dev-cloudfront-logs.s3.us-east-1.amazonaws.com"
    prefix = ""
  }

  custom_error_response = [{
    error_code         = "403"
    response_code      = "404"
    response_page_path = "/404.html"
  }]

  create_origin_access_identity = true
  origin_access_identities = {
    astro = "cloudfront access to astro s3 bucket"
  }

  create_origin_access_control = true
  origin_access_control = {
    astro = {
      description      = "cloudfront access to astro s3 bucket"
      origin_type      = "s3"
      signing_behavior = "always"
      signing_protocol = "sigv4"
    }
  }

  origin = {
    webflow = {
      domain_name = "webflow.fusionauth.dev"
      custom_origin_config = {
        origin_protocol_policy = "https-only"
        http_port              = 80
        https_port             = 443
        origin_ssl_protocols   = ["TLSv1.2"]
      }
    }
    nodebb = {
      domain_name = "fusionauth.nodebb.com"
      custom_origin_config = {
        origin_protocol_policy = "https-only"
        http_port              = 80
        https_port             = 443
        origin_ssl_protocols   = ["SSLv3"]
      }
    }
    astro = {
      domain_name = "fusionauth-dev-astro.s3.us-east-2.amazonaws.com"
      s3_origin_config = {
        origin_access_identity = "astro"
      }
    }
  }

  default_cache_behavior = {
    target_origin_id       = "webflow"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    use_forwarded_values   = false
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
  }

  ordered_cache_behavior = [
    {
      path_pattern           = "/community/forum/*"
      target_origin_id       = "nodebb"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD", "OPTIONS"]
      compress               = false
      use_forwarded_values   = false
      cache_policy_id        = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # Managed-CachingDisabled
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
        viewer-response = {
          function_arn = aws_cloudfront_function.dev_site_response.arn
        }
      }
    },
    {
      path_pattern           = "/img/*"
      target_origin_id       = "astro"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      use_forwarded_values   = false
      cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
        viewer-response = {
          function_arn = aws_cloudfront_function.dev_site_response.arn
        }
      }
      lambda_function_association = {
        origin-request = {
          lambda_arn = module.site_origin_request_handler.lambda_function_qualified_arn
        }
      }
    },
    {
      path_pattern           = "/js/*"
      target_origin_id       = "astro"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      use_forwarded_values   = false
      cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
        viewer-response = {
          function_arn = aws_cloudfront_function.dev_site_response.arn
        }
      }
      lambda_function_association = {
        origin-request = {
          lambda_arn = module.site_origin_request_handler.lambda_function_qualified_arn
        }
      }
    },
    {
      path_pattern           = "/css/*"
      target_origin_id       = "astro"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      use_forwarded_values   = false
      cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
        viewer-response = {
          function_arn = aws_cloudfront_function.dev_site_response.arn
        }
      }
      lambda_function_association = {
        origin-request = {
          lambda_arn = module.site_origin_request_handler.lambda_function_qualified_arn
        }
      }
    },
    {
      path_pattern           = "/docs/*"
      target_origin_id       = "astro"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      use_forwarded_values   = false
      cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
        viewer-response = {
          function_arn = aws_cloudfront_function.dev_site_response.arn
        }
      }
      lambda_function_association = {
        origin-request = {
          lambda_arn = module.site_origin_request_handler.lambda_function_qualified_arn
        }
      }
    },
    {
      path_pattern           = "/blog/*"
      target_origin_id       = "astro"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      use_forwarded_values   = false
      cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
        viewer-response = {
          function_arn = aws_cloudfront_function.dev_site_response.arn
        }
      }
      lambda_function_association = {
        origin-request = {
          lambda_arn = module.site_origin_request_handler.lambda_function_qualified_arn
        }
      }
    },
    {
      path_pattern           = "/articles/*"
      target_origin_id       = "astro"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      use_forwarded_values   = false
      cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
        viewer-response = {
          function_arn = aws_cloudfront_function.dev_site_response.arn
        }
      }
      lambda_function_association = {
        origin-request = {
          lambda_arn = module.site_origin_request_handler.lambda_function_qualified_arn
        }
      }
    },
    {
      path_pattern           = "/dev-tools/*"
      target_origin_id       = "astro"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      use_forwarded_values   = false
      cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
        viewer-response = {
          function_arn = aws_cloudfront_function.dev_site_response.arn
        }
      }
      lambda_function_association = {
        origin-request = {
          lambda_arn = module.site_origin_request_handler.lambda_function_qualified_arn
        }
      }
    },
    {
      path_pattern           = "/legal/*"
      target_origin_id       = "astro"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      use_forwarded_values   = false
      cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
        viewer-response = {
          function_arn = aws_cloudfront_function.dev_site_response.arn
        }
      }
      lambda_function_association = {
        origin-request = {
          lambda_arn = module.site_origin_request_handler.lambda_function_qualified_arn
        }
      }
    },
    {
      path_pattern           = "/resources/*"
      target_origin_id       = "astro"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      use_forwarded_values   = false
      cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
        viewer-response = {
          function_arn = aws_cloudfront_function.dev_site_response.arn
        }
      }
      lambda_function_association = {
        origin-request = {
          lambda_arn = module.site_origin_request_handler.lambda_function_qualified_arn
        }
      }
    },
    {
      path_pattern           = "/sitemap*"
      target_origin_id       = "astro"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      use_forwarded_values   = false
      cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
      }
      lambda_function_association = {
        origin-request = {
          lambda_arn = module.site_origin_request_handler.lambda_function_qualified_arn
        }
      }
    },
    {
      path_pattern           = "/robots.txt"
      target_origin_id       = "astro"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      use_forwarded_values   = false
      cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
      }
      lambda_function_association = {
        origin-request = {
          lambda_arn = module.site_origin_request_handler.lambda_function_qualified_arn
        }
      }
    },
    {
      path_pattern           = "/_astro/*"
      target_origin_id       = "astro"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      use_forwarded_values   = false
      cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
        viewer-response = {
          function_arn = aws_cloudfront_function.dev_site_response.arn
        }
      }
      lambda_function_association = {
        origin-request = {
          lambda_arn = module.site_origin_request_handler.lambda_function_qualified_arn
        }
      }
    },
    {
      path_pattern           = "/_pagefind/*"
      target_origin_id       = "astro"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      use_forwarded_values   = false
      cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
        viewer-response = {
          function_arn = aws_cloudfront_function.dev_site_response.arn
        }
      }
      lambda_function_association = {
        origin-request = {
          lambda_arn = module.site_origin_request_handler.lambda_function_qualified_arn
        }
      }
    },
    {
      path_pattern           = "/cdn/*"
      target_origin_id       = "astro"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      use_forwarded_values   = false
      cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
        viewer-response = {
          function_arn = aws_cloudfront_function.dev_site_response.arn
        }
      }
      lambda_function_association = {
        origin-request = {
          lambda_arn = module.site_origin_request_handler.lambda_function_qualified_arn
        }
      }
    },
    {
      path_pattern           = "/webfonts/*"
      target_origin_id       = "astro"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      use_forwarded_values   = false
      cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
      function_association = {
        viewer-request = {
          function_arn = aws_cloudfront_function.dev_site_basic_auth.arn
        }
        viewer-response = {
          function_arn = aws_cloudfront_function.dev_site_response.arn
        }
      }
      lambda_function_association = {
        origin-request = {
          lambda_arn = module.site_origin_request_handler.lambda_function_qualified_arn
        }
      }
    }
  ]
}
