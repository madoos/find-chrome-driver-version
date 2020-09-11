# find-chrome-driver-version

Get latest chrome driver version based on the local installation.

This module contains a functional core and allows to use methods with algebraic data types.

##  Getting started

Install:

```bash
npm i -S find-chrome-driver-version
```

Usage:

```js
const { findChromeDriverVersion, findChromeDriverVersionSync } = require('find-chrome-driver-version')

// Using promises
findChromeDriverVersion().then(console.log) // => 85.0.4183.87

//Using sync method
console.log(findChromeDriverVersionSync()) // => 85.0.4183.87

```

This module also allows to use ADT:

```js
const { findChromeDriverVersion, findChromeDriverVersionSync } = require('find-chrome-driver-version/src/chrome-version')

// Using crocks Async ADT
// lasDriverVersion :: Async Error String
const lastDriverVersion = findChromeDriverVersion()
lasDriverVersion.fork(console.error, console.log) // => 85.0.4183.87

// Using crocks IO ADT
//lastDriverVersion :: IO String
const lastDriverVersion = findChromeDriverVersionSync()
lastDriverVersion.run() // => 85.0.4183.87
```

## how does it work?

* Ask to OS for the current local version of chrome.
* Download from https://chromedriver.storage.googleapis.com/ the available driver versions.
* Get the latest version of driver using major local version of chrome.

To convert asynchronous to synchronous processes, use the module [deasync-promise](https://www.npmjs.com/package/deasync-promise)

Use algebraic data types from [crocks](https://crocks.dev/docs/getting-started.html)