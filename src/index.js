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
