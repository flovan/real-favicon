/*
 * real-favicon
 * https://github.com/RealFaviconGenerator/real-favicon
 *
 * Copyright (c) 2014 Philippe Bernard
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(params) {

  var fs = require('fs');
  var api = require('rfg-api').init();

  function starts_with(str, prefix) {
    return str.lastIndexOf(prefix, 0) === 0;
  }

  function is_url(url_or_path) {
    return starts_with(url_or_path, 'http://') ||
      starts_with(url_or_path, 'https://') ||
      starts_with(url_or_path, '//');
  }

  function real_favicon() {

    var html_files = params.html;

    // Build favicon generation request
    var request = {};
    request.api_key = 'f26d432783a1856427f32ed8793e1d457cc120f1';
    // Master picture
    request.master_picture = {};
    if (is_url(params.src)) {
      request.master_picture.type = 'url';
      request.master_picture.url = params.src;
    }
    else {
      request.master_picture.type = 'inline';
      request.master_picture.content = api.file_to_base64(params.src);
    }
    // Path
    request.files_location = {};
    if (params.icons_path === undefined) {
      request.files_location.type = 'root';
    }
    else {
      request.files_location.type = 'path';
      request.files_location.path = params.icons_path;
    }
    // Design
    request.favicon_design = params.design;
    if (request.favicon_design !== undefined) {
      if ((request.favicon_design.ios !== undefined) && (request.favicon_design.ios.picture_aspect === 'dedicated_picture')) {
        request.favicon_design.ios.dedicated_picture = api.file_to_base64(request.favicon_design.ios.dedicated_picture);
      }
      if ((request.favicon_design.windows !== undefined) && (request.favicon_design.windows.picture_aspect === 'dedicated_picture')) {
        request.favicon_design.windows.dedicated_picture = api.file_to_base64(request.favicon_design.windows.dedicated_picture);
      }
    }
    // Settings
    request.settings = params.settings;

    api.generate_favicon(request, params.dest, function(favicon) {

        if (typeof html_files === 'string') {
          html_files = [html_files];
        }

        html_files.forEach(function(file) {

          if (! fs.existsSync(file)) {
            throw "HTML file " + file + " does not exist";
          }

          api.generate_favicon_markups(file, favicon.favicon.html_code, function(code) {
            fs.writeFileSync(file, code);
          });
        });

        return (params && params.callback) ? params.callback() : null;
    });
  }

  real_favicon();

};
