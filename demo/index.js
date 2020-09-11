const chromeDriveVersion = require('../');
const chromeDriveVersionADT = require('../src/chrome-version');

console.log('Sync method:');
console.log(chromeDriveVersion.findChromeDriverVersionSync());

console.log('ADT sync method: ');
console.log(chromeDriveVersionADT.findChromeDriverVersionSync().run());

chromeDriveVersion.findChromeDriverVersion().then(console.log.bind(null, 'Async method: '));

chromeDriveVersionADT.findChromeDriverVersion().fork(console.error, console.log.bind(null, 'ADT Async method: '));
