require 'digest'
require 'fileutils'

module Jekyll
  class PlantumlGenerator < Generator
    def generate(site)
      Dir.glob("_diagrams/**/*.plantuml") do |file|
        slash_index = file.rindex("/")
        output_path = "assets/img/" + file[1, slash_index - 1] # The name includes _diagrams, so I just strip off the underscore
        output_dir = File.join(site.source, output_path)
        dot_index = file.rindex(".")
        file_name = file[slash_index + 1, dot_index - slash_index - 1] + ".svg"

        # Skip includes
        next if file_name.start_with?("_")

        # Check if the file needs to be re-generated
        output = File.join(output_dir, file_name)
        if !File.exist?(output) || File.mtime(output) < File.mtime(file)
          system("java -Djava.awt.headless=true -jar _plugins/plantuml.1.2019.2.jar -tsvg -nometadata -o #{output_dir} #{file}")
          site.static_files << Jekyll::StaticFile.new(site, site.source, output_path, file_name)
        end
      end
    end
  end
end