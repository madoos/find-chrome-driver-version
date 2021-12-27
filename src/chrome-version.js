const fetch = require('node-fetch');
const HttpsProxyAgent = require('https-proxy-agent');
const findChromeVersion = require('find-chrome-version');
const xpath = require('xml2js-xpath');
const { fromPromise, fromNode } = require('crocks/Async');
const xmlToJson = fromNode(require('xml2js').parseString);
const { pipe, map, chain, lift, pipeK, converge, toString } = require('ramda');
const { safeAsync, asIO, memoizeIoWithFile, memoizeIoAndFallBackWithFile } = require('./util');
const { getMajor, getErrorMessageForGetMajor, getLastChromeDriveVersion } = require('./domain');
const eitherToAsync = require('crocks/Async/eitherToAsync');
const { join } = require('path');
const { execSync } = require('child_process');

const CHROME_STORAGE_API = 'https://chromedriver.storage.googleapis.com/';
const NODE_CALL_FOR_SPAWN = `node "${join(__dirname, './spawn.js')}"`;
const CACHE_FILE_PATH = join(__dirname, '../.cache');
const PROXY = process.env.ALL_PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

// getLocalChromeMajorVersion :: () -> Async Error String
const getLocalChromeMajorVersion = pipeK(
	fromPromise(findChromeVersion),
	safeAsync(getErrorMessageForGetMajor, getMajor)
);

// getChromeDriveVersions :: () -> Async Error [String]
const getChromeDriveVersions = pipe(
	fromPromise(() => fetch(CHROME_STORAGE_API, {
		agent: PROXY && new HttpsProxyAgent(PROXY)
	}).then((res) => res.text())), // fetch XML
	chain(xmlToJson),
	map((json) => xpath.find(json, '//Key'))
);

// findChromeDriverVersion :: () -> Async Error String
const findChromeDriverVersion = pipeK(
	converge(lift(getLastChromeDriveVersion), [ getLocalChromeMajorVersion, getChromeDriveVersions ]),
	eitherToAsync
);

// findChromeDriverVersionSync :: () -> IO String
const findChromeDriverVersionSync = pipe(
	asIO(() => execSync(NODE_CALL_FOR_SPAWN)), //
	map(toString) //
);

// findChromeDriverVersionSync :: Number -> IO StrinG
const findChromeDriverVersionSyncCached = (expiration) =>
	memoizeIoWithFile(findChromeDriverVersionSync, CACHE_FILE_PATH, expiration)();

	// findChromeDriverVersionSync :: Number -> IO StrinG
const findChromeDriverVersionSyncCachedFallback = (expiration) =>
	memoizeIoAndFallBackWithFile(findChromeDriverVersionSync, CACHE_FILE_PATH, expiration)();

module.exports = {
	getLocalChromeMajorVersion,
	getChromeDriveVersions,
	findChromeDriverVersion,
	findChromeDriverVersionSync,
	findChromeDriverVersionSyncCached,
	findChromeDriverVersionSyncCachedFallback,
};
