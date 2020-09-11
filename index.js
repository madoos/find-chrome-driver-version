const chromeVersion = require('./src/chrome-version');
const { pipe, invoker } = require('ramda');

const findChromeDriverVersion = pipe(chromeVersion.findChromeDriverVersion, invoker(0, 'toPromise'));
const findChromeDriverVersionSync = pipe(chromeVersion.findChromeDriverVersionSync, invoker(0, 'run'));

module.exports = {
	findChromeDriverVersion,
	findChromeDriverVersionSync
};
