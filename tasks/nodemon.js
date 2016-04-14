'use strict';


module.exports = function nodemon(grunt) {
    
    grunt.loadNpmTasks('grunt-nodemon');
	
	return {
		script: 'server.js',
        nodeArgs: ['--debug'],
        "ignore": ["public/**/*.*"] 
	};
};
