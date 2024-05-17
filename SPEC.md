

**Details**
1. The database has a list of chat logs with unique ids(`self_id+peer_id+task_id`)
2. The peers will communicate through the exchange of a value each time
3. The chatlogs contain only two members and are composed of only one-way messages e.g. message from Ana to Bob for task 1


**Invite/Join Operation**
1. There is no such thing as invite.
2. The first time Ana needs to get the invite code to task 1 through other means.
3. Once Ana has the code. She can paste it and click join. A msg to create and append his writeable chatlog is sent to bob or maybe Ana can append this and notify Bob.
4. The invite code is maybe `bob_id+task_id`.
5. Two chat logs are appended to the DB. `ana_id+bob_id+task_id` by ana and `bob_id+ana_id+task_id` by bob.

**Chatlog message communication**
1. Bob append a message to chatlog `bob_id+ana_id+task_id`
2. Bob pings Ana or sends the latest length of the chatlog to Ana
3. Ana queries the DB using the index or maybe just checks the last appended message.

**Question?**
1. While the communication of chatlog messages is limited to the exchange of values or indexes, can we communicate a bit more for the creation of the chatlogs? E.g. see point 3 of **Invite/Join Operation**

---

### `journaling book database` module + `peer to peer networking` module
```js
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
    const taken = {}
    DB.reset = reset
    module.exports = DB
    function reset () { localStorage.clear() }
    function DB (seed, hook) {
      if (taken[seed]) throw new Error(`seed "${seed}" already taken`)
      const json = localStorage[seed] || (localStorage[seed] = '{}')
      const db = taken[seed] = JSON.parse(json)
      return { reader: id => make(id), author: id => make(id, 1), on }
      function on (debug) { hook = debug }
      function make (id, own) {
        if (!id) throw new Error('no journal book "id" provided')
        const book = db[id] || own && (db[id] = { id, seed, pages: [], peer: {} })
        if (own && (book.seed !== seed)) throw new Error('unauthorized')
        return own ? { id, add, get, len } : { id, get, len }
        async function add (x) {
          const len = book.pages.push(x)
          hook?.(x, id)
          localStorage[seed] = JSON.stringify(db)
          return len
        }
        async function get (i) { return book.pages[i] } // opts = { wait: false }
        async function len () { return book.pages.length }
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
      const network = taken[pk] = { id: pk, alias, peer: {} }
      const io = { at, on }
      return io
      async function at (id) {
        const peer = taken[id] || {}
        if (id === pk) throw new Error('cannot connect to itself')
        if (!network.online) throw new Error('network must be online')
        if (!peer.online) return // peer with id is offline or doesnt exist
        const { port1, port2 } = new MessageChannel()
        port2.by = port1.to = { id, alias }
        port1.to = port1.by = { id: pk, alias: peer.alias }
        peer.peer[pk] = port2
        peer.online(port2)
        return network.peer[id] = port1
      }
      function on (online) { network.online = online }
    }
  }
  /***************************************************************************/
})
/******************************************************************************
EXAMPLE:
******************************************************************************/
ANA() // start
// --------------------------------------------
async function ANA () {
  const IO = require('io')
  const DB = require('db')
  const [pk, sk] = [`6789yuoi`, `9876oiuy`]
  const seed = pk + sk
  const self_id = pk // state.id
  // --------------------
  const db = DB(seed)
  const io = IO('ana', seed)
  // --------------------
  const invite = { peer_id: self_id, info_id: '' }
  // --------------------
  // @TODO: example usage:
  io.on(port => {
    console.log('[ANA:IO]:connecting', port.by)
  })
  BOB(invite)
}
// --------------------------------------------
async function BOB (invite) {
  const IO = require('io')
  const DB = require('db')
  const generate_id = () => `${Math.random()}`.slice(2)
  const [pk, sk] = [`1234asdf`, `4321fdsa`]
  const seed = pk + sk
  const self_id = pk // state.id
  // --------------------
  const db = DB(seed)
  const io = IO('bob', seed)
  // --------------------
  const { peer_id, info_id } = invite
  // --------------------
  // @TODO: example usage:
  db.on((book_id, data) => { console.log('[BOB:DB]:append', { book_id, data }) })

  const book1 = db.author(`${self_id}-${peer_id}-${info_id}`)
  const book2 = db.reader(`${peer_id}-${self_id}-${info_id}`)

  console.log({ book1, book2 })

  io.on(peer => {
    console.log('[BOB:IO]:connecting', port.by)
  })
  io.at(peer_id)
}
```

**Summary**
- The goal of this project [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1235708587234562099)
- Here's how to structure task rooms [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1235710674290737163)
- Here's some naming convention [ref1](https://discord.com/channels/859134561018839060/1235708415322361966/1235718837765410919) [ref2](https://discord.com/channels/859134561018839060/1235708415322361966/1235711458487308409)
- Here's how to implement two peers [ref1](https://discord.com/channels/859134561018839060/1235708415322361966/1236072153569296415) [ref2](https://discord.com/channels/859134561018839060/1235708415322361966/1236430075650379806)
- Here's introduction of financial book keeping [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1236431670182285383)
- p2p data structure and how to mimic it [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1236454496188633239)
- Minimum use of `IO` [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1237085298467536976)
- Step-by-step explanation of the protocol b/w two peers [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1237205792789237860)
- Here's vault intro [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1237465272722653225)
- Talking about keeping communication minimum [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1237797514405740675)
- Here occured the big change in `DB` [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1238187047362101360)
- `dbdevtools` module discussion [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1238882893011484762)
- Data structure explanation [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1239211352183275540)
- Another major change in `DB` [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1239371466181709937)
- Explanation of standard msg format [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1239312712668811444)
