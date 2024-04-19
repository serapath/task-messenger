(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process,__filename,__dirname){(function (){
const task_messenger = require('..')
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet()
sheet.replaceSync(get_theme())
// ----------------------------------------
config().then(() => boot({ }))
/******************************************************************************
  CSS & HTML Defaults
******************************************************************************/
async function config () {
  const path = path => new URL(`../src/node_modules/${path}`, `file://${__dirname}`).href.slice(8)
  const html = document.documentElement
  const meta = document.createElement('meta')
  html.setAttribute('lang', 'en')
  meta.setAttribute('name', 'viewport')
  meta.setAttribute('content', 'width=device-width,initial-scale=1.0')
  document.adoptedStyleSheets = [sheet]
  document.head.append(meta)
}
/******************************************************************************
  PAGE BOOT
******************************************************************************/
async function boot (opts) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.body
  const shopts = { mode: 'closed' }
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // task_messenger
    const on = {
      'send': send
    }
    const users = [ 'bob', 'ana' ]
    users.forEach(async username => {
      const protocol = use_protocol('task_messenger'+'_'+username)({ state, on })
      const element = await task_messenger( opts = { username, users }, protocol)
      shadow.append(element)
    })
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return

  async function send ({ data }) {
    data.users.forEach(user => {
      const channel = state.net[state.aka['task_messenger'+'_'+user]]
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'send',
        data: data
      })
    })
  }
}
function get_theme () {
  return `
    body{
      color-scheme: dark;
      display: flex;
      margin: 0;
    }
    div{
      width: 100%;
    }
  `
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
}).call(this)}).call(this,require('_process'),"/demo/demo.js","/demo")
},{"..":3,"_process":2}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
(function (process,__filename){(function (){
const task_explorer = require('task_explorer')
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
//  ----------------------------------------
const sheet = new CSSStyleSheet()
sheet.replaceSync(get_theme())
const shopts = { mode: 'closed' }
//  ----------------------------------------
module.exports = task_messenger
//  ----------------------------------------
async function task_messenger (opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const name = 'task_messenger'
  let shift_status = true
  let users = opts.users.filter(username => username!==opts.username)
  const username = opts.username
  let chat
  let textmode = "msg"
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {
    'on_post_msg': on_post_msg,
    'send': send
  }
  const channel_up = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div');
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `
    <div class="main">
      <header>
      ${opts.username}
      </header>
      <div class="container">
        <div class="chat">
          <div class="history">
          </div>
        </div>
        <div class="crud">
          <div class="btn_wrapper">
            <div class="popup" tabindex='0'>
              <div class="noblur">📥 Input </div>
              <div class="noblur">📤 Output </div>
              <div class="noblur">📭 Task </div>
            </div>
            <button class="add noblur">
              +
            </button>
          </div>
          <button class="join noblur">
            join
          </button>
          <button class="export noblur">
            export
          </button>
          <textarea class="noblur" placeholder="join a channel" disabled></textarea>
          <div class="send">></div>
        </div>
      </div>
    </div>
  `
  // ----------------------------------------
  const container = shadow.querySelector('.container')
  const btn_add = shadow.querySelector('.add')
  const btn_join = shadow.querySelector('.join')
  const btn_export = shadow.querySelector('.export')
  const btn_send = shadow.querySelector('.send')
  const textarea = shadow.querySelector('textarea')
  const history = shadow.querySelector('.history')
  const popup = shadow.querySelector('.popup')
  // ----------------------------------------
  btn_add.onclick = handle_popup
  btn_join.onclick = handle_join
  btn_export.onclick = handle_export
  btn_send.onclick = handle_send
  textarea.onkeyup = handle_keyup
  textarea.onkeydown = handle_keydown
  for (const child of popup.children){
    child.onclick = handle_add
  }
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  {//task explorer
    const on = {
      send,
      open_chat,
      post_msg,
    }
    const protocol = use_protocol('task_explorer')({ state, on })
    const element = task_explorer(opts = { users, host: username }, protocol)
    container.prepend(element)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  return el

  async function handle_export () {
    const channel = state.net[state.aka.task_explorer]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'handle_export',
    })
  }
  async function handle_popup () {
    popup.focus()
  }
  async function handle_send () {
    if(textarea.disabled)
      return
    if(textmode === "msg")
      post_msg()
    else
      join()
  }
  async function handle_keydown (e) {
    if(shift_status)
      switch (e.key){
        case 'Enter':
          e.preventDefault()
          if(textmode === "msg")
            post_msg({data: {content: textarea.value.replaceAll('\n', '<br>'), username}})
          else
            join()
          break
        case 'Shift':
          shift_status = false
      }
  }
  async function handle_add (e) {
    popup.classList.remove('show')
    
    const channel = state.net[state.aka.task_explorer]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'handle_add',
      data: e.target.innerHTML
    })
  }
  async function handle_keyup (e) {
    e.target.style.height = "1px";
    e.target.style.height = (2+e.target.scrollHeight)+"px";
    if(e.key === 'Shift')
      shift_status = true
    
  }
  async function handle_join () {
    textarea.disabled = false
    textarea.placeholder = "Enter a invite code"
    textmode = 'join'
  }
  async function join () {
    const [user, task_id] = textarea.value.split('-')
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'send',
      data: {to: 'task_explorer', route: ['task_explorer'], users: [user], type: 'handle_invite', data: {sender: opts.host, task_id}}
    })
  }
  async function post_msg ({ data }) {
    const {content, username} = data
    const element = document.createElement('div')
    element.classList.add('msg', 'right')
    textarea.value = ''
    if(username === 'system'){
      element.classList.add('system')
      element.innerHTML = content
    }
    else
      element.innerHTML = `
          <div class='username'>
            ${username}
          </div>
          ${content}`
    history.append(element)

    const channel = state.net[state.aka.task_explorer]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'post_msg',
      data: {content, username, chat_id: chat.id}
    })
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'send',
      data: {from: username, users, to: 'task_messenger', type: 'on_post_msg', data_re: {content: content, chat_id: chat.id}}
    })

    history.scrollTop = history.scrollHeight
  }
  async function on_post_msg (data) {
    const { from, data_re } = data
    const { content, chat_id } = data_re
    const channel = state.net[state.aka.task_explorer]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'post_msg',
      data: {content, username: from, chat_id}
    })
    if(chat && chat_id === chat.id){
      const element = document.createElement('div')
      element.classList.add('msg')
      if(from === 'system'){
        element.classList.add('system')
        element.innerHTML = content
      }
      else
        element.innerHTML = `
            <div class='username'>
              ${from}
            </div>
            ${content}`
      history.append(element)  
    }
    history.scrollTop = history.scrollHeight
  }
  async function send ({ data }) {
    const {to, route} = data
    if(to === name){
      on[data.type](data)
      return
    }
    const channel = state.net[state.aka[route[0]]]
    data.route = data.route.slice(1)
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'send',
      data
    })
  }
  async function open_chat ({ data }){
    chat = {data: data.chat_data, id: data.chat_id}
    history.innerHTML = ''
    chat.data.forEach(msg => {
      const element = document.createElement('div')
      element.classList.add('msg')
      if(msg.username === 'system'){
        element.classList.add('system')
        element.innerHTML = msg.content
      }
      else{
        msg.username === username && element.classList.add('right')
        element.innerHTML = `
          <div class='username'>
            ${msg.username}
          </div>
          ${msg.content}`
      }
      history.append(element)
    })
    textarea.disabled = false
    textarea.placeholder = "Type a message"
  }
}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
    }
    .main{
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100vh;
      width: 100%;
      color: white;
      background-color: black;
      border: 1px solid gray;
    }
    .container{
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      border: 1px solid gray;
    }
    .crud{
      display: flex;
      gap: 10px;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border: 1px solid gray;
    }
    .chat{
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      border-top: 1px solid gray;
      background-color: #212121;
    }
    .chat > .history{
      display: flex;
      flex-direction: column;
      min-height: 100%;
      overflow-y: scroll;
      max-height: 50px;
    }
    .chat .msg{
      background-color: #555;
      margin: 10px;
      padding: 10px;
      border-radius: 6px;
      width: fit-content;
      position: relative;
    }
    .chat .msg:first-child{
      margin-top: auto;
    }
    .chat .msg.right{
      margin-left: auto;
    }
    .chat .msg.system{
      margin: 0 auto;
      background: none;
    }
    .chat .msg .username{
      position: absolute;
      top: -16px;
      font-size: 14px;
    }
    .chat .msg.right .username{
      right: 10px;
    }
    textarea{
      margin: 40px 20px;
      height: 40px;
      min-height: 40px;
      padding: 10px;
      width: 100%;
    }
    textarea::-webkit-scrollbar{
      display: none;
    }
    .btn_wrapper{
      position: relative;
    }
    .btn_wrapper .popup{
      height: 0;
      position: absolute;
      bottom: 100%;
      background: black;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
    }
    .btn_wrapper .popup:focus{
      height: auto;
      padding: 5px;
      border: 1px solid gray;
    }
    .send{
      padding: 7px 10px;
      background-color: black;
      position: absolute;
      right: 40px;
      width: 30px;
      height: 30px;
      cursor: pointer;
      border-radius: 4px;
    }
  `
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disjoin channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}

}).call(this)}).call(this,require('_process'),"/src/index.js")
},{"_process":2,"task_explorer":5}],4:[function(require,module,exports){
module.exports=[
  {
      "id": 0,
      "users": [
          "ana",
          "bob"
      ],
      "name": "roadmap",
      "type": "task",
      "root": true,
      "tasks": [
          1,
          2
      ],
      "chat": [
          {
              "username": "ana",
              "content": "Hello"
          },
          {
              "username": "bob",
              "content": "Hello"
          },
          {
              "username": "system",
              "content": "Added UI/UX design"
          }
      ]
  },
  {
      "id": 1,
      "users": [
          "ana",
          "bob"
      ],
      "name": "UI/UX design",
      "type": "task",
      "tasks": [
          3,
          4
      ],
      "parent": 0,
      "chat": []
  },
  {
      "id": 2,
      "users": [
          "ana",
          "bob"
      ],
      "name": "implementation",
      "type": "task",
      "tasks": [
          5,
          6
      ],
      "parent": 0,
      "chat": []
  },
  {
      "id": 3,
      "users": [
          "ana",
          "bob"
      ],
      "name": "design button",
      "type": "task",
      "outputs": [
          7
      ],
      "tasks": [
          8,
          10
      ],
      "parent": 1,
      "chat": []
  },
  {
      "id": 4,
      "users": [
          "ana",
          "bob"
      ],
      "name": "design searchbar",
      "type": "task",
      "tasks": [
          8,
          10
      ],
      "parent": 1,
      "chat": []
  },
  {
      "id": 5,
      "users": [
          "ana",
          "bob"
      ],
      "name": "implement button",
      "type": "task",
      "inputs": [
          7,
          9,
          11
      ],
      "outputs": [
          12,
          13,
          14
      ],
      "tasks": [
          15
      ],
      "parent": 2,
      "chat": []
  },
  {
      "id": 6,
      "users": [
          "ana",
          "bob"
      ],
      "name": "implement searchbar",
      "type": "task",
      "parent": 2,
      "chat": []
  },
  {
      "id": 7,
      "users": [
          "ana",
          "bob"
      ],
      "name": "button repo",
      "type": "io",
      "tasks": [
          5,
          6
      ],
      "parent": 3,
      "chat": []
  },
  {
      "id": 8,
      "users": [
          "ana",
          "bob"
      ],
      "name": "make button icon",
      "type": "task",
      "outputs": [
          9
      ],
      "parent": 3,
      "chat": []
  },
  {
      "id": 9,
      "users": [
          "ana",
          "bob"
      ],
      "name": "button icon.svg",
      "type": "io",
      "tasks": [
          5,
          6
      ],
      "parent": 8,
      "chat": []
  },
  {
      "id": 10,
      "users": [
          "ana",
          "bob"
      ],
      "name": "wireframe button",
      "type": "task",
      "outputs": [
          11
      ],
      "parent": 3,
      "chat": []
  },
  {
      "id": 11,
      "users": [
          "ana",
          "bob"
      ],
      "name": "button.fig",
      "type": "io",
      "tasks": [
          5,
          6
      ],
      "parent": 10,
      "chat": []
  },
  {
      "id": 12,
      "users": [
          "ana",
          "bob"
      ],
      "name": "button.js",
      "type": "io",
      "parent": 5,
      "chat": []
  },
  {
      "id": 13,
      "users": [
          "ana",
          "bob"
      ],
      "name": "button.css",
      "type": "io",
      "parent": 5,
      "chat": []
  },
  {
      "id": 14,
      "users": [
          "ana",
          "bob"
      ],
      "name": "button.html",
      "type": "io",
      "parent": 5,
      "chat": []
  },
  {
      "id": 15,
      "users": [
          "ana",
          "bob"
      ],
      "name": "write button js, css, and html",
      "type": "task",
      "parent": 5,
      "chat": []
  }
]
},{}],5:[function(require,module,exports){
(function (process,__filename){(function (){
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
//  ----------------------------------------
const sheet = new CSSStyleSheet()
sheet.replaceSync(get_theme())
const shopts = { mode: 'closed' }
//  ----------------------------------------
module.exports = task_explorer
//  ----------------------------------------
function task_explorer (opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const { host } = opts
  const json_data = JSON.parse(JSON.stringify(require('./data.json')))
  const name = 'task_explorer'
  let selected_task
  let chat_task, result, track
  let code_words = {inputs: 'io', outputs: 'io', tasks: 'task'}
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 
    'on_add_node': on_add_node,
    'handle_add': handle_add,
    'send': send,
    'post_msg': post_msg,
    'handle_invite': handle_invite,
    'on_invite': on_invite,
    'handle_export': handle_export
  }
  const channel_up = use_protocol('up')({ protocol, state, on })

  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div');
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `
    <main>
    </main>`
  // ----------------------------------------
  const tree_el = shadow.querySelector('main')
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  fill_tree_el()
  return el

  async function fill_tree_el () {
    tree_el.innerHTML = ''
    tree_el.append(...json_data.filter(data => data.root).map(add_node_el))
  }
  function add_node_el (data) {
    const element = document.createElement('div')
    element.classList.add(data.type, 'node')
    element.tabIndex = '0'
    element.id = 'a'+data.id
    element.innerHTML = `
      <div class="inputs nodes">
      </div>
      <div class="task_name">
        <div class="before"></div>
        <div class="emoji"></div>
        ${data.name}
        <div class="after">🔗</div>
      </div>
      <div class="outputs nodes">
      </div>
      <div class="tasks nodes">
      </div>
    `

    const before = element.querySelector('.task_name > .before')
    const after = element.querySelector('.task_name > .after')
    const outputs = element.querySelector('.outputs')
    const inputs = element.querySelector('.inputs')
    const tasks = element.querySelector('.tasks')
    before.onclick = () => {
      element.classList.toggle('show')
      if(data.outputs && outputs.children.length < 1){
        for(const i of data.outputs)
          outputs.append(add_node_el(json_data[i]))
        outputs.classList.add('padding')
      }
      if(data.tasks && tasks.children.length < 1){
        for(const i of data.tasks)
          tasks.append(data.type === 'io' ? add_node_link(json_data[i]) : add_node_el(json_data[i]))
        tasks.classList.add('padding')
        outputs.classList.add('border')
      }
      if(data.inputs && inputs.children.length < 1){
        for(const i of data.inputs)
          inputs.append(add_node_el(json_data[i]))
        inputs.classList.add('padding')
      }
    }
    element.onfocus = () => {
      selected_task = element
      selected_task.addEventListener('blur', e => {
        if(e.relatedTarget && e.relatedTarget.classList.contains('noblur'))
          return
        selected_task = undefined
      })
    }
    element.ondblclick = open_chat
    after.onclick = () => {
      alert(host+'-'+data.id)
      try{
        navigator.clipboard.writeText(host+'-'+data.id) 
      }
      catch{

      }
    }
    return element
  }
  function add_node_link (data) {
    const element = document.createElement('div')
    element.classList.add('next', 'node')
    element.dataset.id = data.id
    element.innerHTML = `
      <div class="task_name">
        <div class="before"></div>
        ${data.name}
      </div>`
    element.onclick = jump
    
    return element
  }
  async function jump (e){
    let target_id = e.currentTarget.dataset.id
    const el = tree_el.querySelector('#a'+target_id)
    if(el)
      el.focus()
    else{
      let temp = json_data[target_id]
      const path = []
      while(!temp.root){
        path.push(temp.id)
        temp = json_data[temp.parent]
      }
      temp = tree_el.querySelector('#a'+temp.id)
      target_id = 'a'+target_id
      while(temp.id !== target_id){
        const before = temp.querySelector('.before')
        before.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable: true, view: window}))
        temp.classList.add('show')
        temp = temp.querySelector('#a'+path.pop())
      }
      temp.focus()
    }
      
  }
  async function traverse (id) {
    result = []
    track = []
    recurse(id)
    return result
  }
  function recurse (id){
    if(track.includes(id))
      return
    result.push(json_data[id])
    track.push(id)
    temp = 0
    while(json_data[id].tasks && temp < json_data[id].tasks.length){
      recurse(json_data[id].tasks[temp])
      temp++
    }
    temp = 0
    while(json_data[id].inputs && temp < json_data[id].inputs.length){
      recurse(json_data[id].inputs[temp])
      temp++
    }
    temp = 0
    while(json_data[id].outputs && temp < json_data[id].outputs.length){
      recurse(json_data[id].outputs[temp])
      temp++
    }
  }
  async function add_node_data (name, type, parent_id, users){
    const node_id = json_data.length
    json_data.push({ id: node_id, name, type: code_words[type], chat: [], users })
    if(parent_id){
      console.error(json_data[parent_id])
      !chat_task && json_data[parent_id].chat.push({username: 'system', content: 'Added '+name})
      const sub_nodes = json_data[parent_id][type]
      sub_nodes ? sub_nodes.push(node_id) : json_data[parent_id][type] = [node_id]
    }
    else{
      json_data[node_id].root = true
      json_data[node_id].users = [opts.host]
    }
  }
  async function on_add_node (data) {
    const node = data.id ? shadow.querySelector('#a' + data.id + ' > .'+data.type) : tree_el
    node.children.length > 0 && node.prepend(add_node_el({ name: data.name, id: json_data.length, type: code_words[data.type] }))
    add_node_data(data.name, data.type, data.id, data.users.push(host))
  }
  async function handle_export () {
    // const data = await traverse( selected_task.id.slice(1) )
    // const json_string = JSON.stringify(data, null, 2);
    // const blob = new Blob([json_string], { type: 'application/json' });
    // const link = document.createElement('a');
    // link.href = URL.createObjectURL(blob);
    // link.download = 'data.json';
    // link.click();

    alert(selected_task.innerText);
    navigator.clipboard.writeText(selected_task.innerText)
    .then(() => {
        // Cleanup
        window.getSelection().removeAllRanges();
        document.body.removeChild(tempElement);
        alert('HTML copied to clipboard');
    })
    .catch((err) => {
        console.error('Failed to copy HTML: ', err);
    });

  }
  async function handle_add ({ data }) {
    data = data.slice(2).trim().toLowerCase() + 's'
    const input = document.createElement('input')
    let node, task_id
    if(selected_task){
      node = selected_task.querySelector('.' + data)
      task_id = selected_task.id.slice(1)
      const before = selected_task.querySelector('.before')
      before.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable: true, view: window}))
      selected_task.classList.add('show')
    }
    else{
      node = tree_el
      task_id = ''
    }

    node.prepend(input)
    input.onkeydown = async (event) => {
      if (event.key === 'Enter') {
        node.firstElementChild.remove()
        node.prepend(add_node_el({ name: input.value, id: json_data.length, type: code_words[data] }))
        const users = task_id ? json_data[task_id].users : [host]
        add_node_data(input.value, data, task_id, users)
        if(task_id && json_data[task_id].users.length > 1)
          channel_up.send({
            head: [id, channel_up.send.id, channel_up.mid++],
            type: 'send',
            data: {to: 'task_explorer', route: ['up', 'task_explorer'], users: json_data[task_id].users.filter(user => user !== host), type: 'on_add_node', data: {name: input.value, id: task_id, type: data, users} }
          })
        if(chat_task && task_id === chat_task.id.slice(1))
          channel_up.send({
            head: [id, channel_up.send.id, channel_up.mid++],
            type: 'post_msg',
            data: {username: 'system', content: 'Added '+input.value}
          })
      }
    }
    input.focus()
  }
  async function send ({ data }) {
    const {to, route} = data
    if(to === name){
      const {type, data: shuttle_data} = data
      on[type](shuttle_data)
      return
    }
    const channel = state.net[state.aka[route[0]]]
    data.route = data.route.slice(1)
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'send',
      data
    })
  }
  async function open_chat () {
    const node = json_data[Number(selected_task.id.slice(1))]
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'open_chat',
      data: {chat_data: node.chat, chat_id: node.id}
    })
    
    if(chat_task)
      chat_task.classList.remove('chat_active')
    chat_task = selected_task
    chat_task.classList.add('chat_active')
  }
  async function post_msg ({ data }) {
    const node = json_data[Number(data.chat_id)]
    console.error(node)
    node.chat.push({ username: data.username, content: data.content })
  }
  async function handle_invite ({ sender, task_id }) {
    const node = json_data[Number(task_id)]
    console.error(task_id, json_data)
    node.users.push(sender)
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'send',
      data: {to: 'task_explorer', route: ['up', 'task_explorer'], users: [sender], type: 'on_invite', data: node }
    })
  }
  async function on_invite (data) {
    const {name, id, type} = data
    tree_el.prepend(add_node_el({ name, id, type }))
    json_data.push(data)
  }
}

function get_theme () {
  return `
  main{
    max-height: 300px;
    overflow-y: scroll;
  }
  .task{
    cursor: pointer;
    margin: 5px 0;
    margin-left: 10px;
  }
  .task_name > .emoji{
    display: inline;
    margin-left: -4px;
  }
  .node > .task_name > .emoji::before{
    content: '─📭';
  }
  .node > .task_name::before{
    content: '├➕';
  }
  :not(.inputs) > .node:last-child > .task_name::before{
    content: '└➕';
  }
  .node.show > .task_name::before{
    content: '├➖';
  }
  :not(.inputs) > .node.show:last-child > .task_name::before{
    content: '└➖';
  }
  .next > .task_name::before {
    content: '├🖇️─';
  }
  .next:last-child > .task_name::before {
    content: '└🖇️─';
  }
  .node > .nodes{
    display: none;
    margin: 5px 0;
    padding-left: 5px;
    margin-left: 0;
    border-left: 1px solid white;
    position: relative;
  }
  .node:last-child > .tasks,
  .node:last-child > .outputs{
    border-color: transparent;
  }

  .task .task_name{
    margin-left: -5px;
  }
   .input.padding:first-child,
   .tasks.padding:first-child{
    padding-top: 5px;
  }
   .output.padding:last-child,
   .tasks.padding:last-child{
    padding-bottom: 5px
  }
  .inputs > .io > .task_name > .emoji::before{
    content: '─📥';
  }
  .outputs > .io > .task_name > .emoji::before{
    content: '─📤';
  }
  .inputs > .node:first-child > .task_name::before{
    content: '┌➕';
  }
  .inputs.show > .node:first-child > .task_name::before{
    content: '┌➖';
  }
  .task_name{
    position: relative;
  }
  .task_name > .before{
    display: inline;
    position: absolute;
    left: 0;
    width: 43px;
    height: 18px;
  }
  .task_name > .after{
    display: inline;
  }
   .io{
    padding-left: 15px;
    margin-left: 10px;
  }
  .outputs.border > .io{
    border-left: 1px solid white;
  }
  .task:focus{
    background-color: #222;
  }
  .task.chat_active > .task_name::after{
    content: '';
    background-color: green;
    border-radius: 100%;
    width: 10px;
    height: 10px;
    display: inline-block;
  }
  .node.show > .nodes{
    display: block;
  }
  `
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}

}).call(this)}).call(this,require('_process'),"/src/node_modules/task_explorer/task_explorer.js")
},{"./data.json":4,"_process":2}]},{},[1]);
