#
# locals
#
locals {
  # These are here to give them descriptive names, because the values don't tell you what they are.
  acm_certificate = {
    fusionauth_dev = "arn:aws:acm:us-east-1:172023253951:certificate/fbe87f1f-f149-4313-a5ee-60e7229a5b70"
  }
  managed_cache_policy = {
    caching_optimized = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    caching_disabled  = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  }
}
