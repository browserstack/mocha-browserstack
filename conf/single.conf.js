exports.capabilities = {
  'browserstack.user': process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
  'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',
  'build': 'mocha-browserstack',
  'name': 'single_test',
  'browserstack.debug': 'true',

  'browserName': 'chrome'
};
