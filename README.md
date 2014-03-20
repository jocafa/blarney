Blarney
========

Generate repeatable random data in JS

Inspired by [Faker.js](http://github.com/Marak/Faker.js)
Uses slightly modified [Alea PRNG](http://baagoe.org/en/wiki/Alea)

## Getting started

For the server, install Blarney via [npm][npm].
```shell
npm install Blarney
```

For the browser, download [Blarney.js][blarney.js], and include it as a script tag.

```html
<script src="Blarney.js"></script>
<script>
  var ns = new Blarney();
  ns.integer(); // Random integer between 0 and 2^32
</script>
```

[npm]: https://npmjs.org/
[blarney.js]: https://raw.github.com/jocafa/blarney/master/blarney.js

## Usage

### Instantiation
To create a new Blarney instance, do `var ns = new Blarney();`. You can pass any number of arbitrary arguments to the `Blarney()` constructor to be used as seed data. If you don't pass anything, it will just use the default.

### Seeding
If you want to reset the seed of an instance you already have, call `ns.sow()` and pass in the seed data you want to use. The constructor calls `sow()` internally on instantiation.

### Numbers
  - `integer()` - returns a random integer between 0 and 2^32
  - `frac()` - returns a random real number between 0 and 1
  - `real()` - returns a random real number between 0 and 2^32
  - `integerInRange(min, max)` - returns a random integer between min and max
  - `realInRange(min, max)` - returns a random real number between min and max
  - `normal()` - returns a random real number between -1 and 1

### Utilities
  - `uuid()` - returns a valid v4 UUID hex string
  - `pick(array)` - returns a random member of `array`
  - `weightedPick(array)` - returns a random member of `array`, favoring the earlier entries
  - `timestamp(min, max)` - returns a random timestamp between min and max, or between the beginning of 2000 and the end of 2020 if min and max aren't specified

### Language
  - `word()` - returns a random word of lipsum
  - `words(n)` - returns `n` random words of lipsum, 3 if not specified
  - `sentence()` - returns a random lipsum sentence
  - `sentences(n)` - returns `n` random lipsum sentences, 3 if not specified

### People
  - `gender()` - returns 'male' or 'female'
  - `firstName(gender)` - returns a random common first name, gender is optional
  - `lastName()` - returns a random common last name
  - `name(gender)` - returns a random first and last name, gender is optional
  - `portrait(gender)` - returns an object containing Flickr short URLs for four images. Keys are `smallSquare`, `largeSquare`, `thumbnail`, and `small`.  The photos are from GregPC's [1000faces1](http://www.flickr.com/photos/gregpc/sets/72157606694597353/) set on Flickr. Special thanks to him for doing all the hard work and allowing us to benefit from it!
  - `jobTitle()` - returns a random job title
  - `email()` - returns a random email address

### Miscellaneous
  - `buzzPhrase()` - returns a random web 2.0 business plan... 
  - `domain()` - returns a random domain name

License
-------

Do whatever you want with this code. The consequences of your actions are your own responsibility.
