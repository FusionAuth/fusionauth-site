hash_in_hex = "25d55ad283aa400af464c76d713c07ad"

def hex_to_base64_digest(hexdigest)
  [[hexdigest].pack("H*")].pack("m0")
end

puts hex_to_base64_digest(hash_in_hex)
