const { Right, Left } = require('crocks/Either');
const { isNil, curry, curryN, pipe } = require('ramda');
const eitherToAsync = require('crocks/Async/eitherToAsync');
const toSync = require('deasync-promise');
const IO = require('crocks/IO');

// safe :: String -> (a -> b) -> a -> Either String b
const safe = curry((l, r) => (...args) => {
	const leftMessage = () => Left(l(...args));

	try {
		const result = r(...args);
		return isNil(result) ? leftMessage() : Right(result);
	} catch (e) {
		return leftMessage();
	}
});

// safeAsync :: String -> (a -> b) -> (a -> Async String b)
const safeAsync = curryN(2, pipe(safe, eitherToAsync));

// asyncToIO :: a -> Async Error b -> a -> IO b
const asyncToIo = (f) => (...args) => IO(() => toSync(f(...args).toPromise()));

module.exports = {
	safe,
	safeAsync,
	asyncToIo
};
