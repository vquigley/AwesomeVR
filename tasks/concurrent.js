'use strict';


module.exports = function(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-concurrent');
	
    return {
                target: ['nodemon', 'browserSync'],
                        options: {
                logConcurrentOutput: true
            }
        }
};
