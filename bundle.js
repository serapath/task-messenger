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
            <div class="popup">
              <div class="noblur"> Input </div>
              <div class="noblur"> Output </div>
              <div class="noblur"> Task </div>
            </div>
            <button class="add noblur">
              add
            </button>
          </div>
          <button class="drop noblur">
            drop
          </button>
          <button class="edit noblur">
            edit
          </button>
          <button class="join noblur">
            join
          </button>
          <div class="btn_wrapper">
            <div class="popup">
              <div class="noblur"> Input </div>
              <div class="noblur"> Output </div>
            </div>
            <button class="invite noblur">
              invite
            </button>
          </div>
        </div>
        <textarea class="noblur" placeholder="join to a channel" disabled></textarea>
      </div>
    </div>
  `
  // ----------------------------------------
  const container = shadow.querySelector('.container')
  const btn_add = shadow.querySelector('.add')
  const btn_drop = shadow.querySelector('.drop')
  const btn_edit = shadow.querySelector('.edit')
  const btn_join = shadow.querySelector('.join')
  const btn_invite = shadow.querySelector('.invite')
  const textarea = shadow.querySelector('textarea')
  const history = shadow.querySelector('.history')
  const popup = shadow.querySelector('.popup')
  // ----------------------------------------
  btn_add.onclick = () => popup.classList.add('show')
  btn_join.onclick = handle_join
  btn_invite.onclick = handle_invite
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
      set_chat
    }
    const protocol = use_protocol('task_explorer')({ state, on })
    const element = await task_explorer(opts = { users, host: username }, protocol)
    container.prepend(element)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  return el

  async function handle_keydown (e) {
    if(shift_status)
      switch (e.key){
        case 'Enter':
          e.preventDefault()
          if(textmode === "msg")
            post_msg()
          else
            invite()
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
  async function handle_join () {
    const channel = state.net[state.aka.task_explorer]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'get_chat',
    })
    textarea.disabled = false
    textarea.placeholder = "Type a message"
  }
  async function handle_keyup (e) {
    e.target.style.height = "1px";
    e.target.style.height = (15+e.target.scrollHeight)+"px";
    if(e.key === 'Shift')
      shift_status = true
    
  }
  async function handle_invite () {
    textarea.disabled = false
    textarea.placeholder = "Enter a user id"
    textmode = 'invite'
  }
  async function invite () {
    const channel = state.net[state.aka.task_explorer]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'handle_invite',
      data: textarea.value
    })
  }
  async function post_msg () {
    const element = document.createElement('div')
    element.classList.add('msg', 'right')
    const content = textarea.value.replaceAll('\n', '<br>')
    textarea.value = ''
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
  async function set_chat ({ data }){
    chat = {data: data.chat_data, id: data.chat_id}
    history.innerHTML = ''
    chat.data.forEach(msg => {
      const element = document.createElement('div')
      element.classList.add('msg')
      msg.username === username && element.classList.add('right')
      element.innerHTML = `
        <div class='username'>
          ${msg.username}
        </div>
        ${msg.content}`
      history.append(element)
    })

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
      justify-content: space-around;
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
      height: 50px;
      min-height: 40px;
      padding: 10px;
    }
    textarea::-webkit-scrollbar{
      display: none;
    }
    .btn_wrapper{
      position: relative;
    }
    .btn_wrapper .popup{
      display: none;
      position: absolute;
      bottom: 100%;
      background: black;
      border: 1px solid gray;
      cursor: pointer;
      padding: 5px;
    }
    .btn_wrapper .popup.show{
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
},{"_process":2,"task_explorer":4}],4:[function(require,module,exports){
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
async function task_explorer (opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const { users } = opts
  const json_data = [
    {id: 0, name: 'roadmap', type: 'task', root: true, children: [1, 2], chat: [{username: 'ana', content: 'Hello'}, {username: 'bob', content: 'Hello'}] },
    {id: 1, name: 'UI/UX design', type: 'task', children: [3, 4] },
    {id: 2, name: 'implementation', type: 'task', children: [5, 6] },
    {id: 3, name: 'design button', type: 'task', outputs: [7], children: [8, 10]},
    {id: 4, name: 'design searchbar', type: 'task'},
    {id: 5, name: 'implement button', type: 'task', inputs: [7, 9, 11], outputs: [12, 13, 14], children: [15]},
    {id: 6, name: 'implement searchbar', type: 'task'},
    {id: 7, name: 'button repo', type: 'io', children: [5, 6]},
    {id: 8, name: 'make button icon', type: 'task', outputs: [9]},
    {id: 9, name: 'button icon.svg', type: 'io', children: [5, 6]},
    {id: 10, name: 'wireframe button', type: 'task', outputs: [11]},
    {id: 11, name: 'button.fig', type: 'io', children: [5, 6]},
    {id: 12, name: 'button.js', type: 'io'},
    {id: 13, name: 'button.css', type: 'io'},
    {id: 14, name: 'button.html', type: 'io'},
    {id: 15, name: 'write button js, css, and html', type: 'task'},
  ]
  const name = 'task_explorer'
  let selected_task
  let chat_task
  let code_words = {inputs: 'io', outputs: 'io', children: 'task'}
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 
    'on_add_task': on_add_task,
    'handle_add': handle_add,
    'send': send,
    'get_chat': get_chat,
    'post_msg': post_msg,
    'handle_invite': handle_invite,
    'on_invite': on_invite
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
  const task_tree = shadow.querySelector('main')
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  fill_task_tree()
  return el

  async function fill_task_tree () {
    task_tree.innerHTML = ''
    task_tree.append(...json_data.filter(data => data.root).map(add_task))
  }
  function add_task (data) {
    const element = document.createElement('div')
    element.classList.add(data.type, 'node')
    element.tabIndex = '0'
    element.id = 'a'+data.id
    element.innerHTML = `
      <div class="inputs nodes">
      </div>
      <div class="task_name">
        ${data.name}
      </div>
      <div class="outputs nodes">
      </div>
      <div class="children nodes">
      </div>
    `
    const task_name = element.querySelector('.task_name')
    const outputs = element.querySelector('.outputs')
    const inputs = element.querySelector('.inputs')
    const children = element.querySelector('.children')
    task_name.onclick = () => {
      element.classList.toggle('show')
      selected_task = element
      selected_task.focus()
      selected_task.addEventListener('blur', e => {
        if(e.relatedTarget && e.relatedTarget.classList.contains('noblur'))
          return
        selected_task = undefined
      })
      if(data.outputs && outputs.children.length < 1){
        for(const i of data.outputs){
          outputs.append(add_task(json_data[i]))
        }
        outputs.classList.add('padding')
      }
      if(data.children && children.children.length < 1){
        for(const i of data.children){
          children.append(add_task(json_data[i]))
        }
        children.classList.add('padding')
        outputs.classList.add('border')
      }
      if(data.inputs && inputs.children.length < 1){
        for(const i of data.inputs){
          inputs.append(add_task(json_data[i]))
        }
        inputs.classList.add('padding')
      }
    }
    
    
    return element
  }
  async function add_node (name, type, parent_id){
    const node_id = json_data.length
    json_data.push({ id: node_id, name, type: code_words[type] })
    if(parent_id){
      const children = json_data[parent_id.slice(1)][type]
      if(children !== undefined)
        children.push(json_data.length)
      else
        json_data[parent_id.slice(1)][type] = [node_id]
    }
    else{
      json_data[node_id].root = true
      json_data[node_id].users = [opts.host]
    }
  }
  async function on_add_task (data) {
    let tree_container
    if(data.id){
      const task = shadow.querySelector('#' + data.id)
      if(task)
        tree_container = task.querySelector('.'+data.type)
    }
    else
      tree_container = task_tree
    if(tree_container)
      tree_container.prepend(add_task({ name: data.name, id: json_data.length, type: code_words[data.type] }))
    add_node(data.name, data.type, data.id)
  }
  async function handle_add ({ data }) {
    data = data.trim().toLowerCase() + 's'
    if(data === 'tasks')
      data = 'children'
    const input = document.createElement('input')
    let tree_container, task_id
    if(selected_task){
      tree_container = selected_task.querySelector('.' + data)
      task_id = selected_task.id
    }
    else{
      tree_container = task_tree
      task_id = ''
    }

    tree_container.prepend(input)
    input.onkeydown = async (event) => {
      if (event.key === 'Enter') {
        tree_container.firstElementChild.remove()
        tree_container.prepend(add_task({ name: input.value, id: json_data.length, type: code_words[data] }))
        add_node(input.value, data, task_id)
        if(task_id)
          channel_up.send({
            head: [id, channel_up.send.id, channel_up.mid++],
            type: 'send',
            data: {to: 'task_explorer', route: ['up', 'task_explorer'], users, type: 'on_add_task', data: {name: input.value, id: task_id, type: data} }
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
  async function get_chat () {
    const node = json_data[Number(selected_task.id.slice(1))]
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'set_chat',
      data: {chat_data: node.chat, chat_id: node.id}
    })
    
    if(chat_task)
      chat_task.classList.remove('chat_focus')
    chat_task = selected_task
    chat_task.classList.add('chat_focus')
  }
  async function post_msg ({ data }) {
    const node = json_data[Number(data.chat_id)]
    node.chat.push({ username: data.username, content: data.content })
  }
  async function handle_invite ({ data }) {
    const node = json_data[Number(selected_task.id.slice(1))]
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'send',
      data: {to: 'task_explorer', route: ['up', 'task_explorer'], users: [data], type: 'on_invite', data: node }
    })
  }
  async function on_invite (data) {
    const {name, id, type} = data
    task_tree.prepend(add_task({ name, id, type }))
    json_data.push(data)
  }
}

function get_theme () {
  return `
  .task{
    cursor: pointer;
    margin: 5px 0;
    margin-left: 10px;
  }
  .task > .task_name::before{
    content: '\\251C \\2795 \\2500';
  }
  .task:last-child > .task_name::before{
    content: '\\2514 \\2795 \\2500';
  }
  .task.show > .task_name::before{
    content: '\\251C \\2796 \\2500';
  }
  .task.show:last-child > .task_name::before{
    content: '\\2514 \\2796 \\2500';
  }
  
  .node > .nodes{
    display: none;
    margin: 5px 0;
    padding-left: 5px;
    margin-left: 0;
    border-left: 1px solid white;
    position: relative;
  }
  .task:last-child > .children,
  .task:last-child > .outputs{
    border-color: transparent;
  }

  .task .task_name{
    margin-left: -5px;
  }
   .input.padding:first-child,
   .children.padding:first-child{
    padding-top: 5px;
  }
   .output.padding:last-child,
   .children.padding:last-child{
    padding-bottom: 5px
  }
   .inputs > .io > .task_name::before{
    content: '\\251C \\1F4E5 \\2500';
  }
   .inputs > .io:first-child > .task_name::before{
    content: '\\250C \\1F4E5 \\2500';
  }
   .outputs > .io > .task_name::before{
    content: '\\251C \\1F4E4 \\2500';
  }
   .outputs > .io:last-child > .task_name::before{
    content: '\\2514 \\1F4E4 \\2500';
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
  .task.chat_focus > .task_name::after{
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
},{"_process":2}]},{},[1]);
