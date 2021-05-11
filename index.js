const chromeVersion = require('./src/chrome-version');
const { pipe, invoker } = require('ramda');
const run = invoker(0, 'run');

const findChromeDriverVersion = pipe(chromeVersion.findChromeDriverVersion, invoker(0, 'toPromise'));
const findChromeDriverVersionSync = pipe(chromeVersion.findChromeDriverVersionSync, run);
const findChromeDriverVersionSyncCached = pipe(chromeVersion.findChromeDriverVersionSyncCached, run);
const findChromeDriverVersionSyncCachedFallback = pipe(chromeVersion.findChromeDriverVersionSyncCachedFallback, run);

module.exports = {
	findChromeDriverVersion,
	findChromeDriverVersionSync,
	findChromeDriverVersionSyncCached,
	findChromeDriverVersionSyncCachedFallback
};
