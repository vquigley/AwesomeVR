'use strict';

module.exports = function mochacli(grunt) {
    // Load task
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    grunt.event.on('coverage', function(lcov, done){
        console.log(lcov);
        done(); // or done(false); in case of error
    });

    // Options
    return {
        coverage: {
            src: 'test/server',
            reportFormats: 'lcovonly'
        }
    };
};
