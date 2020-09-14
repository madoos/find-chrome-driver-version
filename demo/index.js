const chromeDriveVersion = require('../');
const chromeDriveVersionADT = require('../src/chrome-version');

console.log('Sync method:');
console.log(chromeDriveVersion.findChromeDriverVersionSync());

console.log('ADT sync method: ');
console.log(chromeDriveVersionADT.findChromeDriverVersionSync().run());

console.log('Sync cached method:');
console.log(chromeDriveVersion.findChromeDriverVersionSyncCached(1000));

console.log('ADT sync cached method: ');
console.log(chromeDriveVersionADT.findChromeDriverVersionSyncCached(1000).run());

chromeDriveVersion.findChromeDriverVersion().then(console.log.bind(null, 'Async method: '));

chromeDriveVersionADT.findChromeDriverVersion().fork(console.error, console.log.bind(null, 'ADT Async method: '));
