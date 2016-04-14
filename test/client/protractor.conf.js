// An example configuration file.

var url = process.env.PROTRACTOR_URL || "http://localhost:8000";

exports.config = {
  directConnect: true,
  baseUrl: url,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },

  // Framework to use. Jasmine is recommended.
  framework: 'jasmine',

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: ['C:/Users/Vinny/dev/FreeVehicleCheck/test/client/e2e/homePageSpec.js'],

  // Options to be passed to Jasmine.
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  },
  
  onPrepare: function() {
    var jasmineReporters = require('jasmine-reporters');
    jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
        consolidateAll: true,
        savePath: 'reports',
        filePrefix: 'e2eTestReport'
    }));
   }
};
