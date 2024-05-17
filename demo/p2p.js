document.body.replaceChildren()
document.head.replaceChildren()

const require = ((registry, modules = {}) => function require (name) {
  if (modules[name]) return modules[name].exports
  if (registry[name]) {
    const exports = {}
    const module = { exports }
    registry[name](exports, module, require)
    return (modules[name] = module).exports
  }
  throw new Error(`module "${name}" not found`)
})({
/******************************************************************************
  DB.js
******************************************************************************/
db: function DB_js (exports, module, require) { // DB.js
  const cache = { }
  const admin = { reset, on: null }
  DB.admin = admin
  module.exports = DB
  function reset () { localStorage.clear() }
  function DB (seed, hook) {
    if (!seed || typeof seed !== 'string') throw new Error('no seed provided')
    DB.admin = undefined
    const pk = seed.slice(0, seed.length / 2)
    const sk = seed.slice(seed.length / 2, seed.length)
    if (cache[pk]) throw new Error(`seed "${seed}" already in use`)
    const db = open(pk) || save(cache[pk] = { // internal audit book
      pk, sk, books: {}, names: {}, pages: [], state: {}, peers: []
    })
    db.pages.push({ type: 'load' })
    make.on = on
    return make
    function on (debug) { hook = debug }
    function make ({ name, key } = {}, _on) {
      const book = load({ name, key })
      key = book.pk
      const own = db.books[book.pk]
      const api = own ? { key, add, get, version, on } : { key, get, version, on }
      return book && api
      async function add (x) {
        const { length: i } = book.pages
        if (admin?.on?.(x, i, key, pk)) return
        if (hook?.(key, x, i)) return
        book.pages[i] = x
        save(book)
        book.peers.forEach(notify_reader)
        return i
        function notify_reader (port) {
          if (typeof port === 'function') port([x, i, key])
          else port.postMessage([x, i, key])
        }
      }
      async function get (i) { return book.pages[i] } // opts = { wait: false }
      async function version () { return book.pages.length - 1 }
      async function on (name, fn) {
        if (!fn) [name, fn] = ['add', name]
        if (typeof fn === 'function' || fn.postMessage) book.peers.push(fn)
        throw new Error('`fn` must be a function')
      }
    }
    function save (book) {
      localStorage[book.pk] = JSON.stringify(Object.assign({}, book, { peers: [] }))
      return book
    }
    function open (key) {
      return cache[key] ||= JSON.parse(localStorage[key] || null)
    }
    function load ({ name, key }) {
      if (sk === key || pk === key) throw new Error(`unauthorized access`)
      if (key) {
        const book = open(key)
        if (book && name) {
          if (!db.names[name]) (db.names[name] = key)
          else if (db.names[name] !== key) throw new Error(`name "${name}" is in use`)
        }
        return book
      } else if (name) {
        key = db.names[name]
        return key ? open(key) : init({name})
      } else throw new Error('must provide `name` and/or `key` to load book')
    }
    function init (name) {
      const [pk, sk] = [2, 2].map(x => `${Math.random()}`.slice(x))
      const book = save(cache[pk] = { pk, sk, pages: [], state: {}, peers: [] })
      db.names[name] = pk
      db.books[pk] = sk
      save(db)
      return book
    }
  }
},
/******************************************************************************
  IO.js
******************************************************************************/
  io: function IO_js (exports, module, require) { // IO.js
    const taken = {}
    module.exports = IO
    function IO (alias, seed) {
      if (taken[seed]) throw new Error(`seed "${seed}" already taken`)
      const pk = seed.slice(0, seed.length / 2)
      const sk = seed.slice(seed.length / 2, seed.length)
      const self = taken[pk] = { id: pk, peer: {} }
      const io = { at, on }
      return io
      async function at (id, signal = AbortSignal.timeout(1000)) {
        if (id === pk) throw new Error('cannot connect to loopback address')
        if (!self.online) throw new Error('network must be online')
        const peer = taken[id] || {}
        // if (self.peer[id] && peer.peer[pk]) {
        //   self.peer[id].close() || delete self.peer[id]
        //   peer.peer[pk].close() || delete peer.peer[pk]
        //   return console.log('disconnect')
        // }
        if (!peer.online) return wait() // peer with id is offline or doesnt exist
        connect()
        function wait () {
          const { resolve, reject, promise } = Promise.withResolvers()
          signal.onabort = () => reject(`timeout connecting to "${id}"`)
          peer.online = { resolve }
          return promise.then(connect)
        }
        function connect () {
          signal.onabort = null
          const { port1, port2 } = new MessageChannel()
          port2.by = port1.to = id
          port2.to = port1.by = pk
          self.online(self.peer[id] = port1)
          peer.online(peer.peer[pk] = port2)
        }
      }
      function on (online) { 
        if (!online) return self.online = null
        const resolve = self.online?.resolve
        self.online = online
        if (resolve) resolve(online)
      }
    }
  },
  /******************************************************************************
    vault.js
  ******************************************************************************/
  vault: function vault_js (exports, module, require) { // vault.js
    module.exports = vault
    async function vault ({ name, pk, sk }) {
      const IO = require('io')
      const DB = require('db')
      const state = { name, pk, sk, net: {}, tasks: {} }
      state.seed = pk + sk
      state.id = pk
      const io = IO(name, state.seed)
      const db = DB(state.seed)
      // const book = db.author(seed)
      // const version = (await book.len() || await book.add({ name, status: {}, net: {}, aka: {} })) - 1
      const node = { io, db, state }
      return node
    }}
})
/******************************************************************************
EXAMPLE:
******************************************************************************/
const args_ana = [{ name: 'ana', pk: `6789ana`, sk: `9876oiuy` }]
const args_bob = [{ name: 'bob', pk: `1234bob`, sk: `4321fdsa` }]
void ANA_js({ args: args_ana  }) // ANA.js
.then(o => BOB_js({ args: args_bob.concat(o) })) // BOB.js

// --------------------------------------------

// --------------------------------------------
async function ANA_js ({ args }) { // ANA.js
  // SETUP
  const vault = require('vault')
  // const TM = require('tm')
  const [opts] = args
  const { io, db, state } = await vault(opts)
  // const tm = await TM(opts)
  db.on((book_id, data) => { 
    console.log('from book', book_id, opts.name, 'received msg', data)
   })
  // CONNECT
  const on = { connect, on_rx, on_join }
  io.on(port => {
    console.log('[ANA:IO]:connecting', port)
    port.onmessage = ({ data: msg }) => on[msg.type](msg, port)
  })
  return state.id
  async function connect ({ head, data }, port) { 
    state.net[head.from] = port
    state[`${state.id}-${head.from}`] = db({ name: `${state.id}-${head.from}` })
    state[`${head.from}-${state.id}`] = db({ name: `${head.from}-${state.id}`, key: data })
    state.net[head.from].postMessage({ head: {from: state.id, to: head.from}, type: 'connect', data: state[`${state.id}-${head.from}`].key })
    setTimeout(() => on_tx({ head: {from: state.id, to: head.from}, type: 'on_rx', data: 'Hello'}), 200)
  }
  async function on_rx ({ head, data }){ 
    const msg = await state[`${head.from}-${state.id}`].get(data)
    console.log('Log from ana: ', msg)
    print()
   }
  async function on_tx (msg){
    const { head } = msg
    state[`${state.id}-${head.to}`].add(msg)
  }
  async function on_join (id){
    tm.on_join(id)
  }
}
async function BOB_js ({ args }) { // BOB.js
  // SETUP
  const vault = require('vault')
  // const TM = require('tm')
  const [opts, peer_id] = args
  const { io, db, state } = await vault(opts)
  // const tm = await TM(db)

  db.on((book_id, data) => { 
    console.log('from book', book_id, opts.name, 'received msg', data)
   })
  // CONNECT
  const on = { on_rx, connect }
  io.on(port => {
    console.log('[BOB:IO]:connecting', port)
    port.onmessage = ({ data: msg }) => on[msg.type](msg)
    state.net[peer_id] = port
  })
  await io.at(peer_id)
  state[`${state.id}-${peer_id}`] = db({ name: `${state.id}-${peer_id}` })
  state.net[peer_id].postMessage({ head: {from: state.id, to: peer_id}, type: 'connect', data: state[`${state.id}-${peer_id}`].key })
  // create_task({ title: 'task1', parent: '' })
  // on_tx({ head: {from: state.id, to: peer_id}, type: 'on_join', data: state.tasks['0'] })

  async function connect ({ head, data }, port) { 
    state.net[head.from] = port
    state[`${head.from}-${state.id}`] = db({ name: `${head.from}-${state.id}`, key: data })
    on_tx({ head: {from: state.id, to: peer_id}, type: 'on_rx', data: 'Hi' })
  }
  async function on_rx ({ head, data }){ 
    state[`${head.from}-${state.id}`] = db.reader(`${head.from}-${state.id}`, head.from)
    const msg = await state[`${head.from}-${state.id}`].get(data)
    console.log('Log from bob: ', msg)
   }
  async function on_tx (msg){
    const { head } = msg
    state[`${state.id}-${head.to}`].add(msg)
  }
  async function create_task (msg){
    const {index, task_id} = await tm.on_create(msg)
    state.tasks[task_id] = index
  }
}


function print () {
  const keys = Object.keys(localStorage);

  // Iterate over the keys and retrieve corresponding values
  const allLocalStorage = {};
  keys.forEach(key => {
    allLocalStorage[key] = JSON.parse(localStorage[key])
  });
  console.log(allLocalStorage)
}