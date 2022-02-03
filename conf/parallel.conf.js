var config = {
  'commanCapabilities': {
    'browserstack.user': process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
    'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',
    'build': 'mocha-browserstack',
    'browserstack.debug': 'true',
  },
  'multiCapabilities': [{
      'os': 'Windows',
      'os_version': '10',
      'browserName': 'Chrome',
      'browser_version': 'latest',
      'name': 'Parallel test 1'
    },
    {
      'os': 'OS X',
      'os_version': 'Monterey',
      'browserName': 'Chrome',
      'browser_version': 'latest',
      'name': 'Parallel test 2'
    },
    {
      'os' : 'OS X',
      'os_version' : 'Big Sur',
      'browserName' : 'Safari',
      'name': 'Parallel test 3'
    },
    {
      'browserName': 'Android',
      'device': 'Samsung Galaxy S20',
      'realMobile': 'true',
      'name': 'Parallel test 4'
    },
    {
      'browserName': 'iPhone',
      'device': 'iPhone 12 Pro Max',
      'realMobile': 'true',
      'name': 'Parallel test 5'
  }]
};

exports.capabilities = [];
// Code to support common capabilities
config.multiCapabilities.forEach(function(caps) {
  var temp_caps = JSON.parse(JSON.stringify(config.commanCapabilities));
  for(var i in caps) temp_caps[i] = caps[i];
  exports.capabilities.push(temp_caps);
});
