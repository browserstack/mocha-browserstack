exports.capabilities = {
  'browserName': 'chrome',
  'bstack:options': {
    'userName': process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
    'accessKey': process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',
    'buildName': 'browserstack-build-1',
    'sessionName': 'Bstack single mocha',
    'debug': 'true',
    'source': 'mocha:sample-selenium-4-v1.0'
  }
};
