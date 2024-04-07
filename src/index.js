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
  const json_data = [
    {id: '0', name: 'roadmapping', chat: [
      {username: 'ana', content: 'How are you'},
      {username: 'bob', content: 'I am doing good'},
    ], children: [
      {id: '0-0', name: 'create task-messenger', chat: [], inputs: [{name: 'discord-msg'}], outputs: [{name: 'task-messenger.js'}]},
      {id: '0-1', name: 'childtask2', chat: [], inputs: [{name: 'Input1'},{name: 'Input2'},]},
      {id: '0-2', name: 'childtask3', chat: [], inputs: [{name: 'Input1'},{name: 'Input2'},]}
    ]},
    {id: '1', name: 'task2', chat: [
      {username: 'ana', content: 'How dare you'},
      {username: 'bob', content: 'I am doing good'},
    ], children: [
      {id: '1-0', name: 'childtask1', chat: []},
      {id: '1-1', name: 'childtask2', chat: []},
      {id: '1-2', name: 'childtask3', chat: []}
    ]},
    {id: '2', name: 'task3', chat: [
      {username: 'ana', content: 'How dare you'},
      {username: 'bob', content: 'Fine thank you'},
    ], children: [
      {id: '2-0', name: 'childtask1', chat: []},
      {id: '2-1', name: 'childtask2', chat: []},
      {id: '2-2', name: 'childtask3', chat: []}
    ]}
  ]
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
          <button class="connect noblur">
            connect
          </button>
          <div class="btn_wrapper">
            <div class="popup">
              <div class="noblur"> Input </div>
              <div class="noblur"> Output </div>
            </div>
            <button class="join noblur">
              join
            </button>
          </div>
        </div>
        <textarea placeholder="Join or connect to a channel" disabled></textarea>
      </div>
    </div>
  `
  // ----------------------------------------
  const container = shadow.querySelector('.container')
  const btn_add = shadow.querySelector('.add')
  const btn_drop = shadow.querySelector('.drop')
  const btn_edit = shadow.querySelector('.edit')
  const btn_connect = shadow.querySelector('.connect')
  const btn_join = shadow.querySelector('.join')
  const textarea = shadow.querySelector('textarea')
  const history = shadow.querySelector('.history')
  const popup = shadow.querySelector('.popup')
  // ----------------------------------------
  btn_add.onclick = () => popup.classList.add('show')
  btn_connect.onclick = handle_connect
  btn_join.onclick = handle_join
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
    const element = await task_explorer(opts = { json_data, users }, protocol)
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
  async function handle_connect () {
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
  async function handle_join () {
    textarea.disabled = false
    textarea.placeholder = "Enter a channel id"
  }
  async function join () {

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
