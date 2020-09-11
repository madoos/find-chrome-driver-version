const fetch = require('node-fetch');
const findChromeVersion = require('find-chrome-version');
const xpath = require('xml2js-xpath');
const { fromPromise, fromNode } = require('crocks/Async');
const xmlToJson = fromNode(require('xml2js').parseString);
const { pipe, map, chain, lift, pipeK, converge } = require('ramda');
const { safeAsync, asyncToIo } = require('./util');
const { getMajor, getErrorMessageForGetMajor, getLastChromeDriveVersion } = require('./domain');
const eitherToAsync = require('crocks/Async/eitherToAsync');

const CHROME_STORAGE_API = 'https://chromedriver.storage.googleapis.com/';

// getLocalChromeMajorVersion :: () -> Async Error String
const getLocalChromeMajorVersion = pipeK(
	fromPromise(findChromeVersion),
	safeAsync(getErrorMessageForGetMajor, getMajor)
);

// getChromeDriveVersions :: () -> Async Error [String]
const getChromeDriveVersions = pipe(
	fromPromise(() => fetch(CHROME_STORAGE_API).then((res) => res.text())), // fetch XML
	chain(xmlToJson),
	map((json) => xpath.find(json, '//Key'))
);

// findChromeDriverVersion :: () -> Async Error String
const findChromeDriverVersion = pipeK(
	converge(lift(getLastChromeDriveVersion), [ getLocalChromeMajorVersion, getChromeDriveVersions ]),
	eitherToAsync
);

// findChromeDriverVersionSync :: () -> IO String
const findChromeDriverVersionSync = asyncToIo(findChromeDriverVersion);

module.exports = {
	getLocalChromeMajorVersion,
	getChromeDriveVersionFromLocalMajorVersion: getChromeDriveVersions,
	findChromeDriverVersion,
	findChromeDriverVersionSync
};
