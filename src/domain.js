const { pipe, startsWith, includes, both, last, split, head, curry } = require('ramda');

// getMajor :: String -> String
const getMajor = pipe(split('.'), head);

// getErrorMessageForGetMajor :: String -> Error
const getErrorMessageForGetMajor = (major) => new Error(`Error getting Major form local chrome version: ${major}`);

// getLastDriverVersion :: [String] -> String
const getLastDriverVersion = pipe(last, split('/'), head);

// getErrorMessageForGetLastDriverVersion :: String -> Error
const getErrorMessageForGetLastDriverVersion = (lastDriverVersion) =>
	new Error(`Error getting last driver version ${lastDriverVersion}`);

// startWithChromeMajorVersion :: String -> String -> Boolean
const startWithChromeMajorVersion = curry((major, version) =>
	both(includes('/chromedriver'), startsWith(major))(version)
);

module.exports = {
	getMajor,
	getErrorMessageForGetMajor,
	getLastDriverVersion,
	getErrorMessageForGetLastDriverVersion,
	startWithChromeMajorVersion
};
