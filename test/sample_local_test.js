var assert = require('assert');
const { Builder, Capabilities } = require("selenium-webdriver");

var buildDriver = async function() {
  return new Builder().
    usingServer('http://localhost:4444/wd/hub').
    withCapabilities(Capabilities.chrome()).
    build();
};

describe('BrowserStack Local Testing', async function() {
  this.timeout(0);
  var driver;

  beforeEach(async function() {
    driver = await buildDriver();
  });

  it('check tunnel is working', async function () {
    await driver.get('http://bs-local.com:45691/check');
    let source = await driver.getPageSource();
    assert(source.match(/Up and running/i) != null);
  });

  afterEach(async function() {
    await driver.quit();
  });
});
