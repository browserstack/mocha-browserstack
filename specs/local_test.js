var assert = require('assert'),
  browserstack = require('browserstack-local'),
  webdriver = require('selenium-webdriver'),
  conf_file = process.argv[3] || 'conf/local.conf.js';
  
var caps = require('../' + conf_file).capabilities;

var buildDriver = function(caps) {
  return new webdriver.Builder().
    usingServer('https://hub-cloud.browserstack.com/wd/hub').
    withCapabilities(caps).
    build();
};

describe('BrowserStack Local Testing for ' + caps.browserName, function() {
  this.timeout(0);
  var driver, bsLocal;

  beforeEach(function(done) {
    bsLocal = new browserstack.Local();
    bsLocal.start({ 'key': caps['bstack:options'].accessKey }, function(error) {
      if (error) done(error);
      driver = buildDriver(caps);
      done();
    });
  });

  it('check tunnel is working', function (done) {
    driver.get('http://bs-local.com:45691/check').then(function() {
      driver.getPageSource().then(function(source) {
        assert(source.match(/Up and running/i) != null);
        done();
      });
    });
  });

  afterEach(function(done) {
    driver.quit().then(function() {
      bsLocal.stop(function() {
        done()
      });
    });
  });
});
