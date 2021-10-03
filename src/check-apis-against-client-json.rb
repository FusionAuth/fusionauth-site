require 'json'
require 'net/http'
require 'uri'

# this requires you to have fusionauth-client-builder checked out in the grandparent directory (../..)

def todash(camel_cased_word)
  camel_cased_word.to_s.gsub(/::/, '/').
  gsub(/([A-Z]+)([A-Z][a-z])/,'\1-\2').
  gsub(/([a-z\d])([A-Z])/,'\1-\2').
  downcase
end

def open(url)
  Net::HTTP.get(URI.parse(url))
end

def downcase(string) 
  # downcase all upper case until we see a lowercase, JWT, APIKey special cased
  dcs = "";
  if string[0..2] == "JWT"
    dcs = "jwt"+string[3..-1]
  elsif string[0..3] == "APIK"
    dcs = "apiK"+string[4..-1]
  else 
    first_lc = string.index(/[a-z]/)
    if first_lc
      dcs = string[0..first_lc-1].downcase + string[first_lc..-1]
    else 
      dcs = string
    end
  end
  dcs
end


def process_file(fn, missing_fields, prefix = "", type = nil, page_content = nil)
  known_types = ["ZoneId", "LocalDate", "char", "HTTPHeaders", "LocalizedStrings", "int", "URI", "Object", "String", "Map", "long", "ZonedDateTime", "List", "boolean", "UUID", "Set" ]
  f = File.open(fn)
  fs = f.read
  json = JSON.parse(fs)
  f.close
  
  if type 
    # type is passed in. sometimes the field name is not the same as the type applicationEmailConfiguration being an example, it is actually emailConfiguration 
    t = type
  else
    t = json["type"]
    t = downcase(t)
  end
  #unless t == "authenticationTokenConfiguration" || t == "application"
    #return
  #end
  if prefix != "" 
    # add previous objects if present
    t = prefix+"."+t
  end
  puts "processing " + t
  unless page_content
    # we are in leaf object, we don't need to pull the page content
    api_url = "https://fusionauth.io/docs/v1/tech/apis/"+todash(t)+"s/"
    page_content = open(api_url)
  end
  #p api_url
  #p page_content
  
  fields = json["fields"]
  extends = json["extends"]
  
  # if we extend a class, we need to add those fields to our existing fields
  extends && extends.length > 0 && extends.each do |ex|
    unless fields && fields.length > 0
      fields = {}
    end
    files = Dir.glob("../../fusionauth-client-builder/src/main/domain/io.fusionauth.domain.*"+ex["type"]+".json")
    file = files[0]
    ef = File.open(file)
    efs = ef.read
    ejson = JSON.parse(efs)
    ef.close
    fields = fields.merge(ejson["fields"])
    #puts fields
  end
  
  fields && fields.length > 0 && fields.each do |fi| 
    field_type = fi[1]["type"]
    field_name = fi[0].to_s
    full_field_name = "xxxxxxx"
    if known_types.include? field_type
      full_field_name = t.to_s + "." + field_name
      if ! page_content.include? full_field_name 
        unless /[^.]*\.tenantId/.match(full_field_name) || /user\.salt/.match(full_field_name)
          # okay to have tenantId missing, as that is handled implicitly via API key locking or header if there is more than one tenant
          # other fields in this regexp ok to omit as well
          # p field_name + " MISSING, looked for "+full_field_name 
          missing_fields.append(full_field_name)
        end
      end
    else
      #p "need to look up other object for type " + field_type
      files = Dir.glob("../../fusionauth-client-builder/src/main/domain/io.fusionauth.domain.*"+field_type+".json")
      file = files[0]
      if file
        process_file(file, missing_fields, t, field_name, page_content)
      else
        p "couldn't find file for "+field_type
      end
    end
  end
end


#files = Dir.glob("../../fusionauth-client-builder/src/main/domain/*AuditLog.json")

files = [
  "../../fusionauth-client-builder/src/main/domain/io.fusionauth.domain.Group.json",
  "../../fusionauth-client-builder/src/main/domain/io.fusionauth.domain.AuditLog.json",
  "../../fusionauth-client-builder/src/main/domain/io.fusionauth.domain.UserAction.json",
  "../../fusionauth-client-builder/src/main/domain/io.fusionauth.domain.Theme.json",
  "../../fusionauth-client-builder/src/main/domain/io.fusionauth.domain.Key.json",
  "../../fusionauth-client-builder/src/main/domain/io.fusionauth.domain.APIKey.json",
  "../../fusionauth-client-builder/src/main/domain/io.fusionauth.domain.Webhook.json",
  "../../fusionauth-client-builder/src/main/domain/io.fusionauth.domain.Lambda.json",
  "../../fusionauth-client-builder/src/main/domain/io.fusionauth.domain.Application.json",
  "../../fusionauth-client-builder/src/main/domain/io.fusionauth.domain.Tenant.json",
  "../../fusionauth-client-builder/src/main/domain/io.fusionauth.domain.User.json",
]

missing_fields = []

files.each do |fn|
  process_file(fn, missing_fields)
end

puts "\n\nMISSING FIELDS"
puts missing_fields

if missing_fields.length > 0 
  exit(false)
else
  exit(true)
end
