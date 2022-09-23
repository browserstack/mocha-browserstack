exports.capabilities = {
  'browserstack.user': process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
  'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',
  'build': 'mocha-browserstack',
  'name': 'single_test',
  'browserstack.source': 'mocha:sample-selenium-3-v1.0',
  'browserstack.debug': 'true',

  'browserName': 'chrome'
};
