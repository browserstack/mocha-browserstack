# mocha-browserstack

[Mocha](https://github.com/mochajs/mocha) Integration with BrowserStack for E2E functional testing of UI using Selenium and [browserstack-node-sdk](https://www.npmjs.com/package/browserstack-node-sdk).

![BrowserStack Logo](https://d98b8t1nnulk5.cloudfront.net/production/images/layout/logo-header.png?1469004780)

<img src ="https://camo.githubusercontent.com/af4bf83ab2ca125346740f9961345a24ec43b3a9/68747470733a2f2f636c6475702e636f6d2f78465646784f696f41552e737667" height = "100">

## Run sample build

---
- Clone the repo 
- Install dependencies `npm install`
- Set your [BrowserStack Username and Access Key](https://www.browserstack.com/accounts/settings) in [browserstack.yml](browserstack.yml) `npx setup --username userName --key accessKey`
- To run sample test, run `npm run sample-test` or `yarn run sample-test`
- To run tests on private websites,
   - set browserstackLocal: true at [browserstack.yml](browserstack.yml)
   - run `npm run sample-local-test` or `yarn run sample-local-test`

## Integrate your test suite
Integrate BrowserStack into your existing Mocha test suite using BrowserStack Node SDK — a plug-and-play solution that takes care of all the integration steps for you!
---
1. Install browserstack-node-sdk as a dev-dependency in your mocha project
```
npm i -D browserstack-node-sdk
or
yarn add --dev browserstack-node-sdk
```
2. Setup
```
npx setup --username userName --key accessKey
```
  * Adds a browserstack.yml file at root of your mocha project with your [BrowserStack Username and Access Key](https://www.browserstack.com/accounts/settings). Adding `userName` and `accessKey` in the config is not required if you have set `env` variables.
  * Adds a new command for running tests on browserstack in scripts property of package.json,
  ```
  "scripts": {
    "test": "mocha ...args",
    "browserstack-test": "browserstack-node-sdk mocha ...args"
  },
  ```

## Notes

---
- You can view your test results on the [BrowserStack automate dashboard](https://automate.browserstack.com)
- To test on a different set of browsers, check out our [capabilities generator](https://www.browserstack.com/automate/capabilities)
  
## Additional Resources

---
- [Documentation for writing automate test scripts in Node](https://www.browserstack.com/automate/node)
- [Customizing your tests on BrowserStack](https://www.browserstack.com/automate/capabilities)
- [Browsers & mobile devices for selenium testing on BrowserStack](https://www.browserstack.com/list-of-browsers-and-platforms?product=automate)
- [Using REST API to access information about your tests via the command-line interface](https://www.browserstack.com/automate/rest-api)
