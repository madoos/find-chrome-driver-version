const { pipe, startsWith, includes, both, last, split, head, curry, filter } = require('ramda');
const { safe } = require('./util');

// getMajor :: String -> String
const getMajor = pipe(split('.'), head);

// getErrorMessageForGetMajor :: String -> Error
const getErrorMessageForGetMajor = (major) => new Error(`Error getting Major form local chrome version: ${major}`);

// getLastDriverVersion :: [String] -> String
const getLastDriverVersion = pipe(last, split('/'), head);

// getErrorMessageForGetLastDriverVersion :: String -> Error
const getErrorMessageForGetLastDriverVersion = (lastDriverVersion) =>
	new Error(`Error getting last driver version ${lastDriverVersion}`);

// start   WithChromeMajorVersion :: String -> String -> Boolean
const startWithChromeMajorVersion = curry((major, version) =>
	both(includes('/chromedriver'), startsWith(major))(version)
);

// getLastChromeDriveVersion :: String -> [String] -> Either Error String
const getLastChromeDriveVersion = curry((major, versions) =>
	pipe(
		filter(startWithChromeMajorVersion(major)),
		safe(getErrorMessageForGetLastDriverVersion, getLastDriverVersion)
	)(versions)
);

module.exports = {
	getMajor,
	getErrorMessageForGetMajor,
	getLastDriverVersion,
	getErrorMessageForGetLastDriverVersion,
	startWithChromeMajorVersion,
	getLastChromeDriveVersion
};
