# Pure JavaScript HTML5 router

[![Build Status](https://travis-ci.org/BusinessDuck/html5-history-router.svg?branch=master)](https://travis-ci.org/BusinessDuck/html5-history-router)

Lightweight and fast router based on HTML5 history.
## Why native history instead of location.hash

  - html5 history API is more powerful (local state, previous state)
  - Forward - backward statefull navigation out of the box
  - The history API is a robust system that is actually designed to do that job (hash it is anchor to id actually)
  - No server-side hacks for remove # (hash) from URL
  - Easy and clean code

## [Changelog](https://github.com/BusinessDuck/html5-history-router/blob/master/changelog.md)
# Examples

### Configure route map
```js
    import { Router } from 'html5-native-router';

    // Init
    router = new Router();

    // Add route change callback to router instance
    router.on(('/foo') => {
        // do something...
    });

    // Add callbacks chain to router
    router.on(('/foo') => {
            // first callback
        }).on(('/foo/bar') => {
            // second callback (if first does not match)
        })...
```
### Route params parser
```js
...

router.on('/product/:productId', ({ params }) => {
   console.log(params.productId); // '23'
});

router.pushState('/product/23');
```

### Route regexp match
```js
...

router.on(/\/product\/[0-9]/, ({ path }) => {
   console.log(path); // '/product/23'
});

router.pushState('/product/23');
```

### Other callbacks
```js
...

router.always(() => {
    // always called on any route change
    }).on(/\/product\/[0-9]/, ({ path }) => {
     console.log(path); // '/product/23'
    });

router.pushState('/product/23');
```

### Routes change
```js
...

router.on(/\/product\/[0-9]/, ({ path, state }) => {
   console.log(path); // '/product/23'
   console.log(extractIdFromPath(path)); // 23
   console.log(state.productId); // 23

});

router.pushState('/product/23');
router.popState(); // go back



// change route with state
router.pushState('/product/32', { productId: 32, allowPreview: true });

// after external route change you need call applyState
// history.pushState(state, title, url);
// router.applyState();
// then router will try match current location to defined routes
```

## Promise resolve
```js
...

router
    // Resolve route only when authorized
    .resolve(() => auth.isAuthorized())
    .on(/\/product\/[0-9]/, ({ path, state }) => {
});

```
---
License
----

MIT
