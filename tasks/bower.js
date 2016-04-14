'use strict';


module.exports = function bower(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-bower-task');
	
	// Options
	return { 
		bower: {
			install: {
				
			},
			options: {
					copy:false
				}
		}
	}
};
