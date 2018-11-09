import { Router } from '../lib/router.js';
import assert from 'assert';
import register from 'jsdom-global';

register (undefined, {
  url: 'https://test.me.plz/'
});

describe('Router', function() {
  this.beforeAll(() => {
    this.router = new Router();
    this.router
      .always(() => {
        this.state.always = true;
      })
      .on('/active/:id', ({ params }) => {
        this.state.active = params.id;
      })
      .on(/delete\/[0-9]/, ({ path }) => {
        const id = Number(path.replace('/delete/', ''));
        const index = this.state.items.findIndex(item => item.id === id);

        this.state.items.splice(index, 1);
      })
      .on('/', () => {
        this.state.active = null;
      });
  });

  this.beforeEach(() => {
    this.state = {
      items: [
        { id: 1, value: 'foo' },
        { id: 2, value: 'bar' },
        { id: 3, value: 'baz' },
        { id: 4, value: 'far' }
      ],
      active: 1,
      always: false
    };
  });

  it('constructor', () => {
    assert.equal(this.router instanceof Router, true);
  });

  it('route with params', () => {
    assert.equal(this.state.active, 1);
    assert.equal(this.state.always, false);

    this.router.pushState('/active/2');

    assert.equal(this.state.always, true);
    assert.equal(this.state.active, 2);
  });

  it('route with regexp', () => {
    assert.equal(this.state.items.length, 4);
    assert.equal(this.state.always, false);

    this.router.pushState('/delete/2');

    assert.equal(this.state.always, true);
    assert.equal(this.state.items.length, 3);
  });

  it('route with string', () => {
    assert.equal(this.state.active, 1);
    assert.equal(this.state.always, false);

    this.router.pushState('/');

    assert.equal(this.state.active, null);
  })

  it('forward - backward route change', () => {
    assert.equal(this.state.active, 1);
    assert.equal(this.state.always, false);

    this.router.pushState('/active/2');

    assert.equal(this.state.active, 2);
    assert.equal(this.state.always, true);

    this.router.pushState('/active/3');

    assert.equal(this.state.always, true);
    assert.equal(this.state.active, 3)

    // history.back();  does not work in jsdom

    history.pushState({}, '', '/active/2');
    this.router.applyState();

    assert.equal(this.state.active, 2);
    assert.equal(this.state.always, true);
    assert.equal(document.location.href, 'https://test.me.plz/active/2');
  });


  it('external route change', () => {
    assert.equal(this.state.active, 1);
    assert.equal(this.state.always, false);

    history.pushState({}, '', '/active/4');

    assert.equal(this.state.active, 1);
    assert.equal(this.state.always, false);

    this.router.applyState();

    assert.equal(this.state.always, true);
    assert.equal(this.state.active, 4);
  });
});
