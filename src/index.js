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
    for(entry of Object.entries(state.chat.data)){
      entry[1].forEach(value => {
        const refs = value.refs.split('-')
        chatroom.push({
          id: value.head.id,
          username: entry[0] ? entry[0] : state.username,
          content: value.data,
          date: value.meta.date,
          refs: refs.length > 1 && state.chat.data[refs[0]][refs[1]]
        })
      })
    }
    chatroom.sort((a, b) => a.date - b.date)
    chatroom.forEach(msg => render_msg({ data: msg }))
    const channel = state.net[state.aka.chat_input]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'activate_input',
      data: 'Type a message'
    })
    update_status(data)
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
    element.id = data.id
    
    if(data.username === 'system'){
      element.classList.add('system')
      element.innerHTML = data.content
    }
    else{
      data.username === state.username && element.classList.add('right')
      element.innerHTML = `
        <div class='username'>
          ${data.username}
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
          const target = history.querySelector('#'+data.refs.head.id)
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
