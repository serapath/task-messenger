// 1. all available modules
const REGISTRY = {
  'ana-data-vault': require('ana-data-vault'),
  'taskmessenger': require('..'),
  'bob-data-vault': require('bob-data-vault'),
  'devtools-vault': require('devtools-vault'),
  'ana-test': require('ana-test'),
  'bob-test': require('bob-test')
}
// 2. where to launch which module
const PROGRAMS = {
  "demo": {
    "taskmessenger": {
      "ana": {
        '': 'ana-data-vault',
        "taskchat": 'taskmessenger',
      },
      "bob": {
        '': 'bob-data-vault',
        "taskchat": 'taskmessenger',
      }
    },
    "devenv": {
      '': 'devtools-vault',
      "ana": {
        "test-db-io": 'ana-test',
      },
      "bob": {
        "test-db-io": 'bob-test',
      },
    },
  },
}
// 3. start
require('dbio')(REGISTRY, PROGRAMS)

/* STORY:
1. shim loads to define REGISTRY and PROGRAMS (validated + sanitized)
2. dbio -> dbio_loader runs:
    1. has PROGRAMS
    2. gets default args from currentScript
    3. sees user # params as well
    4. can access localStorage.autostart too
3. dbio_loader spawns: IFRAME(bundle_source)     +   ???
4. container runs:
  1. has PROGRAMS
  -> needs bundle.js#args  : === PROGRAMS
  -> needs user_args       : ???
  -> needs localStorage    : ???
5. scenarios:
  - PROGRAMS is currently used instead of bundle.js#args
  - user_args overwrite autostart overwrites DEFAULTS (PROGRAMS or bundle.js#args)
  - localStorage.autostart = user_args || DEFAULTS
  - any change updates user_args (location.hash), but also autostart
6. so container needs access to:
  - DEFAULTS: ok
  - [ ] but ideally through bundle.js#args
  - [ ] user_args via `location.hash`, but "update" needs to reflect in real browser bar
  - [ ] localStorage.autostart to read and store changes to -> needs to reflect in root browser window
  -
*/
// @TODO: spawn should auto append to an element in sys_sdk.document.body
// -> which is empty, because instead it is fullscreen populated by noscript iframe