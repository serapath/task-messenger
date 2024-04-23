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
          <div class="box">
            <div class="overlay">
              <div>/🗃list <span>📌</span></div>
              <div>/📩text <span>📌</span></div>
              <div>/🆕🔳task <span>📌</span></div>
              <div>/🔳subtask <span>📌</span></div>
              <div>/📨invite <span>📌</span></div>
              <div>/📥input <span>📌</span></div>
              <div>/📤output <span>📌</span></div>
              <div>/😀emoji <span>📌</span></div>
              <div>/📎attach file <span>📌</span></div>
            </div>
            <textarea class="noblur" placeholder="Enter a command"></textarea>
          </div>
          <div class="send">></div>
        </div>
      </div>
      <div class="footer">
        <div class="title">
        </div>
        <div class="task">
        </div>
        <div class="input">
        </div>
        <div class="output">
        </div>
      </div>
    </div>
  `
  // ----------------------------------------
  const chat_el = shadow.querySelector('.chat')
  const btn_add = shadow.querySelector('.add')
  const btn_join = shadow.querySelector('.join')
  const btn_export = shadow.querySelector('.export')
  const btn_send = shadow.querySelector('.send')
  const textarea = shadow.querySelector('textarea')
  const history = shadow.querySelector('.history')
  const popup = shadow.querySelector('.popup')
  const footer = shadow.querySelector('.footer')
  const overlay = shadow.querySelector('.overlay')
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
    chat_el.after(element)
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
      post_msg({data: {content: textarea.value.replaceAll('\n', '<br>'), username}})
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
    if(textarea.value === '/'){
      overlay.classList.add('show')
      textarea.addEventListener('blur', textarea_onblur)
      textarea.addEventListener('focus', textarea_onblur)
    }
    else{
      overlay.classList.remove('show')
      textarea.removeEventListener('blur', textarea_onblur)
      textarea.removeEventListener('focus', textarea_onblur)
    }
  }
  async function textarea_onblur () {
    overlay.classList.toggle('show')
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
    chat = {data: data.chat, id: data.id}
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

    const title = footer.querySelector('.title')
    title.innerHTML = data.name
    const input = footer.querySelector('.input')
    input.innerHTML = `Inputs: ${data.inputs ? data.inputs.length : '0'}`
    const output = footer.querySelector('.output')
    output.innerHTML = `Outputs: ${data.outputs ? data.outputs.length : '0'}`
    const task = footer.querySelector('.task')
    task.innerHTML = `Tasks: ${data.tasks ? data.tasks.length : '0'}`
    
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
      border-bottom: 1px solid gray;
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
    .box{
      position: relative;
      margin: 40px 20px;
    }
    .box > textarea{
      height: 40px;
      min-height: 40px;
      padding: 10px;
      width: 100%;
    }
    .box > .overlay{
      display: none;
      position: absolute;
      background-color: #222;
      box-shadow: 0 0 2px 1px rgb(255, 255, 255);
      width: 100%;
      bottom: 50px;
    }
    .box > .overlay.show{
      display: block;
    }
    .box > .overlay > div{
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 4px 10px;
    }
    .box > .overlay > div:hover{
      background-color: #555;
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
    .footer{
      display: flex;
      justify-content: space-around;
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
              "content": "Ana added task: UI/UX design"
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
      "sup": [0],
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
      "sup": [0],
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
      "sup": [1],
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
      "sup": [1],
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
      "sup": [2],
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
      "sup": [2],
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
      "sup": [3],
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
      "sup": [3],
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
      "sup": [8],
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
      "sup": [3],
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
      "sup": [10],
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
      "sup": [5],
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
      "sup": [5],
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
      "sup": [5],
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
      "sup": [5],
      "chat": []
  }
]
},{}],5:[function(require,module,exports){
(function (process,__filename){(function (){
const taskdb = require('taskdb')
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
  const name = 'task_explorer'
  let selected_task, query_result
  let chat_task, result, track
  const code_words = {inputs: 'io', outputs: 'io', tasks: 'task'}
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
  const on_add = {
    'inputs': add_node_input,
    'outputs': add_node_output,
    'tasks': add_node_sub
  }
  const channel_up = use_protocol('up')({ protocol, state, on })

  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div');
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `
    <div class="box">
      <main>
      </main>
      <div class="popup" tabindex="0">
        <div>Edit</div>
        <div>Drop</div>
      </div>
    </div>
    `
  // ----------------------------------------
  const tree_el = shadow.querySelector('main')
  const popup = shadow.querySelector('.popup')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  {
    const on = { 
      'set': set
    }
    const protocol = use_protocol('taskdb')({ state, on })
    taskdb(opts = {host}, protocol)
    async function set ({ data }) {
      query_result = data
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  let json_data
  const channel = state.net[state.aka.taskdb]
  channel.send({
    head: [id, channel.send.id, channel.mid++],
    type: 'get',
    data: '/'
  })
  if(query_result)
    json_data = query_result
  else{
    json_data = JSON.parse(JSON.stringify(require('./data.json')))
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'set',
      data: json_data
    })
  }

  fill_tree_el()
  return el

  async function fill_tree_el () {
    const root_nodes = json_data.filter(data => data.root)
    const length = root_nodes.length - 1
    tree_el.append(...root_nodes.map((data, i) => add_node_root({ data, last: i === length })))
  }
  function add_node_el ({ data, parent, space, super_last, type }){
    const check = parent.children.length ? false : true
    if(data.root){
      parent.prepend(add_node_root({ data, last: false}))
      return
    }
    if(type === 'inputs')
      parent.append(on_add[type]({ data, space, super_last, first: check}))
    else
      parent.prepend(on_add[type]({ data, space, super_last, last: check}))

  }
  function add_node_root ({ data, last }) {
    const element = document.createElement('div')
    element.classList.add(data.type, 'node')
    element.tabIndex = '0'
    element.id = 'a'+data.id
    const space = ''
    element.dataset.space = space
    element.dataset.super_last = last ? 'a' : ''

    element.innerHTML = `
      <div class="task_name">
        ${last ? '└' : '├'}<span class="tas">📓─</span>${data.name}<span class="last">...</span>
      </div>
      <div class="tasks nodes">
      </div>
    `
    const task_name = element.querySelector('.task_name')
    const sub = element.querySelector('.task_name > .tas')
    const last_el = element.querySelector('.task_name > .last')
    // const after = element.querySelector('.task_name > .after')
    const tasks = element.querySelector('.tasks')
    
    let sub_open
    sub.onclick = () => {
      if(sub_open){
        sub.innerHTML = '📓─'
      } else{
        sub.innerHTML = '📖┬'
      }
      sub_open = !sub_open
      tasks.classList.toggle('show')
      if(data.tasks && tasks.children.length < 1){
        length = data.tasks.length - 1
        data.tasks.forEach((value, i) => data.type === 'io' ? add_node_link(json_data[value]) : tasks.append(add_node_sub({ data: json_data[value], last: length === i, super_last: last, space })))
      }
    }
    element.onfocus = () => {
      selected_task = element
      selected_task.classList.add('focus')
      selected_task.addEventListener('blur', e => {
        if(e.relatedTarget && e.relatedTarget.classList.contains('noblur'))
          return
        selected_task.classList.remove('focus')
        selected_task = undefined
      }, { once: true })
    }
    last_el.onclick = () => {
      last_el.classList.add('show')
      popup.style.top = last_el.offsetTop - 20 + 'px'
      popup.style.left = last_el.offsetLeft - 56 + 'px'
      popup.focus()
      popup.addEventListener('blur', () => {
        last_el.classList.remove('show')
      }, { once: true })
    }
    return element
  }
  function add_node_sub ({ data, last, super_last, space }) {
    const element = document.createElement('div')
    element.classList.add(data.type, 'node')
    element.id = 'a'+data.id
    element.tabIndex = '0'

    if(!data.root)
      space += super_last ? '&emsp;&emsp;' : '│&emsp;&nbsp;'
    element.dataset.space = space
    element.dataset.super_last = last ? 'a' : ''

    element.innerHTML = `
      <div class="super nodes">
      </div>
      <div class="inputs nodes">
      </div>
      <div class="task_name">
        ${space}${last ? '└' : '├'}<span class="sup">📪</span><span class="tas">─📪</span><span class="inp">🗃</span><span class="out">─🗃</span>${data.name}<span class="last">...</span>
      </div>
      <div class="outputs nodes">
      </div>
      <div class="tasks nodes">
      </div>
    `
    const task_name = element.querySelector('.task_name')
    const sup = element.querySelector('.task_name > .sup')
    const sub = element.querySelector('.task_name > .tas')
    const inp = element.querySelector('.task_name > .inp')
    const out = element.querySelector('.task_name > .out')
    const last_el = element.querySelector('.task_name > .last')
    // const after = element.querySelector('.task_name > .after')
    const sup_tasks = element.querySelector('.super')
    const outputs = element.querySelector('.outputs')
    const inputs = element.querySelector('.inputs')
    const tasks = element.querySelector('.tasks')
    
    let sup_open, sub_open, inp_open, out_open
    sup.onclick = () => {
      if(sup_open){
        sup.innerHTML = '📪'
        sub_open ? sub.innerHTML = '┬'+sub.innerHTML.slice(1) : sub.innerHTML = '─'+sub.innerHTML.slice(1)
      } else{
        sup.innerHTML = '📭'
        sub_open ? sub.innerHTML = '┼'+sub.innerHTML.slice(1) : sub.innerHTML = '┴'+sub.innerHTML.slice(1)
      }
      sup_open = !sup_open
      sup_tasks.classList.toggle('show')
      if(data.sup && sup_tasks.children.length < 1){
        length = data.sup.length - 1
        data.sup.forEach((value, i) => sup_tasks.append(add_node_sup({ data: json_data[value], first: 0 === i, space })))
      }
    }
    sub.onclick = () => {
      if(sub_open){
        sup_open ? sub.innerHTML = '┴📪' : sub.innerHTML = '─📪'
      } else{
        sup_open ? sub.innerHTML = '┼📭' : sub.innerHTML = '┬📭'
      }
      sub_open = !sub_open
      tasks.classList.toggle('show')
      if(data.tasks && tasks.children.length < 1){
        length = data.tasks.length - 1
        data.tasks.forEach((value, i) => data.type === 'io' ? add_node_link(json_data[value]) : tasks.append(add_node_sub({ data: json_data[value], last: length === i, super_last: last, space })))
      }
    }
    inp.onclick = () => {
      if(inp_open){
        inp.innerHTML = '🗃'
        out_open ? out.innerHTML = '┬'+out.innerHTML.slice(1) : out.innerHTML = '─'+out.innerHTML.slice(1)
      } else{
        inp.innerHTML = '🗂'
        out_open ? out.innerHTML = '┼'+out.innerHTML.slice(1) : out.innerHTML = '┴'+out.innerHTML.slice(1)
      }
      inp_open = !inp_open
      inputs.classList.toggle('show')
      if(data.inputs && inputs.children.length < 1){
        length = data.inputs.length - 1
        data.inputs.forEach((value, i) => inputs.append(add_node_input({ data: json_data[value], first: 0 === i, space })))
      }
    }
    out.onclick = () => {
      if(out_open){
        inp_open ? out.innerHTML = '┴🗃' : out.innerHTML = '─🗃'
      } else{
        inp_open ? out.innerHTML = '┼🗂' : out.innerHTML = '┬🗂'
      }
      out_open = !out_open
      outputs.classList.toggle('show')
      if(data.outputs && outputs.children.length < 1){
        length = data.outputs.length - 1
        data.outputs.forEach((value, i) => outputs.append(add_node_output({ data: json_data[value], last: length === i, space })))
      }
    }
    element.onfocus = () => {
      selected_task = element
      selected_task.classList.add('focus')
      selected_task.addEventListener('blur', e => {
        if(e.relatedTarget && e.relatedTarget.classList.contains('noblur'))
          return
        selected_task.classList.remove('focus')
        selected_task = undefined
      }, { once: true })
    }
    task_name.onclick = open_chat
    last_el.onclick = () => {
      last_el.classList.add('show')
      popup.style.top = last_el.offsetTop - 20 + 'px'
      popup.style.left = last_el.offsetLeft - 56 + 'px'
      popup.focus()
      popup.addEventListener('blur', () => {
        last_el.classList.remove('show')
      }, { once: true })
    }
    // after.onclick = () => {
    //   alert(host+'-'+data.id)
    //   try{
    //     navigator.clipboard.writeText(host+'-'+data.id) 
    //   }
    //   catch{

    //   }
    // }
    return element
  }
  function add_node_sup ({ data, first, space }) {
    const element = document.createElement('div')
    element.classList.add(data.type, 'node')
    element.tabIndex = '0'
    element.id = 'a'+data.id
    space += '│&emsp;&nbsp;'
    element.innerHTML = `
    <div class="task_name">
      ${space}${first ? '┌' : '├'}</span><span>📭─</span>${data.name}<span class="after">🔗</span>
    </div>
    `
    return element
  }
  function add_node_input ({ data, first, space }) {
    console.error(data)
    const element = document.createElement('div')
    element.classList.add(data.type, 'node')
    element.tabIndex = '0'
    element.id = 'a'+data.id
    const space_sup = space + '│&emsp;&nbsp;│&emsp;&emsp;&ensp;'
    space += '│&emsp;&emsp;&emsp;&emsp;&ensp;'
    element.innerHTML = `
    <div class="task_name">
      <span class="space">${space}</span><span class="space_sup">${space_sup}</span>${first ? '┌' : '├'}</span><span class="btn">📥─</span>${data.name}<span class="after">🔗</span>
    </div>
    <div class="tasks nodes">
    </div>
    `
    const btn = element.querySelector('.task_name > .btn')
    const tasks = element.querySelector('.tasks')
    btn.onclick = () => {
      tasks.classList.toggle('show')
      if(data.tasks && tasks.children.length < 1){
        length = data.tasks.length - 1
        data.tasks.forEach((value, i) => tasks.append(add_node_link({ data: json_data[value], last: length === i, space })))
      }
    }
    return element
  }
  function add_node_output ({ data, last, space }) {
    const element = document.createElement('div')
    element.classList.add(data.type, 'node')
    element.tabIndex = '0'
    element.id = 'a'+data.id
    const space_sup = space + '│&emsp;&nbsp;│&emsp;&emsp;&ensp;'
    space += '│&emsp;&emsp;&emsp;&emsp;&ensp;'
    element.innerHTML = `
    <div class="task_name">
      <span class="space">${space}</span><span class="space_sup">${space_sup}</span>${last ? '└' : '├'}</span><span>📥─</span>${data.name}<span class="after">🔗</span>
    </div>
    `
    return element
  }
  function add_node_link ({ data, last, space }) {
    const element = document.createElement('div')
    element.classList.add('next', 'node')
    element.dataset.id = data.id
    space += '│&emsp;&nbsp;'
    console.error(data)
    element.innerHTML = `
      <div class="task_name">
        ${space}${last ? '└' : '├'}${data.name}
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
      !chat_task && json_data[parent_id].chat.push({username: 'system', content: host+' added '+type.slice(0,-1)+': '+name})
      const sub_nodes = json_data[parent_id][type]
      sub_nodes ? sub_nodes.push(node_id) : json_data[parent_id][type] = [node_id]
    }
    else{
      json_data[node_id].root = true
      json_data[node_id].users = [opts.host]
      console.error(json_data[node_id])
    }
    const channel = state.net[state.aka.taskdb]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'set',
      data: json_data
    })
  }
  async function on_add_node (data) {
    const node = data.id ? shadow.querySelector('#a' + data.id + ' > .'+data.type) : tree_el
    node.children.length && add_node_el({ data: { name: data.name, id: json_data.length, type: code_words[data.type] }, parent: node, super_last: data.super_last, type: data.type, space: data.space })
    add_node_data(data.name, data.type, data.id, data.users.push(host))
  }
  async function handle_export () {
    const data = await traverse( selected_task.id.slice(1) )
    const json_string = JSON.stringify(data, null, 2);
    const blob = new Blob([json_string], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.json';
    link.click();
  }
  async function handle_add ({ data }) {
    data = data.slice(2).trim().toLowerCase() + 's'
    const input = document.createElement('input')
    let node, task_id, space = '', super_last = true, root = true
    if(selected_task){
      node = selected_task.querySelector('.' + data)
      task_id = selected_task.id.slice(1)
      const before = selected_task.querySelector('.' + data.slice(0,3))
      before.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable: true, view: window}))
      node.classList.add('show')
      super_last = selected_task.dataset.super_last
      space = selected_task.dataset.space
      console.error(space, super_last)
      selected_task.classList.remove('focus')
      selected_task = undefined
      root = false
    }
    else{
      node = tree_el
      task_id = ''
    }
    node.prepend(input)
    input.onkeydown = async (event) => {
      if (event.key === 'Enter') {
        node.firstElementChild.remove()
        add_node_el({ data : { name: input.value, id: json_data.length, type: code_words[data], root }, space, super_last, type: data, parent: node })
        const users = task_id ? json_data[task_id].users : [host]
        add_node_data(input.value, data, task_id, users)
        if(task_id && json_data[task_id].users.length > 1)
          channel_up.send({
            head: [id, channel_up.send.id, channel_up.mid++],
            type: 'send',
            data: {to: 'task_explorer', route: ['up', 'task_explorer'], users: json_data[task_id].users.filter(user => user !== host), type: 'on_add_node', data: {name: input.value, id: task_id, type: data, users, super_last, space} }
          })
        if(chat_task && task_id === chat_task.id.slice(1))
          channel_up.send({
            head: [id, channel_up.send.id, channel_up.mid++],
            type: 'post_msg',
            data: {username: 'system', content: host+' added '+data.slice(0, -1)+': '+input.value}
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
      data: node
    })
    
    if(chat_task)
      chat_task.classList.remove('chat_active')
    chat_task = selected_task
    chat_task.classList.add('chat_active')
  }
  async function post_msg ({ data }) {
    const node = json_data[Number(data.chat_id)]
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
    tree_el.prepend(add_node_sub({ name, id, type }))
    json_data.push(data)
  }
}

function get_theme () {
  return `
  .box{
    position: relative;
  }
  main{
    max-height: 300px;
    overflow: scroll;
    max-width: 5px;
    min-width: 100%;
  }
  main > .task{
    position: relative;
    min-width: fit-content;
  }
  .task{
    cursor: pointer;
    margin: 5px 0;
  }
  .node > .nodes{
    display: none;
    margin: 5px 0;
  }
  .nodes.show{
    display: block;
  }
  .node.focus > .task_name{
    background-color: #222;
  }
  .io > .task_name > .space_sup{
    display: none;
  }
  .super.show + .inputs > .io > .task_name > .space_sup,
  .outputs:has(+ .tasks.show) > .io > .task_name > .space_sup{
    display: inline;
  }
  .super.show + .inputs > .io > .task_name > .space,
  .outputs:has(+ .tasks.show) > .io > .task_name > .space{
    display: none;
  }
  .task_name{
    white-space: nowrap;
    width: 100%;
  }
  .task_name > .last{
    display: none;
    position: absolute;
    right: 3px;
    padding: 0 2px;
    background-color: black;
    color: white;
    box-shadow: 0 0 20px 1px rgba(255, 255, 255, 0.5);
  }
  .task_name:hover > .last,
  .task_name > .last.show{
    display: inline;
  }
  .task.chat_active > .task_name{
    color: green;
  }
  .popup{
    height: 0;
    position: absolute;
    background-color: #222;
    z-index: 1;
    overflow: hidden;
    cursor: pointer;
  }
  .popup:focus{
    height: auto;
    box-shadow: 0 0 2px 1px rgb(255, 255, 255);
  }
  .popup > div{
    padding: 5px 10px;
  }
  .popup > div:hover{
    background-color: #555;
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
},{"./data.json":4,"_process":2,"taskdb":6}],6:[function(require,module,exports){
(function (process,__filename){(function (){
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
//  ----------------------------------------
module.exports = taskdb
//  ----------------------------------------
function taskdb (opts, protocol) {
    // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const on = { ls, add, get, set }
  const channel_up = use_protocol('up')({ protocol, state, on })
  const dbname = 'db_'+opts.host
  function ls (taskpath = '/') {}
  function add (taskpath, name) {}
  function get ({ data }) {
    const db = localStorage.getItem(dbname)
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'set',
      data: JSON.parse(db)
    })
  }
  function set ({ data }) {
    localStorage.setItem(dbname, JSON.stringify(data))
  }
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
}).call(this)}).call(this,require('_process'),"/src/node_modules/taskdb/index.js")
},{"_process":2}]},{},[1]);
