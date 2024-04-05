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
    {id: '0', name: 'task1', chat: [
      {username: 'ana', content: 'How are you'},
      {username: 'bob', content: 'I am doing good'},
    ], children: [
      {id: '0-0', name: 'childtask1', chat: [], children: []},
      {id: '0-1', name: 'childtask2', chat: [], children: []},
      {id: '0-2', name: 'childtask3', chat: [], children: []}
    ]},
    {id: '1', name: 'task2', chat: [
      {username: 'ana', content: 'How dare you'},
      {username: 'bob', content: 'I am doing good'},
    ], children: [
      {id: '1-0', name: 'childtask1', chat: [], children: []},
      {id: '1-1', name: 'childtask2', chat: [], children: []},
      {id: '1-2', name: 'childtask3', chat: [], children: []}
    ]},
    {id: '2', name: 'task3', chat: [
      {username: 'ana', content: 'How dare you'},
      {username: 'bob', content: 'Fine thank you'},
    ], children: [
      {id: '2-0', name: 'childtask1', chat: [], children: []},
      {id: '2-1', name: 'childtask2', chat: [], children: []},
      {id: '2-2', name: 'childtask3', chat: [], children: []}
    ]}
  ]
  let selected_task
  let shift_status = true
  let users = opts.users.filter(username => username!==opts.username)
  let chat_id
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 
    'on_create_task': on_create_task,
    'on_post_msg': on_post_msg
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
        <div class="crud">
          <button class="btn create">
            Create
          </button>
          <button class="btn delete">
            Delete
          </button>
          <button class="btn rename">
            Rename
          </button>
          <button class="btn open">
            Open
          </button>
        </div>
        <div class="task_tree">
        </div>
        <div class="chat">
          <div class="history">
          </div>
        </div>
        <textarea></textarea>
      </div>
    </div>
  `
  // ----------------------------------------
  const btn_create = shadow.querySelector('.create')
  const btn_delete = shadow.querySelector('.delete')
  const btn_rename = shadow.querySelector('.rename')
  const btn_open = shadow.querySelector('.open')
  const task_tree = shadow.querySelector('.task_tree')
  const textarea = shadow.querySelector('textarea')
  const history = shadow.querySelector('.history')
  // ----------------------------------------
  btn_create.onclick = handle_create
  btn_open.onclick = handle_open
  textarea.onkeyup = handle_keyup
  textarea.onkeydown = handle_keydown
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  fill_task_tree()
  return el

  async function handle_keydown (e) {
    if(shift_status)
      switch (e.key){
        case 'Enter':
          e.preventDefault()
          post_msg()
          break
        case 'Shift':
          shift_status = false
      }
  }
  async function handle_create () {
    const input = document.createElement('input')
    let tree_container, task_id
    if(selected_task){
      tree_container = selected_task.firstElementChild.nextElementSibling
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
        tree_container.prepend(await new_task(input.value, task_id))
        channel_up.send({
          head: [id, channel_up.send.id, channel_up.mid++],
          refs: {to:users, type: 'on_create_task'},
          type: 'pass_through',
          data: {value: input.value, id: task_id}
        })
      }
    }
    input.focus()
  }
  async function on_create_task ({ data }) {
    let tree_container
    if(data.id)
      tree_container = shadow.querySelector('#' + data.id).firstElementChild.nextElementSibling
    else
      tree_container = task_tree
    tree_container.prepend(await new_task(data.value, data.id))

  }
  async function handle_open () {
    history.innerHTML = ''
    const {task} = await find_task(selected_task.id)
    task.chat.forEach(msg => {
      const element = document.createElement('div')
      element.classList.add('msg')
      msg.username === opts.username && element.classList.add('right')
      element.innerHTML = `
        <div class='username'>
          ${msg.username}
        </div>
        ${msg.content}`
      history.append(element)
    })
    chat_id = selected_task.id
  }
  async function find_task (id) {
    let tree = json_data
    let task, new_id
    id = id.slice(1)
    id && id.split('-').forEach(i => {
      task = tree[Number(i)]
      tree = task.children
    })
    if(id.length > 1){
      new_id = id + '-' + tree.length
    }
    else
      new_id = tree.length
    return {new_id, task, tree}
  }
  async function new_task (name, id) {
    const element = document.createElement('div')
    element.classList.add('task')
    element.tabIndex = '0'
    element.innerHTML = `
      <div class="task_name">
        ${name}
      </div>
      <div class="children">
      </div>
    `

    const {tree, new_id} = await find_task(id)
    tree.push({id: ''+new_id, name, chat: [], children: []})
    element.id = 'a'+new_id

    const task_name = element.querySelector('.task_name')
    task_name.onclick = () => {
      element.classList.toggle('show')
      selected_task = element
      selected_task.focus()
      selected_task.addEventListener('blur', e => {
        if(e.relatedTarget && e.relatedTarget.classList.contains('btn'))
          return
        selected_task = undefined
      })
    }
    
    return element
  }
  async function fill_task_tree () {
    task_tree.innerHTML = ''
    task_tree.append(...json_data.map(make_task))
  }
  function make_task (data) {
    const element = document.createElement('div')
    element.classList.add('task')
    element.tabIndex = '0'
    element.id = 'a'+data.id
    element.innerHTML = `
      <div class="task_name">
        ${data.name}
      </div>
      <div class="children">
      </div>
    `
    const task_name = element.querySelector('.task_name')
    task_name.onclick = () => {
      element.classList.toggle('show')
      selected_task = element
      selected_task.focus()
      selected_task.addEventListener('blur', e => {
        if(e.relatedTarget && e.relatedTarget.classList.contains('btn'))
          return
        selected_task = undefined
      })
    }
    
    const children = element.querySelector('.children')
    children.append(...data.children.map(make_task))
    return element
  }
  async function handle_keyup (e) {
    e.target.style.height = "1px";
    e.target.style.height = (9+e.target.scrollHeight)+"px";
    if(e.key === 'Shift')
      shift_status = true
    
  }
  async function post_msg () {
    const element = document.createElement('div')
    element.classList.add('msg', 'right')
    const content = textarea.value.replaceAll('\n', '<br>')
    textarea.value = ''
    element.innerHTML = `
        <div class='username'>
          ${opts.username}
        </div>
        ${content}`
    history.append(element)

    const {task} = await find_task(chat_id)
    task.chat.push(content)

    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      refs: {from: opts.username, to: users, type: 'on_post_msg'},
      type: 'pass_through',
      data: {value: content, id: chat_id}
    })

    history.scrollTop = history.scrollHeight
  }
  async function on_post_msg ({ data, refs }) {
    const {task} = await find_task(data.id)
    task.chat.push({username: refs.from, content:data.value})
    if(data.id === chat_id){
      const element = document.createElement('div')
      element.classList.add('msg')
      element.innerHTML = `
        <div class='username'>
          ${refs.from}
        </div>
        ${data.value}`
      history.append(element)
    }
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
      background-color: gray;
      border: 1px solid black;
    }
    .container{
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      border: 1px solid black;
    }
    .task_tree{
      width: 100%;
      padding-left: 5px;
      margin-left: 2px;
      border-left: 1px solid black;
    }
    .task{
      cursor: pointer;
      padding: 3px 0;
    }
    .task .task_name::before{
      content: '+';
    }
    .task.show > .task_name::before{
      content: '- ';
    }
    .task > .children{
      display: none;
      padding-left: 5px;
      margin-left: 2px;
      border-left: 1px solid black;
    }
    .task:focus{
      background-color: #aaa;
    }
    .task.show > .children{
      display: block;
    }
    .crud{
      display: flex;
      gap: 10px;
      justify-content: space-around;
      padding: 10px;
      border: 1px solid black;
    }
    .chat{
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      border-top: 1px solid black;
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
      height: 44px;
      padding: 10px;
    }
    textarea::-webkit-scrollbar{
      display: none;
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
