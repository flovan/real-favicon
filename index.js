/*
 * real-favicon
 * https://github.com/RealFaviconGenerator/real-favicon
 *
 * Copyright (c) 2014 Philippe Bernard & Hayden Bleasel
 * Licensed under the MIT license.
 */

/*jslint node:true*/
module.exports = function (params) {

    'use strict';

    var fs = require('fs'),
        api = require('rfg-api').init(),
        async = require('async');

    function starts_with(str, prefix) {
        return str.lastIndexOf(prefix, 0) === 0;
    }

    function is_url(str) {
        return starts_with(str, 'http://') || starts_with(str, 'https://') || starts_with(str, '//');
    }

    function make_favicons(file, favicon, callback) {
        fs.exists(file, function (exists) {
            if (exists) {
                api.generate_favicon_markups(file, favicon.favicon.html_code, params.tags, function (html, add) {
                    fs.writeFile(file, html, function (err) {
                        if (err) throw err;
                        callback(html);
                    })
                });
            } else {
                fs.writeFile(file, favicon.favicon.html_code, function (err) {
                    if (err) throw err;
                    callback(favicon.favicon.html_code);
                });
            }
        });
    }

    function real_favicon() {
        var html_files = typeof params.html === 'string' ? [params.html] : params.html,
            request = {
                api_key: 'f26d432783a1856427f32ed8793e1d457cc120f1',
                master_picture: {},
                files_location: {},
                favicon_design: params.design,
                settings: params.settings
            };

        if (params.icons_path === undefined) {
            request.files_location.type = 'root';
        } else {
            request.files_location.type = 'path';
            request.files_location.path = params.icons_path;
        }

        async.waterfall([
            function (callback) {
                if (is_url(params.src)) {
                    request.master_picture.type = 'url';
                    request.master_picture.url = params.src;
                    callback(null);
                } else {
                    request.master_picture.type = 'inline';
                    api.file_to_base64(params.src, function (file) {
                        request.master_picture.content = file;
                        callback(null);
                    });
                }
            },
            function (callback) {
                if (request.favicon_design !== undefined) {
                    if ((request.favicon_design.windows !== undefined) && (request.favicon_design.windows.picture_aspect === 'dedicated_picture')) {
                        api.file_to_base64(request.favicon_design.windows.dedicated_picture, function(file) {
                            request.favicon_design.windows.dedicated_picture = file;
                            callback(null);
                        });
                    } else {
                        callback(null);
                    }
                } else {
                    callback(null);
                }
            },
            function (callback) {
                if (request.favicon_design !== undefined) {
                    if ((request.favicon_design.ios !== undefined) && (request.favicon_design.ios.picture_aspect === 'dedicated_picture')) {
                        api.file_to_base64(request.favicon_design.ios.dedicated_picture, function(file) {
                            request.favicon_design.ios.dedicated_picture = file;
                            callback(null);
                        });
                    } else {
                        callback(null);
                    }
                } else {
                    callback(null);
                }
            },
            function (callback) {
                api.generate_favicon(request, params.dest, function(favicon) {
                    return callback(null, favicon);
                });
            },
            function (favicon, callback) {
                var codes = [];
                async.each(html_files, function(html, callback) {
                    make_favicons(html, favicon, function (code) {
                        codes.push(code);
                        callback(null, code);
                    });
                }, function (err, files) {
                    return callback(err, codes);
                });
            },
        ], function (err, codes) {
            if (err) throw err;
            return (params && params.callback) ? params.callback(codes) : null;
        });

    }

    real_favicon();

};
