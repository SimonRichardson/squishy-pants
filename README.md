squishy-pants
=============

Semi-serious functional programming library.

## Build status

[![Build Status](https://api.travis-ci.org/SimonRichardson/squishy-pants.png?branch=master)](https://travis-ci.org/SimonRichardson/squishy-pants)

## Documentation

Alpha documentation is found [here](http://simonrichardson.github.io/squishy-pants/)

## Examples

### Attempt
```javascript
squishy.Attempt.Success(1).map(
  function(a) {
    return a + 1;
  }
).toOption().getOrElse(
  function() {
    return 0;
  }
);
// Outputs: 2
```

### Option
```javascript
squishy.Option.Some(1).map(
  function(a) {
    return a + 1;
  }
).getOrElse(
  function() {
    return 0;
  }
);
// Outputs: 2
```

### Promise
```javascript
squishy.Promise.of(1).map(
  function(a) {
    return a + 1;
  }
).fork(console.log);
// Outputs: 2
```

### Stream
```javascript
squishy.Stream.fromArray([1, 2, 3, 4]).map(
  function(a) {
    return a + 1;
  }
).zipWithIndex().fork(console.log);
// Outputs: Tuple2(2, 0), Tuple2(3, 1), Tuple2(4, 2), Tuple2(5, 3)
```

### More:

* [Array methods](src/array.js)
* [Attempt](src/attempt.js)
* [Check (similar to ScalaCheck and QuickCheck)](src/check.js)
* [Either](src/either.js)
* [Environment](src/environment.js)
* [FO - Fantasy Overloading](src/fo.js)
* [Identity](src/identity.js)
* [IO](src/io.js)
* [Lazy](src/lazy.js)
* [Lens](src/lens.js)
* [List](src/list.js)
* [Option](src/option.js)
* [Partial](src/partial.js)
* [Promise](src/promise.js)
* [Reader](src/reader.js)
* [State](src/state.js)
* [Store](src/store.js)
* [Stream](src/stream.js)
* [Trampoline](src/trampoline.js)
* [Tuples (from 2 to 5)](src/tuples.js)
* [Writer](src/writer.js)

## Building

Install the development dependencies with [npm](https://npmjs.org/):

    npm install

Run the tests with [npm](https://npmjs.org/):

    npm test

Run the tests with [grunt](http://gruntjs.com/):

    grunt default

Optionally you can also run the tests parallelized with [nodeunit](https://github.com/caolan/nodeunit)
because we use [QuickCheck](http://en.wikipedia.org/wiki/QuickCheck) for testing it can take some time
especially if the goal of QuickCheck is set at a high value.

Set the number of tasks to run parallel, the `--numOfParallel` is optional, setting no value will set
it to run `2` tasks in parallel.

Obviously the number of tasks to be run in parallel depends on the type of CPU and the number of cores
available.

    grunt par --numOfParallel=4


## Alternatives

If you're looking for a serious functional programming library one that derives a lot from Haskell
and Category Theory then consider looking into [bilby.js](https://github.com/puffnfresh/bilby.js).
A lot of the ideas in bilby.js are also found in squishy-pants, but differ in some implementation
types.

> If a tree falls in the woods, does it make a sound?
>
> If a pure function mutates some local data in order to produce an immutable return value, is that ok?

_Rich Hickey at http://clojure.org/transients_

Squishy-pants assumes that it is ok to mutate local data as long as that local data is not exposed and
if the result is immutable.

There is also [lemonad](https://github.com/fogus/lemonad) which is in the similar vein to bibly.js
and squishy-pants, with the aid of it's very good companion book [Functional Javascript](http://shop.oreilly.com/product/0636920028857.do).
