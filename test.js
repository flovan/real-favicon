var real_favicon = require('./index.js');
real_favicon({
  // The favicon master picture
  src: 'test/sample_picture.png',
  // Directory where the generated pictures will be stored
  dest: 'test/favicons/',
  // Path to icon (eg. favicon.ico will be accessible through http://mysite.com/path/to/icons/favicon.ico)
  icons_path: 'favicons/',
  // HTML files where the favicon code should be inserted
  html: 'test/test.html',
  design: {
    // These options reflect the settings available in RealFaviconGenerator
    ios: {
      picture_aspect: 'background_and_margin',
      background_color: '#654321',
      margin: 4
    },
    windows: {
      picture_aspect: 'white_silhouette',
      background_color: '#123456'
    }
  },
  settings: {
    // 0 = no compression, 5 = maximum compression
    compression: 5,
    // Default is Mitchell
    scaling_algorithm: 'NearestNeighbor'
  }
});
