exports.config = {
	overrides: {
		production: {
			paths: {
				public: "build"
			}
		}
	},
  // See http://brunch.io/#documentation for docs.
  files: {
    javascripts: {
      joinTo: "javascripts/site.js"

      // To use a separate vendor.js bundle, specify two files path
      // http://brunch.io/docs/config#-files-
      // joinTo: {
      //  "js/app.js": /^(web\/static\/js)/,
      //  "js/vendor.js": /^(web\/static\/vendor)|(deps)/
      // }
      //
      // To change the order of concatenation of files, explicitly mention here
      // order: {
      //   before: [
      //     "web/static/vendor/js/jquery-2.1.1.js",
      //     "web/static/vendor/js/bootstrap.min.js"
      //   ]
      // }
    },
    stylesheets: {
      joinTo: "stylesheets/site.css",
      order: {
        after: ["source/stylesheets/site.css"] // concat app.css last
      }
    },
    templates: {
      joinTo: "javascripts/all.js"
    }
  },

  conventions: {
    // This option sets where we should place non-css and non-js assets in.
    // By default, we set this to "/web/static/assets". Files in this directory
    // will be copied to `paths.public`, which is "priv/static" by default.
    assets: /^(source\/assets)/
  },

  // Phoenix paths configuration
  paths: {
    // Dependencies and current project directories to watch
    watched: [
      "source/javascripts",
      "source/stylesheets",
      "source/assets",
      "test/static"
    ],

    // Where to compile files to
    public: ".tmp/dist"
  },

  // Configure your plugins
  plugins: {
    postcss: {
      processors: [
        require('autoprefixer')(['last 8 versions']),
        require('csswring')(),
        require('tailwindcss')('./tailwind.js')
      ]
    },
    // imageoptimizer: {
    //   smushit: false, // if false it use jpegtran and optipng, if set to true it will use smushit
    //   path: 'images' // your image path within your public folder
    // },
    autoReload: {
      enabled: {
        css: true,
        js: true,
        assets: true
      },
      match: {
        stylesheets: ['*.scss', '*.css', '*.jpg', '*.png'],
        javascripts: ['*.js']
      }
    },
    babel: {
      // Do not use ES6 compiler in vendor code
      ignore: [/source\/vendor/],
			presets: ['es2015', 'es2016']
    },
		sass: {
      debug: 'comments',
      options: {
        includePaths: [
          // "node_modules/bourbon/app/assets/stylesheets", 
          // "node_modules/font-awesome/scss",
          // "node_modules/bourbon-neat/app/assets/stylesheets"
        ], // tell sass-brunch where to look for files to @import
        precision: 8 // minimum precision required by bootstrap-sass
      }
    },
    copycat: {
      "fonts": ["node_modules/font-awesome/fonts"] // copy node_modules/bootstrap-sass/assets/fonts/bootstrap/* to priv/static/fonts/
    }
  },

  modules: {
    autoRequire: {
      "javascripts/all.js": ["source/javascripts/all"]
    }
  },

  npm: {
    enabled: true,
		whitelist: ["turbolinks", "cash-dom"],
		globals: { // bootstrap-sass' JavaScript requires both '$' and 'jQuery' in global scope
      // $: 'jquery',
      // jQuery: 'jquery'
    }
  }
};

