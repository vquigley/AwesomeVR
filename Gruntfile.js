'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-force-task');
    
    // Load the project's grunt tasks from a directory
    require('grunt-config-dir')(grunt, {
        configDir: require('path').resolve('tasks')
    }, function(err){ grunt.log.error(err) });

    var force = "";
    
    if (process.env.NODE_ENV === "test") {
        force = "force:";
    }
    grunt.loadNpmTasks('grunt-makara-amdify');
    
    // Register group tasks
    grunt.registerTask('build', ['copyto', 'requirejs', 'less', 'dustjs']);

    grunt.registerTask('test', [force + 'mocha_istanbul']);
    
    grunt.registerTask('startDev', ['concurrent']);
};
