# Activate and configure extensions
# https://middlemanapp.com/advanced/configuration/#configuring-extensions

activate :external_pipeline,
  name: :brunch,
  command: build? ? './node_modules/brunch/bin/brunch build --production --env production' : './node_modules/brunch/bin/brunch watch --stdin',
  source: ".tmp/dist",
  latency: 1

activate :autoprefixer do |prefix|
  prefix.browsers = "last 2 versions"
end

# Layouts
# https://middlemanapp.com/basics/layouts/

# redirect "", to: "/desktop/getting-started/01-introduction"
# Per-page layout changes
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

activate :navtree do |options|
  options.data_file = 'tree.yml' # The data file where our navtree is stored.
  options.automatic_tree_updates = false # The tree.yml file will be updated automatically when source files are changed.
  options.ignore_files = ['sitemap.xml', 'robots.txt'] # An array of files we want to ignore when building our tree.
  options.ignore_dir = ['layouts', 'images', 'javascripts', 'stylesheets'] # An array of directories we want to ignore when building our tree.
  options.home_title = 'Home' # The default link title of the home page (located at "/"), if otherwise not detected.
  options.promote_files = ['index.html.erb', 'desktop/getting-started'] # Any files we might want to promote to the front of our navigation
  options.ext_whitelist = [] # If you add extensions (like '.md') to this array, it builds a whitelist of filetypes for inclusion in the navtree.
end
activate :directory_indexes # pretty urls
activate :syntax, :line_numbers => true
set :markdown_engine, :kramdown
# activate :lunr

# With alternative layout
page '/desktop/**/*', layout: 'layouts/desktop'
page '/sitemap', layout: 'layouts/desktop'

# Proxy pages
# https://middlemanapp.com/advanced/dynamic-pages/

# proxy(
#   '/this-page-has-no-template.html',
#   '/template-file.html',
#   locals: {
#     which_fake_page: 'Rendering a fake page with a local variable'
#   },
# )

# Helpers
# Methods defined in the helpers block are available in templates
# https://middlemanapp.com/basics/helper-methods/

# helpers do
#   def some_helper
#     'Helping'
#   end
# end

# Build-specific configuration
# https://middlemanapp.com/advanced/configuration/#environment-specific-settings

# configure :build do
#   activate :minify_css
#   activate :minify_javascript
# end