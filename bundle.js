(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const task_messenger = require('..')
// ----------------------------------------
const sheet = new CSSStyleSheet()
sheet.replaceSync(get_theme())


const bob = task_messenger ({ username: 'bob' })
const ana = task_messenger ({ username: 'ana' })
document.adoptedStyleSheets = [sheet]
document.body.append(bob, ana)



function get_theme () {
  return `
    body{
      display: flex;
      margin: 0;
    }
    body > div{
      width: 100%;
    }
  `
}
},{"..":2}],2:[function(require,module,exports){
const sheet = new CSSStyleSheet()
sheet.replaceSync(get_theme())
const shopts = { mode: 'closed' }
//  ----------------------------------------
module.exports = task_messenger
//  ----------------------------------------
function task_messenger (opts) {
  const task_tree = [
    {id: 1, name: 'task1', children: [
      {id: 2, name: 'childtask1', children: []},
      {id: 3, name: 'childtask2', children: []},
      {id: 4, name: 'childtask3', children: []}
    ]},
    {id: 5, name: 'task2', children: [
      {id: 6, name: 'childtask1', children: []},
      {id: 7, name: 'childtask2', children: []},
      {id: 8, name: 'childtask3', children: []}
    ]},
    {id: 9, name: 'task3', children: [
      {id: 10, name: 'childtask1', children: []},
      {id: 11, name: 'childtask2', children: []},
      {id: 12, name: 'childtask3', children: []}
    ]}
  ]
  let task_count = 12
  let selected_task
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div');
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `
    <div class="main">
      <div class="username">
      ${opts.username}
      </div>
      <div class="container">
        <div class="task_tree">
        </div>
        <button class="create">
          Create task
        </button>
      </div>
      <div class="overlay">
        <div>
          Task Name
          <input id="input_name" type="text" />
          <button class="confirm">
            Confirm
          </button>
        </div>
      </div>
    </div>
  `
  // ----------------------------------------
  const btn_create = shadow.querySelector('.create')
  const overlay = shadow.querySelector('.overlay')
  const btn_confirm = shadow.querySelector('.confirm')
  const task_tree_el = shadow.querySelector('.task_tree')
  const input_name = shadow.querySelector('#input_name')
  // ----------------------------------------
  btn_create.onclick = show_overlay
  btn_confirm.onclick = create_task
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  fill_task_tree()
  return el

  async function create_task () {
    hide_overlay()
    if(selected_task){
      const task = await find_task(task_tree, Number(selected_task.id))
      task.children.push({id: ++task_count, name: input_name.value, children: []})
      
    }
    else
      task_tree.push({id: ++task_count, name: input_name.value, children: []})
    fill_task_tree()
    if(selected_task){
      selected_task.classList.add('show')
      selected_task.classList.add('active')
    }
  }
  async function show_overlay () {
    overlay.classList.add('show')
  }
  async function hide_overlay () {
    overlay.classList.remove('show')
  }
  async function fill_task_tree () {
    task_tree_el.innerHTML = ''
    task_tree_el.append(...task_tree.map(make_task))
  }
  function make_task (data) {
    const element = document.createElement('div')
    element.classList.add('task')
    element.id = data.id
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
      if(selected_task)
        selected_task.classList.remove('active')
      selected_task = element
      selected_task.classList.add('active')
    }
    
    const children = element.querySelector('.children')
    children.append(...data.children.map(make_task))
    return element
  }
  async function find_task(tree, id) {
    for (const task of tree) {
      if (task.id === id) {
        return task;
      }
      if (task.children && task.children.length > 0) {
        const foundTask = await find_task(task.children, id);
        if (foundTask) {
          return foundTask;
        }
      }
    }
    return null; // Task with the given ID not found
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
      height: 100%;
      width: 100%;
      border: 1px solid black;
    }
    .task_tree{
      width: 100%;
    }
    .task{
      cursor: pointer;
      padding-left: 10px;
    }
    .task > .children{
      display: none;
    }
    .task.active{
      background-color: #aaaaaa;
    }
    .task.show > .children{
      display: block;
    }
    .overlay{
      display: none;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
      background-color: rgba(0, 0, 0, 0.4);
      position: absolute;
      top: 0;
      left: 0;
    }
    .overlay.show{
      display: flex;
    }
    .overlay > div{
      background-color: gray;
      box-shadow: 1px 1px 1px rgb(0, 0, 0);
      padding: 40px;
    }
  `
}

},{}]},{},[1]);
