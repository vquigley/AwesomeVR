'use strict';


module.exports = function requirejs(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-contrib-requirejs');

	// Options
	return {
        build: {
            options: {
				mainConfigFile: 'public/js/requireConf.js',
                baseUrl: 'public',
                dir: '.build',
                optimize: 'uglify',
                modules: [
                    { name: 'js/app' }
                ]
            }
        }
	};
};
