var config = {
  'commonCapabilities': {
    'userName': process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
    'accessKey': process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',
    'buildName': 'browserstack-build-1',
    'debug': 'true',
  },
  'multiCapabilities': [{
      'browserName': 'Chrome',
      'browserVersion': 'latest',
      'bstack:options': {
        'os': 'Windows',
        'osVersion': '10',
        'sessionName': 'BStack parallel mocha'
      }
    },
    {
      'browserName': 'Chrome',
      'browser_version': 'latest',
      'bstack:options': {
        'os': 'OS X',
        'osVersion': 'Monterey',
        'sessionName': 'BStack parallel mocha'
      }
    },
    {
      'browserName' : 'Safari',
      'bstack:options': {
        'os' : 'OS X',
        'osVersion' : 'Big Sur',
        'sessionName': 'BStack parallel mocha'
      }
    },
    {
      'browserName': 'Android',
      'bstack:options': {
        'deviceName': 'Samsung Galaxy S20',
        'realMobile': 'true',
        'sessionName': 'BStack parallel mocha'
      }
    },
    {
      'browserName': 'iPhone',
      'bstack:options': {
        'deviceName': 'iPhone 12 Pro Max',
        'realMobile': 'true',
        'sessionName': 'BStack parallel mocha'
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
