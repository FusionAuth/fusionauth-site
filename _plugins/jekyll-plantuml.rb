# (The MIT License)
#
# Copyright (c) 2014-2017 Yegor Bugayenko
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the 'Software'), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

require 'digest'
require 'fileutils'

module Jekyll
  class PlantumlBlock < Liquid::Tag
    def initialize(name, param, tokens)
      super
      @source = param.strip
    end

    def render(context)
      site = context.registers[:site]
      diagram = File.join(site.source, @source)
      unless File.exist?(diagram)
        raise "Missing diagram #{@source}"
      end

      slash_index = @source.rindex("/")
      dot_index = @source.rindex(".")
      output_path = "assets/img/" + @source[1, slash_index - 1] # The name includes _diagrams, so I just strip off the underscore
      output_dir = File.join(site.source, output_path)
      file_name = @source[slash_index + 1, dot_index - slash_index - 1] + ".svg"
      output = File.join(output_dir, file_name)
      if File.exist?(output)
        File.delete(output)
      end

      system("java -Djava.awt.headless=true -jar _plugins/plantuml.1.2019.2.jar -tsvg -nometadata -o #{output_dir} #{diagram}")
      site.static_files << Jekyll::StaticFile.new(site, site.source, output_path, file_name)
      "<figure class='mw-100 mx-auto mb-4 text-center'>
        <img src='#{site.baseurl}/#{output_path}/#{file_name}' alt='Sequence diagram for the workflow'/>
        <figcaption class='figure-caption'>Sequence diagram for the workflow</figcaption>
      </figure>"
    end
  end
end

Liquid::Template.register_tag('plantuml', Jekyll::PlantumlBlock)