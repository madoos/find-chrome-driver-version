const { findChromeDriverVersion } = require('./chrome-version');

findChromeDriverVersion().fork(
	(error) => process.error.write(error.message),
	(version) => process.stdout.write(version)
);
