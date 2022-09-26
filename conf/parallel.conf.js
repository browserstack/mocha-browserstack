var config = {
  'commonCapabilities': {
    'userName': process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
    'accessKey': process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',
    'buildName': 'browserstack-build-1',
    'debug': 'true',
    'source': 'mocha:sample-selenium-4-v1.0'
  },
  'multiCapabilities': [{
      'browserName': 'Chrome',
      'browserVersion': 'latest',
      'bstack:options': {
        'os': 'Windows',
        'osVersion': '10',
        'sessionName': 'Parallel test 1'
      }
    },
    {
      'browserName': 'Chrome',
      'browser_version': 'latest',
      'bstack:options': {
        'os': 'OS X',
        'osVersion': 'Monterey',
        'sessionName': 'Parallel test 2'
      }
    },
    {
      'browserName' : 'Safari',
      'bstack:options': {
        'os' : 'OS X',
        'osVersion' : 'Big Sur',
        'sessionName': 'Parallel test 3'
      }
    },
    {
      'browserName': 'Android',
      'bstack:options': {
        'deviceName': 'Samsung Galaxy S20',
        'realMobile': 'true',
        'sessionName': 'Parallel test 4'
      }
    },
    {
      'browserName': 'iPhone',
      'bstack:options': {
        'deviceName': 'iPhone 12 Pro Max',
        'realMobile': 'true',
        'sessionName': 'Parallel test 5'
      }
  }]
};

exports.capabilities = [];
// Code to support common capabilities
config.multiCapabilities.forEach(function(caps) {
  var temp_caps = JSON.parse(JSON.stringify(config.commonCapabilities));
  caps['bstack:options'] = {
    ...caps['bstack:options'],
    ...temp_caps
  };
  exports.capabilities.push(caps);
});
