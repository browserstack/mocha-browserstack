exports.capabilities = {
  'browserName': 'chrome',
  'bstack:options': {
	'userName': process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
	'accessKey': process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',
	'buildName': 'mocha-browserstack',
	'sessionName': 'local_test',
	'debug': 'true',
    'local': true
  }
};
