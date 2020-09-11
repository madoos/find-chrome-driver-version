const fetch = require('node-fetch');
const findChromeVersion = require('find-chrome-version');
const xpath = require('xml2js-xpath');
const { fromPromise, fromNode } = require('crocks/Async');
const xmlToJson = fromNode(require('xml2js').parseString);
const { pipe, map, chain, filter, pipeK } = require('ramda');
const { safeAsync, asyncToIo } = require('./util');

const {
	getMajor,
	getErrorMessageForGetMajor,
	getLastDriverVersion,
	getErrorMessageForGetLastDriverVersion,
	startWithChromeMajorVersion
} = require('./domain');

const CHROME_STORAGE_API = 'https://chromedriver.storage.googleapis.com/';

// getLocalChromeMajorVersion :: () -> Async Error String
const getLocalChromeMajorVersion = pipeK(
	fromPromise(findChromeVersion),
	safeAsync(getErrorMessageForGetMajor, getMajor)
);

// getChromeDriveVersionFromLocalMajorVersion :: String -> Async Error [String]
const getChromeDriveVersionFromLocalMajorVersion = (major) =>
	pipe(
		fromPromise(() => fetch(CHROME_STORAGE_API).then((res) => res.text())), // fetch XML
		chain(xmlToJson),
		map((json) => xpath.find(json, '//Key')),
		map(filter(startWithChromeMajorVersion(major))),
		chain(safeAsync(getErrorMessageForGetLastDriverVersion, getLastDriverVersion))
	)();

// findChromeDriverVersion :: () -> Async Error String
const findChromeDriverVersion = pipeK(getLocalChromeMajorVersion, getChromeDriveVersionFromLocalMajorVersion);

// findChromeDriverVersionSync :: () -> IO String
const findChromeDriverVersionSync = asyncToIo(findChromeDriverVersion);

module.exports = {
	getLocalChromeMajorVersion,
	getChromeDriveVersionFromLocalMajorVersion,
	findChromeDriverVersion,
	findChromeDriverVersionSync
};
