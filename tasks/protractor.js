'use strict';

module.exports = function dustjs(grunt) {
  grunt.loadNpmTasks('grunt-protractor-runner');

  return {
    options: {
      configFile: "./test/client/protractor.conf.js", // Default config file 
      keepAlive: true, // If false, the grunt process stops when the test fails. 
      noColor: false, // If true, protractor will not use colors in its output. 
      webdriverManagerUpdate: true,
      args: {
        // Arguments passed to the command 
      }
    },
    all: {}  
  };
};
