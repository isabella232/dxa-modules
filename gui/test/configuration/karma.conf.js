// Get the global config
// This file is part of Catalina and allows you to configure less
// Every setting can be overwritten in your config
// More info on: http://karma-runner.github.io/0.13/config/configuration-file.html
var globalConfig = require('../../node_modules/sdl-catalina/Test/Configuration/karma.conf.js');

module.exports = function (config) {
    globalConfig.configuration(config);

    config.set({
        basePath: '../../',
        /**
         * Always load these three files in the specified order.
         * Use file paths, not urls inside this configuration section.
         * Paths should be relative to the path of this config file.
         */
        files: [
            // React dependencies
            { pattern: './node_modules/react/dist/react-with-addons.js', watched: false },
            { pattern: './node_modules/react-dom/dist/react-dom.js', watched: false },
            { pattern: './node_modules/react-dom/dist/react-dom-server.js', watched: false },
            // Main configuration
            { pattern: 'dist/testConfiguration.bundle.js', watched: false },
            // Initialize the application
            { pattern: './node_modules/sdl-catalina/Common.debug/Library/Core/Packages/SDL.Client.Init.js', watched: false },
            // Fire test loader
            { pattern: './node_modules/sdl-catalina/Test/TestLoader.js', watched: false }
        ],

        /**
         * Proxies need to be configured in order to serve files to karma.
         * Karma sets up its own http server and only loads files defined in the "files" section of the config.
         *
         * We configure this inside the main gulp file as the port number is a dynamic property.
         */
        proxies: {
        },

        reporters: ['progress', 'coverage'],

        coverageReporter: { type: 'text-summary' }
    });
};
