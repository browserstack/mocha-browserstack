var assert = require('assert');
const { Builder, By, Capabilities, until } = require("selenium-webdriver");

var buildDriver = function() {
  return new Builder().
    usingServer('http://localhost:4444/wd/hub').
    withCapabilities(Capabilities.chrome()).
    build();
};

describe('BStackDemo Tests Module A', async function() {
  this.timeout(0);
  var driver;

  before(async function() {
    driver = buildDriver();
    await driver.get('https://bstackdemo.com/');
    await driver.wait(until.titleMatches(/StackDemo/i), 10000);
  });

  it('flaky test - random product selection', async () => {
    const randomProductIndex = Math.random() > 0.5 ? "1" : "2000";
    const div = `//*[@id="${randomProductIndex}"]`;

    await driver.wait(until.elementLocated(By.xpath(div + "/p")), 10000);
    let productText = await driver.findElement(By.xpath(div + "/p")).getText();

    // clicking the 'Add to cart' button
    await driver.wait(until.elementLocated(By.xpath(div + '/div[4]')));
    await driver.findElement(By.xpath(div + '/div[4]')).click();
    // waiting until the Cart pane has been displayed on the webpage
    await driver.wait(until.elementLocated(By.className("float-cart__content")));
    await driver.findElement(By.className('float-cart__content'))
    // locating product in cart and getting name of the product in cart
    await driver.wait(until.elementLocated(By.xpath('//*[@id="__next"]/div/div/div[2]/div[2]/div[2]/div/div[3]/p[1]')));
    let productCartText = await driver.findElement(By.xpath('//*[@id="__next"]/div/div/div[2]/div[2]/div[2]/div/div[3]/p[1]')).getText();
    // checking whether product has been added to cart by comparing product name
    assert(productText === productCartText);
  })

  it("always failing test - missing element 1", async () => {
    await driver.wait(until.elementLocated(By.xpath('//*[@id="non-existent-1"]/p')), 10000);
    await driver.findElement(By.xpath('//*[@id="non-existent-1"]/p')).click();
  });

  it("always failing test - same stacktrace 1", async () => {
    await driver.wait(until.elementLocated(By.xpath('//*[@id="common-error"]/p')), 10000);
    await driver.findElement(By.xpath('//*[@id="common-error"]/p')).click();
  });

  it("always failing test - same stacktrace 2", async () => {
    await driver.wait(until.elementLocated(By.xpath('//*[@id="common-error"]/p')), 10000);
    await driver.findElement(By.xpath('//*[@id="common-error"]/p')).click();
  });

  it("Always Passing Test - example F", async () => {
    assert(true);
  });

  it("Always Passing Test - example G", async () => {
    assert(true);
  });
  
  it("Always Passing Test - example H", async () => {
    assert(true);
  });

  it("Always Passing Test - example I", async () => {
    assert(true);
  });

  it("passing test - verify page title", async () => {
    const title = await driver.getTitle();
    assert.match(title, /StackDemo/i);
  });

  it("Test with framework-level retry - 2 retries configured", function () {
    this.retries(2); // Framework-level retry
    const randomOutcome = Math.random() > 0.7; // 30% chance of passing
    if (!randomOutcome) {
      throw new Error("Test failed, retrying...");
    }
  });

  it("Another Test with framework-level retry - 2 retries configured", function () {
    this.retries(2); // Framework-level retry
    const randomOutcome = Math.random() > 0.7; // 30% chance of passing
    if (!randomOutcome) {
      throw new Error("Test failed, retrying...");
    }
  });

  it("always passing test - example A", async () => {
    const url = await driver.getCurrentUrl();
    assert.match(url, /bstackdemo/);
  });

  after(async function() {
    await driver.quit();
  });
});
