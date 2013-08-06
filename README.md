squishy-pants
=============

Semi-serious functional programming library.

## Build status

[![Build Status](https://api.travis-ci.org/SimonRichardson/squishy-pants.png)](https://travis-ci.org/SimonRichardson/squishy-pants)

## Documentation

Alpha documentation is found [here](http://simonrichardson.github.io/squishy-pants/)

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
A lot of the ideas in bilby.js are also found in squishy-pants, but squishy-pants takes a more
Functional and Reactive Programming approach. Hopefully implementing a more Functional Reactive Programming (FPR) approach

There is also [lemonad](https://github.com/fogus/lemonad) which is in the similar vein to bibly.js
and squishy-pants, with the aid of it's very good companion book [Functional Javascript](http://shop.oreilly.com/product/0636920028857.do).

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/simonrichardson/squishy-pants/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
