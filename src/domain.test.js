const {
	getMajor,
	getErrorMessageForGetMajor,
	getLastDriverVersion,
	getErrorMessageForGetLastDriverVersion,
	startWithChromeMajorVersion,
	getLastChromeDriveVersion
} = require('./domain');

const { foldEither } = require('./util');

const chromeDriveVersions = [
	'85.0.4183.38/chromedriver_linux64.zip',
	'85.0.4183.38/chromedriver_mac64.zip',
	'85.0.4183.38/chromedriver_win32.zip',
	'85.0.4183.83/chromedriver_linux64.zip',
	'85.0.4183.83/chromedriver_mac64.zip',
	'85.0.4183.83/chromedriver_win32.zip',
	'85.0.4183.87/chromedriver_linux64.zip',
	'85.0.4183.87/chromedriver_mac64.zip',
	'85.0.4183.87/chromedriver_win32.zip'
];

test('getMajor should get major part of version', () => {
	expect(getMajor('1.2.0')).toEqual('1');
});

test('getErrorMessageForGetMajor should return an error with message', () => {
	const error = getErrorMessageForGetMajor('x.x.x');
	expect(error.message).toEqual('Error getting Major form local chrome version: x.x.x');
});

test('getLastDriverVersion should return the las drive version', () => {
	expect(getLastDriverVersion(chromeDriveVersions)).toEqual('85.0.4183.87');
});

test('getErrorMessageForGetLastDriverVersion should return an error with message', () => {
	const error = getErrorMessageForGetLastDriverVersion([]);
	expect(error.message).toEqual('Error getting last driver version ');
});

test('startWithChromeMajorVersion should a true if is correct driver version', () => {
	expect(startWithChromeMajorVersion('85', '85.0.4183.87/chromedriver_win32.zip')).toEqual(true);
	expect(startWithChromeMajorVersion('65', '85.0.4183.87/chromedriver_win32.zip')).toEqual(false);
	expect(startWithChromeMajorVersion('85', '85.0.4183.87/firefox_driver_win32.zip')).toEqual(false);
});

test('getLastChromeDriveVersion should return the las drive version', () => {
	expect(foldEither(getLastChromeDriveVersion('85', chromeDriveVersions))).toEqual('85.0.4183.87');
});

test('getLastChromeDriveVersion should return a Left value when versions is empty', () => {
	const error = foldEither(getLastChromeDriveVersion('85', []));
	expect(error.message).toEqual('Error getting last driver version ');
});
