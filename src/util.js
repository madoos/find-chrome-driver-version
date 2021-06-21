const { Right, Left } = require('crocks/Either');
const { isNil, curry, curryN, pipe, identity, map, chain, prop, tryCatch } = require('ramda');
const eitherToAsync = require('crocks/Async/eitherToAsync');
const IO = require('crocks/IO');
const either = require('crocks/pointfree/either');
const fs = require('fs');
const moment = require('moment');

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

//  foldEither :: Either b a -> a | b
const foldEither = either(identity, identity);

// asIO :: (*... -> a) -> (*... -> IO a)
const asIO = (f) => (...args) => IO(() => f(...args));

// Monad.do :: Monad M => (a)* -> M b -> M b
const Monad = {
	do: (gen) => {
		let g = gen();
		const step = (value) => {
			const result = g.next(value);
			if (result.done) {
				g = gen();
				return result.value;
			} else {
				return result.value.chain(step);
			}
		};
		return step();
	}
};

// fsIO :: { String: (a -> IO b) }
const fsIO = map(asIO, {
	statSync: fs.statSync,
	readFileSync: fs.readFileSync,
	writeFileSync: fs.writeFileSync,
	existsSync: fs.existsSync,
	unlinkSync: fs.unlinkSync
});

// rewriteFile :: String -> String -> IO String
const _rewriteFile = curry((file, content) =>
	Monad.do(function*() {
		if (yield fsIO.existsSync(file)) yield fsIO.unlinkSync(file);
		yield fsIO.writeFileSync(file, content);
		return IO.of(content);
	})
);

// isExpirationTimeElapsedForFile :: String -> Number -> IO Boolean
const isExpirationTimeElapsedForFile = curry((file, expiration) =>
	pipe(
		() => fsIO.statSync(file),
		map(prop('birthtimeMs')),
		map(moment),
		map((birthtime) => moment().diff(birthtime)),
		map((elapsed) => elapsed >= expiration)
	)()
);

// memoizeIoWithFile :: (a -> IO String) -> String -> (a -> IO String)
const memoizeIoWithFile = curry((f, cacheFile, expiration) => {
	return (...args) => {
		return Monad.do(function*() {
			return (yield fsIO.existsSync(cacheFile)) && !(yield isExpirationTimeElapsedForFile(cacheFile, expiration))
				? fsIO.readFileSync(cacheFile, 'utf-8')
				: chain(_rewriteFile(cacheFile), f(...args));
		});
	};
});

// memoizeIoAndFallBackWithFile :: (a -> IO String) -> String -> (a -> IO String)
const memoizeIoAndFallBackWithFile = curry((f, cacheFile, expiration) => {
	return asIO(tryCatch(
		() => fsIO.readFileSync(cacheFile, 'utf-8').run(),
		() => memoizeIoWithFile(f, cacheFile, expiration)().run()
	));
});

module.exports = {
	safe,
	safeAsync,
	foldEither,
	asIO,
	memoizeIoWithFile,
	memoizeIoAndFallBackWithFile,
	Monad
};
