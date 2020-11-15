import { Router } from '../src/router';
import assert from 'assert';
import register from 'jsdom-global';

register(undefined, {
    url: 'https://test.me.plz/',
    includeNodeLocations: true,
});

describe('Router', function (this: any) {
    this.beforeAll(() => {
        this.router = new Router();
        this.router
            .resolve(() => Promise.resolve(this.state.resolved))
            .always(() => {
                this.state.always = true;
            })
            .on('/active/:id', ({ params }) => {
                this.state.active = params.id;
            })
            .on(/delete\/[0-9]/, ({ path }) => {
                const id = Number(path.replace('/delete/', ''));
                const index = this.state.items.findIndex((item) => item.id === id);

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
                { id: 4, value: 'far' },
            ],
            active: 1,
            always: false,
            resolved: true,
        };

        this.afterEach(() => {
            this.router.pushState('/');
        });
    });

    it('constructor', () => {
        assert.equal(this.router instanceof Router, true);
    });

    it('route with params', (done) => {
        assert.equal(this.state.active, 1);
        assert.equal(this.state.always, false);

        this.router
            .pushState('/active/2')
            .then(() => {
                assert.equal(this.state.always, true);
                assert.equal(this.state.active, 2);
                done();
            })
            .catch((e) => null);
    });

    it('route with regexp', (done) => {
        assert.equal(this.state.items.length, 4);
        assert.equal(this.state.always, false);

        this.router.pushState('/delete/2').then(() => {
            assert.equal(this.state.always, true);
            assert.equal(this.state.items.length, 3);
            done();
        });
    });

    it('route with string', (done) => {
        assert.equal(this.state.active, 1);
        assert.equal(this.state.always, false);

        this.router.pushState('/').then(() => {
            assert.equal(this.state.active, null);
            done();
        });
    });

    it('forward - backward route change', (done) => {
        assert.equal(this.state.active, 1);
        assert.equal(this.state.always, false);

        this.router
            .pushState('/active/2')
            .then(() => {
                assert.equal(this.state.active, 2);
                assert.equal(this.state.always, true);
            })
            .then(() => {
                this.router
                    .pushState('/active/3')
                    .then(() => {
                        assert.equal(this.state.always, true);
                        assert.equal(this.state.active, 3);
                    })
                    .then(() => {
                        history.pushState({}, '', '/active/2');
                        this.router.applyState().then(() => {
                            assert.equal(this.state.active, 2);
                            assert.equal(this.state.always, true);
                            assert.equal(document.location.href, 'https://test.me.plz/active/2');
                            done();
                        });
                    });
            });
    });

    it('external route change', (done) => {
        assert.equal(this.state.active, 1);
        assert.equal(this.state.always, false);

        history.pushState({}, '', '/active/4');
        assert.equal(this.state.active, 1);
        assert.equal(this.state.always, false);

        this.router.applyState().then(() => {
            assert.equal(this.state.always, true);
            assert.equal(this.state.active, 4);

            done();
        });
    });

    it('resolve router method', (done) => {
        assert.equal(this.state.active, 1);
        assert.equal(this.state.always, false);
        this.state.resolved = false;

        this.router.pushState('/active/4').then(() => {
            assert.equal(this.state.active, 1);
            assert.equal(this.state.always, false);
            assert.equal(location.pathname, '/');

            this.state.resolved = true;
            this.router.pushState('/active/4').then(() => {
                assert.equal(location.pathname, '/active/4');
                assert.equal(this.state.active, 4);
                assert.equal(this.state.always, true);
                done();
            });
        });
    });

    it('route should revert state when resolver has been rejected', (done) => {
        assert.equal(this.state.active, 1);
        assert.equal(this.state.always, false);
        this.state.resolved = true;

        this.router.pushState('/active/4').then((allow) => {
            assert.equal(this.state.active, 4);
            assert.equal(this.state.always, true);
            assert.equal(location.pathname, '/active/4');
            assert.equal(allow, true);
            this.state.always = false;

            this.state.resolved = false;
            this.router.pushState('/active/3').then((allow) => {
                assert.equal(allow, false);
                assert.equal(location.pathname, '/active/4');
                assert.equal(this.state.active, 4);
                assert.equal(this.state.always, false);
                done();
            });
        });
    });
});
