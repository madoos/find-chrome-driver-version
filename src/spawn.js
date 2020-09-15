const { findChromeDriverVersion } = require('./chrome-version');

findChromeDriverVersion().fork(
	(error) => {
		process.stderr.write(error.message);
		process.exit(1);
	},
	(version) => {
		process.stdout.write(version);
		process.exit(0);
	}
);
