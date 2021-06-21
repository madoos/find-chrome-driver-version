const { head, identity, always } = require('ramda');
const Either = require('crocks/Either');
const { join } = require('path');
const fs = require('fs');
const IO = require('crocks/IO');

const { safe, safeAsync, foldEither, asIO, memoizeIoWithFile, memoizeIoAndFallBackWithFile, Monad } = require('./util');

test('safe should wrap insecure function with undefined values in either context', () => {
	const errorMessage = (xs) => `${JSON.stringify(xs)}: empty array don't have head`;
	const safeHead = safe(errorMessage, head);
	expect(foldEither(safeHead([]))).toEqual(`[]: empty array don't have head`);
	expect(foldEither(safeHead([ 'x' ]))).toEqual('x');
});

test('safe should wrap insecure function with try/cath errors in either context', () => {
	const errorMessage = (x) => `Error parsing string: ${x}`;
	const safeParse = safe(errorMessage, JSON.parse);

	expect(foldEither(safeParse(`{ "a": 1 }`))).toEqual({ a: 1 });
	expect(foldEither(safeParse(`x {}`))).toEqual('Error parsing string: x {}');
});

test('safeAsync should wrap insecure function with undefined values in Async context', async () => {
	const errorMessage = (xs) => `${JSON.stringify(xs)}: empty array don't have head`;
	const safeHead = safeAsync(errorMessage, head);

	expect(await safeHead([]).toPromise().catch(identity)).toEqual(`[]: empty array don't have head`);
	expect(await safeHead([ 'x' ]).toPromise()).toEqual('x');
});

test('safeAsync should wrap insecure function with try/cath errors in either context', async () => {
	const errorMessage = (x) => `Error parsing string: ${x}`;
	const safeParse = safeAsync(errorMessage, JSON.parse);

	expect(await safeParse(`{ "a": 1 }`).toPromise()).toEqual({ a: 1 });
	expect(await safeParse(`x {}`).toPromise().catch(identity)).toEqual('Error parsing string: x {}');
});

test('foldEither should unwrap either values', () => {
	expect(foldEither(Either.Right('r'))).toEqual('r');
	expect(foldEither(Either.Left('l'))).toEqual('l');
});

test('asIO should transform function (*... -> a) to (*...) -> IO a', () => {
	const ioIdentity = asIO(identity);
	expect(ioIdentity(1).run()).toEqual(1);
});

test('Monad.do should create monadic chains', () => {
	const io = Monad.do(function*() {
		const x = yield IO.of(1);
		const y = yield IO.of(2);
		return IO.of(x + y);
	});
	expect(io.run()).toEqual(3);
});

test('memoizeIoWithFile should return function with cache stored in file', () => {
	const CACHE_FILE = join(__dirname, './.testCache');
	expect(fs.existsSync(CACHE_FILE)).toEqual(false);
	const memoizedFn = memoizeIoWithFile(asIO(always('85.0.4183.87')), CACHE_FILE, 40000);
	memoizedFn().run();
	expect(fs.existsSync(CACHE_FILE)).toEqual(true);
	fs.unlinkSync(CACHE_FILE);
});

test('memoizeIoWithFile should return function with override cache file', async () => {
	const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	const CACHE_FILE = join(__dirname, './.testCache');
	const ONE_SECONDS = 1000;
	const memoizedFn = memoizeIoWithFile(asIO(always('85.0.4183.87')), CACHE_FILE, ONE_SECONDS);
	memoizedFn().run();
	const birthtimeMs = fs.statSync(CACHE_FILE).birthtimeMs;
	await delay(ONE_SECONDS);
	memoizedFn().run();
	const lastBirthtimeMs = fs.statSync(CACHE_FILE).birthtimeMs;
	expect(birthtimeMs).not.toEqual(lastBirthtimeMs);
	fs.unlinkSync(CACHE_FILE);
});

test('memoizeIoWithFile should store in cache te same IO response', async () => {
	const CACHE_FILE = join(__dirname, './.testCache');
	const memoizedFn = memoizeIoWithFile(asIO(always('85.0.4183.87')), CACHE_FILE, 200);
	const result = memoizedFn().run();
	const cacheResult = fs.readFileSync(CACHE_FILE, 'utf-8');
	expect(result).toEqual(cacheResult);
	fs.unlinkSync(CACHE_FILE);
});

test('memoizeIoAndFallBackWithFile should work just like memoizeIoWithFile if no error', async () => {
	const CACHE_FILE = join(__dirname, './.testCache');
	fs.writeFileSync(CACHE_FILE, '85.0.4183.87');
	const cacheResult = fs.readFileSync(CACHE_FILE, 'utf-8');
	const memoizedFn = memoizeIoAndFallBackWithFile(() => "something diferent", CACHE_FILE, 10000);
	const falledBackResult = memoizedFn().run();
	expect(falledBackResult).toEqual(cacheResult);
	fs.unlinkSync(CACHE_FILE);
});

test('memoizeIoAndFallBackWithFile should work just like memoizeIoWithFile if no error and no cache', async () => {
	const CACHE_FILE = join(__dirname, './.testCache');
	if (fs.existsSync(CACHE_FILE)) {
		fs.rmSync(CACHE_FILE);
	}
	const result = '85.0.4183.88';
	const memoizedFn = memoizeIoAndFallBackWithFile(asIO(always(result)), CACHE_FILE, 10000);
	const falledBackResult = memoizedFn().run();
	expect(falledBackResult).toEqual(result);
	fs.unlinkSync(CACHE_FILE);
});

test('memoizeIoAndFallBackWithFile should return cache if function fails', async () => {
	const CACHE_FILE = join(__dirname, './.testCache');
	fs.writeFileSync(CACHE_FILE, '85.0.4183.87');
	const cacheResult = fs.readFileSync(CACHE_FILE, 'utf-8');
	const memoizedFn = memoizeIoAndFallBackWithFile(() => {throw "error"}, CACHE_FILE, 10000);
	const falledBackResult = memoizedFn().run();
	expect(falledBackResult).toEqual(cacheResult);
	fs.unlinkSync(CACHE_FILE);
});
