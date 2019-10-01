require 'digest'
require 'fileutils'

module Jekyll
  class PlantumlGenerator < Generator
    def generate(site)
      Dir.glob("#{site.source}/_diagrams/**/*.plantuml") do |file|
        slash_index = file.rindex("/")

        output_dir = "#{site.source}/assets/img/" + file[site.source.length + 2, slash_index - site.source.length - 1] # The name includes _diagrams, so I just strip off the underscore
        dot_index = file.rindex(".")
        file_name = file[slash_index + 1, dot_index - slash_index - 1] + ".svg"

        # Skip includes
        next if file_name.start_with?("_")

        # Check if the file needs to be re-generated
        output = File.join(output_dir, file_name)
        if !File.exist?(output) || File.mtime(output) < File.mtime(file)
          system("java -Djava.awt.headless=true -jar #{site.source}/_plugins/plantuml.1.2019.2.jar -tsvg -nometadata -o #{output_dir} #{file}")
          site.static_files << Jekyll::StaticFile.new(site, site.source, output_dir, file_name)
        end
      end
    end
  end
end
