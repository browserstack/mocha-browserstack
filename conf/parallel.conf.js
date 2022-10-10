var config = {
  'commonCapabilities': {
    'browserstack.user': process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
    'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',
    'build': 'browserstack-build-1',
    'browserstack.debug': 'true',
  },
  'multiCapabilities': [{
      'os': 'Windows',
      'os_version': '10',
      'browserName': 'Chrome',
      'browser_version': 'latest',
      'name': 'BStack parallel mocha'
    },
    {
      'os': 'OS X',
      'os_version': 'Monterey',
      'browserName': 'Chrome',
      'browser_version': 'latest',
      'name': 'BStack parallel mocha'
    },
    {
      'os' : 'OS X',
      'os_version' : 'Big Sur',
      'browserName' : 'Safari',
      'name': 'BStack parallel mocha'
    },
    {
      'browserName': 'Android',
      'device': 'Samsung Galaxy S20',
      'realMobile': 'true',
      'name': 'BStack parallel mocha'
    },
    {
      'browserName': 'iPhone',
      'device': 'iPhone 12 Pro Max',
      'realMobile': 'true',
      'name': 'BStack parallel mocha'
  }]
};

exports.capabilities = [];
// Code to support common capabilities
config.multiCapabilities.forEach(function(caps) {
  var temp_caps = JSON.parse(JSON.stringify(config.commonCapabilities));
  for(var i in caps) temp_caps[i] = caps[i];
  exports.capabilities.push(temp_caps);
});
