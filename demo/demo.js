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