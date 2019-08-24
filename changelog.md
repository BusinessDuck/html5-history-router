# Change Log
All notable changes to this project will be documented in this file.

## [0.1.1]
### Changed
- Build with rollup
- Enforce es3 with buble
- Builds for web, nodejs (es, cjs)
- Added test coverage

## 0.1.1
### Added
- Changelog.md
- Fix missed <Promise> return
- Fix incorrect state revert when route change has been rejected by route resolve function
- Added tests

### Changed
- All methods should return `<Promise>` with state true or false depend from route applied

## 0.1.0
### Changed
- Added `router.resolve(callbackFn)` hook, return `true` if route can be applied or `false` if not
- Added rollback state for reverting unresolved routes (when resolve => false)
- Refactoring & iprovements