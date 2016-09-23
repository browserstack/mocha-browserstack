var assert = require('assert'),
  webdriver = require('selenium-webdriver'),
  conf_file = process.argv[3] || 'conf/single.conf.js',
  parallel = require('mocha.parallel'),
  Promise = require('bluebird');

var capabilities = require('../' + conf_file).capabilities;

var buildDriver = function(caps) {
  return new Promise(function(resolve, reject) {
    var driver = new webdriver.Builder().
      usingServer('https://hub-cloud.browserstack.com/wd/hub').
      withCapabilities(caps).
      build();
    resolve(driver);
  });
};

parallel('Tests ', function() {
  var driver, bsLocal;

  capabilities.forEach(function(caps) {
    it('can find search results', function (done) {
      buildDriver(caps).then(function(driver) {
        driver.get('http://www.google.com/ncr').then(function() {
          driver.findElement(webdriver.By.name('q')).sendKeys('BrowserStack').then(function() {
            driver.findElement(webdriver.By.name('btnG')).click().then(function() {
              driver.getTitle().then(function(title) {
                setTimeout(function() {
                  assert(title.match(/BrowserStack - Google Search/i) != null);
                  driver.quit().then(function() {
                    done();
                  });
                }, 5000);
              });
            });
          });
        });
      });
    });
  });
});
