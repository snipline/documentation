# Snipline Documentation

## Deployments are done through Netlify CLI

* Build the project with `bundle exec middleman build`
* Remove the segment in site.js at the bottom for WebSockets (bug)
* Run `netlify deploy`