# this hook adds the copy/paste attributes to any highlighted blog post sections. 
# they are then picked up by javascript in the browser, allowing the user to copy the contents easily.

Jekyll::Hooks.register :posts, :post_render do |post|
   # look for pre tags with highlight class, 
   # add <i class="cursor-pointer fal fa-fw fa-copy" data-widget="copy-button" style="float:right"></i>
   # as the first child
   post.output.gsub!('<pre class="highlight">','<pre class="highlight"><i class="cursor-pointer fal fa-fw fa-copy" data-widget="copy-button" style="float:right"></i>')
   
end
