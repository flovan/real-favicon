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
  var rfg_api = require('./lib/rfg_api.js').init();
  var cheerio = require("cheerio");

  function add_favicon_markups(file, html_code) {
    var content = fs.readFileSync(file);

    // The following lines were inspired by https://github.com/gleero/grunt-favicons
    var $ = cheerio.load(content);
    // Removing exists favicon from HTML
    $('link[rel="shortcut icon"]').remove();
    $('link[rel="icon"]').remove();
    $('link[rel="apple-touch-icon"]').remove();
    $('link[rel="apple-touch-icon-precomposed"]').remove();
    $('meta').each(function(i, elem) {
      var name = $(this).attr('name');
      if (name && (name === 'msapplication-TileImage' ||
                name === 'msapplication-TileColor' ||
                name.indexOf('msapplication-square') >= 0)) {
        $(this).remove();
      }
    });

    if ($('head').length > 0) {
      $('head').append(html_code);
    }
    else {
      $.root().append(html_code);
    }

    fs.writeFileSync(file, $.html());
  }

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
      request.master_picture.content = rfg_api.file_to_base64(params.src);
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
        request.favicon_design.ios.dedicated_picture = rfg_api.file_to_base64(request.favicon_design.ios.dedicated_picture);
      }
      if ((request.favicon_design.windows !== undefined) && (request.favicon_design.windows.picture_aspect === 'dedicated_picture')) {
        request.favicon_design.windows.dedicated_picture = rfg_api.file_to_base64(request.favicon_design.windows.dedicated_picture);
      }
    }
    // Settings
    request.settings = params.settings;

    rfg_api.generate_favicon(request, params.dest, function(favicon) {

        if (typeof html_files === 'string') {
          html_files = [html_files];
        }

        html_files.forEach(function(file) {
          console.log("Process " + file);

          if (! fs.existsSync(file)) {
            console.log("HTML file " + file + " does not exist");
          }

          add_favicon_markups(file, favicon.favicon.html_code);
        });

        return (params && params.callback) ? params.callback() : null;
    });
  }

  real_favicon();

};
