const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable better source maps for debugging
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    // Keep classnames and function names for better error stack traces
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
  // Android-specific optimizations
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Resolver configuration for Android asset loading
config.resolver = {
  ...config.resolver,
  // Ensure proper module resolution for Android
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
  assetExts: [
    ...config.resolver.assetExts.filter((ext) => ext !== 'svg'),
    'db',
    'mp3',
    'ttf',
    'otf',
    'png',
    'jpg',
  ],
};

// Server configuration for better development experience
config.server = {
  ...config.server,
  // Enhanced logging for debugging
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Log requests in development
      if (__DEV__ && req.url.includes('bundle')) {
        console.log(`[Metro] ${req.method} ${req.url.substring(0, 50)}...`);
      }
      return middleware(req, res, next);
    };
  },
  // Increase timeout for slower Android devices
  rewriteRequestUrl: (url) => {
    return url;
  },
};

// Watchman configuration (optional, improves file watching on large projects)
config.watchFolders = [__dirname];

// Reset cache on Android issues
config.resetCache = true;

module.exports = config;
