#
# locals
#
locals {
  # These are here to give them descriptive names, because the values don't tell you what they are.
  acm_certificate = {
    fusionauth_dev = "arn:aws:acm:us-east-1:172023253951:certificate/fbe87f1f-f149-4313-a5ee-60e7229a5b70"
  }
  cache_policy = {
    caching_disabled  = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    caching_optimized = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }
  origin_request_policy = {
    all_viewer = "216adef6-5c7f-47e4-b989-5492eafa07d3"
  }
}
