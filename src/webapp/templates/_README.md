<%= projectName %>
==================
> Super cool project

Folder Structure
----------------
    +- app
    |   +- models
    |   +- views
    |   +- controllers
    |   +- plugins
    |   +- helpers
    |   +- shims
    |   |- app.js
    |   |- router.js
    |   |- main.js
    |   |- config.js
    |   \- index.html
    +- assets
    |   +- fonts
    |   +- images
    |   +- templates<% if (!useLess && !useSass) { %>
    |   +- css
    |       \- style.css<% } else if (useLess) { %>
    |   +- less
    |       |- reset.less
    |       \- style.less<% } else if (useSass) { %>
    |   +- sass
    |       |- reset.scss
    |       \- style.scss<% } %>
    +- config
    |   |- .eslintrc.js
    |   |- default.js
    |   |- karma.conf.js
    |   \- stylelint.config.js
    +- tasks
    |   \- webapp.js
    +- test
    |   +- data
    |   +- mocha
    |       +- specs
    |   \- config.js
    |- GruntFile.js
    \- package.json
