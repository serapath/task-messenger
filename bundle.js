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
const chat_input = require('chat_input')
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
  state.users = opts.users.filter(username => username!==opts.username)
  state.username = opts.username
  state.pk = opts.username[0]+'123'
  state.id_map = {'a123':'ana', 'b123':'bob'}
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {
    'on_rx': on_rx,
    'send': send,
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
        <div class="explorer_box">
        </div>
        <div class="input_box noblur">
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
  const explorer_box = shadow.querySelector('.explorer_box').attachShadow(shopts)
  const input_box = shadow.querySelector('.input_box').attachShadow(shopts)
  const history = shadow.querySelector('.history')
  const footer = shadow.querySelector('.footer')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  {//task explorer
    const on = {
      send,
      open_chat,
      on_tx,
      render_msg
    }
    const protocol = use_protocol('task_explorer')({ state, on })
    const opts = { users: state.users, host: state.username }
    const element = task_explorer(opts, protocol)
    explorer_box.append(element)
  }
  {//chat input
    const on = {
      send,
      on_tx,
    }
    const protocol = use_protocol('chat_input')({ state, on })
    const opts = { users: state.users, host: state.username }
    const element = await chat_input(opts, protocol)
    input_box.append(element)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  return el
  async function on_tx ({ data }) {
    render_msg({ data })
    
    const channel = state.net[state.aka.task_explorer]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'save_msg',
      data: {content: data.content, username: state.username, chat_id: state.chat.id}
    })
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'send',
      data: {from: state.username, users: state.users, to: 'task_messenger', type: 'on_rx', data_re: {content: data.content, chat_id: state.chat.id}}
    })
  }
  async function on_rx (data) {
    const { from, data_re } = data
    const { content, chat_id } = data_re
    const channel = state.net[state.aka.task_explorer]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'save_msg',
      data: {content, username: from, chat_id}
    })
    if(state.chat && chat_id === state.chat.id)
      render_msg({ data: { username: from, content }})
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
    state.chat = {data: data.room, id: data.id}
    history.innerHTML = ''
    chatroom = []
    const temp_room = []
    const temp = JSON.parse(JSON.stringify(state.chat.data))
    const cache = [1]
    let min = 1
    let count = 0
    while(min !== Infinity && count < 10 ){
      let min_key
      min = Infinity
      for(entry of Object.entries(temp)){
        if(entry[1].length && entry[1][0].meta.date < min){
          min = entry[1][0].meta.date
          min_key = entry[0]
        }
      }
      min_key !== undefined && temp_room.push(min_key+'-'+temp[min_key].pop().head.mid)
      count++
    }
    temp_room.forEach(append_msg)
    const channel = state.net[state.aka.chat_input]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'activate_input',
      data: 'Type a message'
    })
    update_status(data)
  }
  async function append_msg (id){
    const element = document.createElement('div')
    element.classList.add('msg')
    element.id = id
    const id_split = id.split('-')
    const data = state.chat.data[id_split[0]][id_split[1]]
    if(id_split[0] === 'system'){
      element.classList.add('system')
      element.innerHTML = data.data
    }
    else{
      id_split[0] === '' && element.classList.add('right')
      element.innerHTML = `
        <div class='username'>
          ${state.id_map[id_split[0] ? id_split[0] : state.pk]}
        </div>
        <div class='content'>
        ${data.data}
        </div>`
        
      if(data.refs.cause){
        const cause_split = data.refs.cause.split('-')
        const cause_data = state.chat.data[cause_split[0]][cause_split[1]]
        const refs = document.createElement('div')
        refs.classList.add('refs')
        refs.innerHTML = `
          ${cause_data.data}`
        element.prepend(refs)
        refs.onclick = () => {
          const target = history.querySelector('#'+data.refs.cause)
          target.tabIndex = '0'
          target.focus()
          target.onblur = () => target.removeAttribute('tabindex')
        }
      }
    }
    history.append(element)
    history.scrollTop = history.scrollHeight
  }
  async function update_status (data) {
    const title = footer.querySelector('.title')
    title.innerHTML = data.name
    const input = footer.querySelector('.input')
    input.innerHTML = `Inputs: ${data.inputs ? data.inputs.length : '0'}`
    const output = footer.querySelector('.output')
    output.innerHTML = `Outputs: ${data.outputs ? data.outputs.length : '0'}`
    const task = footer.querySelector('.task')
    task.innerHTML = `Tasks: ${data.sub ? data.sub.length : '0'}`
  }
  async function render_msg ({ data }){
    const element = document.createElement('div')
    element.classList.add('msg')
    element.id = data.username+data.id
    
    if(data.username === 'system'){
      element.classList.add('system')
      element.innerHTML = data.content
    }
    else{
      data.username === state.pk && element.classList.add('right')
      element.innerHTML = `
        <div class='username'>
          ${state.id_map[data.username]}
        </div>
        <div class='content'>
        ${data.content}
        </div>`
        
      if(data.refs){
        const refs = document.createElement('div')
        refs.classList.add('refs')
        refs.innerHTML = `
          ${data.refs.data}`
        element.prepend(refs)
        refs.onclick = () => {
          data.refsname = data.refsname ? data.refsname : state.pk
          const target = history.querySelector('#'+data.refsname+data.refs.head.mid)
          target.tabIndex = '0'
          target.focus()
          target.onblur = () => target.removeAttribute('tabindex')
        }
      }
    }
    history.append(element)
    history.scrollTop = history.scrollHeight
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
    .chat .msg > .content{
      background-color: #555;
      padding: 10px;
      border-radius: 6px;
      width: fit-content;
      z-index: 1;
      position: relative;
    }
    .chat .msg{
      position: relative;
      margin: 10px;
    }
    .chat .msg > .refs{
      background-color: #555;
      padding: 10px;
      margin-bottom: -10px;
      padding-bottom: 20px;
      opacity: 0.5;
      border-radius: 6px;
      width: fit-content;
      cursor: pointer;
    }
    .chat .msg.right > div{
      margin-left: auto;
    }
    .chat .msg:focus{
      background-color: #33330f;
    }
    .chat .msg.system{
      margin: 0 auto;
      background: none;
    }
    .chat .msg:first-child{
      margin-top: auto;
    }
    .chat .msg .username{
      position: absolute;
      top: -16px;
      font-size: 14px;
    }
    .chat .msg.right .username{
      right: 2px;
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
},{"_process":2,"chat_input":4,"task_explorer":5}],4:[function(require,module,exports){
(function (process,__filename){(function (){
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
module.exports = chat_input
//  ----------------------------------------
async function chat_input (opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  state.shift_status = true
  state.textmode = "msg"
  state.username = opts.host

  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {
    activate_input
  }
  const channel_up = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div');
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `
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
    </div>`
  // ----------------------------------------
  const btn_add = shadow.querySelector('.add')
  const btn_join = shadow.querySelector('.join')
  const btn_export = shadow.querySelector('.export')
  const btn_send = shadow.querySelector('.send')
  const textarea = shadow.querySelector('textarea')
  const popup = shadow.querySelector('.popup')
  const overlay = shadow.querySelector('.overlay')
  // ----------------------------------------
  btn_add.onclick = () => popup.focus()
  btn_join.onclick = handle_join
  btn_export.onclick = handle_export
  btn_send.onclick = handle_send
  textarea.onkeyup = handle_keyup
  textarea.onkeydown = handle_keydown
  for (const child of popup.children){
    child.onclick = handle_add
  }
  
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  return el

  /******************************************
   Event handlers
  ******************************************/
  async function handle_export () {
    const channel = state.net[state.aka.task_explorer]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'handle_export',
    })
  }
  async function handle_send () {
    if(textarea.disabled)
      return
    if(state.textmode === "msg")
      on_tx()
    else
      join()
  }
  async function handle_keydown (e) {
    if(state.shift_status)
      switch (e.key){
        case 'Enter':
          e.preventDefault()
          if(state.textmode === "msg")
            on_tx()
          else
            join()
          break
        case 'Shift':
          state.shift_status = false
      }
  }
  async function handle_add (e) {
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'send',
      data: {to: 'task_explorer', route: ['task_explorer'], type: 'handle_add', data: e.target.innerHTML}
    })
  }
  async function handle_keyup (e) {
    e.target.style.height = "1px";
    e.target.style.height = (2+e.target.scrollHeight)+"px";
    if(e.key === 'Shift')
      state.shift_status = true
    if(textarea.value === '/'){
      overlay.classList.add('show')
      textarea.addEventListener('blur', handle_blur)
      textarea.addEventListener('focus', handle_blur)
    }
    else{
      overlay.classList.remove('show')
      textarea.removeEventListener('blur', handle_blur)
      textarea.removeEventListener('focus', handle_blur)
    }
  }
  async function handle_blur () {
    overlay.classList.toggle('show')
  }
  async function handle_join () {
    textarea.disabled = false
    textarea.placeholder = "Enter a invite code"
    state.textmode = 'join'
  }
  /******************************************
   Communication
  ******************************************/
  async function on_tx () {
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'on_tx',
      data: {content: textarea.value.replaceAll('\n', '<br>'), username: state.username}
    })
    textarea.value = ''
  }
  async function join () {
    const [user, task_id] = textarea.value.split('-')
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'send',
      data: {to: 'task_explorer', route: ['task_explorer'], users: [user], type: 'handle_invite', data: {sender: opts.host, task_id}}
    })
  }
  async function activate_input ({ data }) {
    textarea.disabled = false
    data ? textarea.placeholder = data : ''
  }
}
function get_theme () {
  return `
  *{
    box-sizing: border-box;
  }
  .crud{
    display: flex;
    gap: 10px;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border: 1px solid gray;
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

}).call(this)}).call(this,require('_process'),"/src/node_modules/chat_input/chat_input.js")
},{"_process":2}],5:[function(require,module,exports){
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
  state.name = 'task_explorer'
  state.code_words = {inputs: 'io', outputs: 'io', tasks: 'task'}
  state.add_words = {tasks: 'sub'}
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 
    'on_add_node': on_add_node,
    'handle_add': handle_add,
    'send': send,
    'save_msg': save_msg,
    'handle_invite': handle_invite,
    'on_invite': on_invite,
    'handle_export': handle_export
  }
  const on_add = {
    'io': add_node_io,
    'link': add_node_link,
    'tasks': add_node_sub,
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
    const opts = { host }
    taskdb(opts, protocol)
    async function set ({ data }) {
      state.query_result = data
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
  if(state.query_result){
    json_data = state.query_result
    fill_tree_el()
  }
  else
    fetch("./data_"+host+".json")
    .then(res => res.json())
    .then(data => {
        json_data = data
        fill_tree_el()
        channel.send({
          head: [id, channel.send.id, channel.mid++],
          type: 'set',
          data: json_data
        })
      }
    )
  
  return el

  async function fill_tree_el () {
    const root_nodes = json_data.filter(data => data.root)
    const length = root_nodes.length - 1
    tree_el.append(...root_nodes.map((data, i) => add_node_root({ data, last: i === length })))
  }
  function create_node (type, id) {
    const element = document.createElement('div')
    element.classList.add(type, 'node')
    element.tabIndex = '0'
    element.id = 'a'+id
    return element
  }
  function html_template (data, last, space, grand_last){
    const element = create_node(data.type, data.id)
    if(data.root)
      space = ''
    else
      space += grand_last ? '&emsp;&emsp;' : '│&emsp;&nbsp;'
    element.dataset.space = space
    element.dataset.grand_last = last ? 'a' : ''

    return [element, last, space]
  }
  /******************************************
   Addition Operation
  ******************************************/
  function add_node_el ({ data, parent, space, grand_last, type }){
    const is_single = parent.children.length ? false : true
    if(data.root){
      parent.prepend(add_node_root({ data, last: false}))
      return
    }
    //hub or sub node check
    if(type === 'inputs')
      parent.append(on_add[type]({ data, space, grand_last, first: is_single}))
    else
      parent.prepend(on_add[type]({ data, space, grand_last, last: is_single}))

  }
  function add_node_root ({ data, last }) {
    [ element, last, space ] = html_template(data, last)
    element.innerHTML = `
      <div class="details">
        ${last ? '└' : '├'}<span class="tas">📓─</span>${data.name}<span class="last">...</span>
      </div>
      <div class="tasks nodes">
      </div>
    `
    const sub_emo = element.querySelector('.details > .tas')
    const last_el = element.querySelector('.details > .last')
    const tasks = element.querySelector('.tasks')
    
    let is_on
    sub_emo.onclick = sub_click
    element.onfocus = handle_focus
    last_el.onclick = handle_popup
    return element
    function sub_click () {
      sub_emo.innerHTML = is_on ? '📓─' : '📖┬'  
      is_on = handle_click({ el: tasks, type: 'tasks', data: data.sub, space, is_on, grand_last: last, pos: false })
    }
  }
  function add_node_sub ({ data, last, grand_last, space }) {
    [ element, last, space ] = html_template(data, last, space, grand_last)
    element.innerHTML = `
      <div class="hub nodes">
      </div>
      <div class="inputs nodes">
      </div>
      <div class="details">
        ${space}${last ? '└' : '├'}<span class="hub_emo">📪</span><span class="tas">─📪</span><span class="inp">🗃</span><span class="out">─🗃</span><span class="name">${data.name}</span><span class="last">...</span>
      </div>
      <div class="outputs nodes">
      </div>
      <div class="tasks nodes">
      </div>
    `
    const details = element.querySelector('.details > .name')
    const hub_emo = element.querySelector('.details > .hub_emo')
    const sub_emo = element.querySelector('.details > .tas')
    const inp = element.querySelector('.details > .inp')
    const out = element.querySelector('.details > .out')
    const last_el = element.querySelector('.details > .last')
    // const after = element.querySelector('.details > .after')
    const hub = element.querySelector('.hub')
    const outputs = element.querySelector('.outputs')
    const inputs = element.querySelector('.inputs')
    const tasks = element.querySelector('.tasks')
    
    let hub_on, sub_on, inp_on, out_on
    hub_emo.onclick = hub_click
    sub_emo.onclick = sub_click
    inp.onclick = inp_click
    out.onclick = out_click
    element.onfocus = handle_focus
    details.onclick = open_chat
    last_el.onclick = handle_popup
    // after.onclick = () => {
    //   alert(host+'-'+data.id)
    //   try{
    //     navigator.clipboard.writeText(host+'-'+data.id) 
    //   }
    //   catch{

    //   }
    // }
    return element
    function hub_click () {
      if(hub_on){
        hub_emo.innerHTML = '📪'
        sub_on ? sub_emo.innerHTML = '┬'+sub_emo.innerHTML.slice(1) : sub_emo.innerHTML = '─'+sub_emo.innerHTML.slice(1)
      } else{
        hub_emo.innerHTML = '📭'
        sub_on ? sub_emo.innerHTML = '┼'+sub_emo.innerHTML.slice(1) : sub_emo.innerHTML = '┴'+sub_emo.innerHTML.slice(1)
      }
      hub_on = handle_click({ el: hub, type: 'link', data: data.hub, space, is_on: hub_on, pos: true })
    }
    function sub_click () {
      if(sub_on){
        hub_on ? sub_emo.innerHTML = '┴📪' : sub_emo.innerHTML = '─📪'
      } else{
        hub_on ? sub_emo.innerHTML = '┼📭' : sub_emo.innerHTML = '┬📭'
      }
      sub_on = handle_click({ el: tasks, type: 'tasks', data: data.sub, space, is_on: sub_on, grand_last: last, pos: false })
    }
    function inp_click () {
      if(inp_on){
        inp.innerHTML = '🗃'
        out_on ? out.innerHTML = '┬'+out.innerHTML.slice(1) : out.innerHTML = '─'+out.innerHTML.slice(1)
      } else{
        inp.innerHTML = '🗂'
        out_on ? out.innerHTML = '┼'+out.innerHTML.slice(1) : out.innerHTML = '┴'+out.innerHTML.slice(1)
      }
      inp_on = handle_click({ el: inputs, type: 'io', data: data.inputs, space, is_on: inp_on, pos: true })
    }
    function out_click () {
      if(out_on){
        inp_on ? out.innerHTML = '┴🗃' : out.innerHTML = '─🗃'
      } else{
        inp_on ? out.innerHTML = '┼🗂' : out.innerHTML = '┬🗂'
      }
      out_on = handle_click({ el: outputs, type: 'io', data: data.outputs, space, is_on: out_open, pos: false })
    }
  }
  function add_node_io ({ data, first, last, space }) {
    const element = create_node(data.type, data.id)
    const grand_space = space + '│&emsp;&nbsp;│&emsp;&emsp;&ensp;'
    space += '│&emsp;&emsp;&emsp;&emsp;&ensp;'
    element.innerHTML = `
    <div class="details">
      <span class="space">${space}</span><span class="grand_space">${grand_space}</span>${first ? '┌' : last ? '└' : '├'}</span><span class="btn">📥─</span>${data.name}<span class="after">🔗</span>
    </div>
    <div class="tasks nodes">
    </div>
    `
    const btn = element.querySelector('.details > .btn')
    const tasks = element.querySelector('.tasks')
    btn.onclick = () => handle_click({ el: tasks, type: 'link', data: data.sub, space, pos: false })
    return element
  }
  function add_node_link ({ data, first, last, space }) {
    const element = document.createElement('div')
    element.classList.add('next', 'node')
    element.dataset.id = data.id
    space += '│&emsp;&nbsp;'
    element.innerHTML = `
      <div class="details">
        ${space}${last ? '└' : first ? '┌' : '├'} ${data.name}
      </div>`
    element.onclick = jump
    
    return element
  }
  async function add_node_data (name, type, parent_id, users, author){
    const node_id = json_data.length
    json_data.push({ id: node_id, name, type: state.code_words[type], room: {}, users })
    if(parent_id){
      save_msg({
          head: [id],
          type: 'save_msg',
          data: {username: 'system', content: author + ' added ' + type.slice(0,-1)+': '+name, chat_id: parent_id}
        })
      //Add a message in the chat
      if(state.chat_task && parent_id === state.chat_task.id.slice(1))
        channel_up.send({
          head: [id, channel_up.send.id, channel_up.mid++],
          type: 'render_msg',
          data: {username: 'system', content: author+' added '+type.slice(0,-1)+': '+name}
        })
      const sub_nodes = json_data[parent_id][state.add_words[type]]
      sub_nodes ? sub_nodes.push(node_id) : json_data[parent_id][state.add_words[type]] = [node_id]
    }
    else{
      json_data[node_id].root = true
      json_data[node_id].users = [opts.host]
    }
    save_msg({
      head: [id],
      type: 'save_msg',
      data: {username: 'system', content: author + ' created ' + type.slice(0,-1)+': '+name, chat_id: node_id}
    })
    const channel = state.net[state.aka.taskdb]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'set',
      data: json_data
    })
    
  }
  async function on_add_node (data) {
    const node = data.id ? shadow.querySelector('#a' + data.id + ' > .'+data.type) : tree_el
    node && node.children.length && add_node_el({ data: { name: data.name, id: json_data.length, type: state.code_words[data.type] }, parent: node, grand_last: data.grand_last, type: data.type, space: data.space })
    add_node_data(data.name, data.type, data.id, data.users, data.user)
  }
  /******************************************
   Event handlers
  ******************************************/
  function handle_focus (e) {
    state.xtask = e.target
    state.xtask.classList.add('focus')
    state.xtask.addEventListener('blur', e => {
      if(e.relatedTarget && e.relatedTarget.classList.contains('noblur'))
        return
      state.xtask.classList.remove('focus')
      state.xtask = undefined
    }, { once: true })
  }
  function handle_popup (e) {
    const el = e.target
    el.classList.add('show')
    popup.style.top = el.offsetTop - 20 + 'px'
    popup.style.left = el.offsetLeft - 56 + 'px'
    popup.focus()
    popup.addEventListener('blur', () => {
      el.classList.remove('show')
    }, { once: true })
  }
  function handle_click ({ el, type, data, space, is_on, grand_last, pos }) {
    el.classList.toggle('show')
    if(data && el.children.length < 1){
      length = data.length - 1
      data.forEach((value, i) => el.append(on_add[type]({ data: json_data[value], first: pos ? 0 === i : false, last: pos ? false : length === i, space, grand_last })))
    }
    return !is_on
  }
  async function handle_export () {
    const data = await traverse( state.xtask.id.slice(1) )
    const json_string = JSON.stringify(data, null, 2);
    const blob = new Blob([json_string], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.json';
    link.click();
  }
  async function handle_add (data) {
    data = data.slice(2).trim().toLowerCase() + 's'
    const input = document.createElement('input')
    let node, task_id, space = '', grand_last = true, root = true
    //expand other siblings
    if(state.xtask){
      node = state.xtask.querySelector('.' + data)
      task_id = state.xtask.id.slice(1)
      const before = state.xtask.querySelector('.' + data.slice(0,3))
      before.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable: true, view: window}))
      node.classList.add('show')
      grand_last = state.xtask.dataset.grand_last
      space = state.xtask.dataset.space
      state.xtask.classList.remove('focus')
      state.xtask = undefined
      root = false
    }
    else{
      node = tree_el
      task_id = ''
    }
    node.prepend(input)
    input.onkeydown = async (event) => {
      if (event.key === 'Enter') {
        input.blur()
        add_node_el({ data : { name: input.value, id: json_data.length, type: state.code_words[data], root }, space, grand_last, type: data, parent: node })
        const users = task_id ? json_data[task_id].users : [host]
        add_node_data(input.value, data, task_id, users, host)
        //sync with other users
        if(users.length > 1)
          channel_up.send({
            head: [id, channel_up.send.id, channel_up.mid++],
            type: 'send',
            data: {to: 'task_explorer', route: ['up', 'task_explorer'], users: json_data[task_id].users.filter(user => user !== host), type: 'on_add_node', data: {name: input.value, id: task_id, type: data, users, grand_last, space, user: host} }
          })
      }
    }
    input.focus()
    input.onblur = () => input.remove()
  }
  /******************************************
   Tree traversal
  ******************************************/
  async function jump (e){
    let target_id = e.currentTarget.dataset.id
    const el = tree_el.querySelector('#a'+target_id)
    if(el)
      el.focus()
    else{
      const path = []
      for(let temp = json_data[target_id]; !temp.root; temp = json_data[temp.parent])
        path.push(temp.id)
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
    state.result = []
    state.track = []
    recurse(id)
    return state.result
  }
  function recurse (id){
    if(state.track.includes(id))
      return
    state.result.push(json_data[id])
    state.track.push(id)
    for(temp = 0; json_data[id].tasks && temp < json_data[id].tasks.length; temp++)
      recurse(json_data[id].tasks[temp])
    for(temp = 0; json_data[id].inputs && temp < json_data[id].inputs.length; temp++)
      recurse(json_data[id].inputs[temp])
    for(temp = 0; json_data[id].outputs && temp < json_data[id].outputs.length; temp++)
      recurse(json_data[id].outputs[temp])
  }
  /******************************************
   Communication
  ******************************************/
  async function open_chat () {
    const node = json_data[Number(state.xtask.id.slice(1))]
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'open_chat',
      data: node
    })
    
    if(state.chat_task)
      state.chat_task.classList.remove('chat_active')
    state.chat_task = state.xtask
    state.chat_task.classList.add('chat_active')
  }
  async function save_msg (msg) {
    const {data} = msg
    msg.data = data.content,
    msg.meta = {
        date: new Date().getTime()
      }
    msg.refs = ''
    const node = json_data[Number(data.chat_id)]
    const username = data.username === host ? '' : data.username
    node.room[username] ? node.room[username].push(msg) : node.room[username] = [msg]
    const channel = state.net[state.aka.taskdb]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'set',
      data: json_data
    })
  }
  async function handle_invite ({ sender, task_id }) {
    const node = json_data[Number(task_id)]
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
  async function send ({ data }) {
    const {to, route} = data
    if(to === state.name){
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
  .node.focus > .details{
    background-color: #222;
  }
  .io > .details > .grand_space{
    display: none;
  }
  .hub.show + .inputs > .io > .details > .grand_space,
  .outputs:has(+ .tasks.show) > .io > .details > .grand_space{
    display: inline;
  }
  .hub.show + .inputs > .io > .details > .space,
  .outputs:has(+ .tasks.show) > .io > .details > .space{
    display: none;
  }
  .details{
    white-space: nowrap;
    width: 100%;
  }
  .details > .last{
    display: none;
    position: absolute;
    right: 3px;
    padding: 0 2px;
    background-color: black;
    color: white;
    box-shadow: 0 0 20px 1px rgba(255, 255, 255, 0.5);
  }
  .details:hover > .last,
  .details > .last.show{
    display: inline;
  }
  .task.chat_active > .details{
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
},{"_process":2,"taskdb":6}],6:[function(require,module,exports){
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
