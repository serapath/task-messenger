// devtools.js
function html (js_src) {
  return `<!doctype html>
  <html>
    <head><meta charset="utf-8"></head>
    <body><script>{
      const module = {}
      { ${js_src} }
      module.exports()
    }</script></body>
  </html>`
}
function _2blob (js_src) {
  const mimetype = { type: "text/html" }
  return new Blob([html(js_src)], mimetype)
}
function _2href (blob) {
  return URL.createObjectURL(blob)
}
function iframe (href) {
  const el = document.createElement('iframe')
  el.setAttribute('src', href)
  return el
}
function ctrls (el, i) {
  const txt = document.createTextNode('')
  const btn = document.createElement('button')
  boot()
  document.body.append(btn)
  return el
  function boot () {
    btn.onclick = stop
    btn.textContent = `stop peer ${i}`
    txt.replaceWith(el)
  }
  function stop () {
    btn.onclick = boot
    btn.textContent = `boot peer ${i}`
    el.replaceWith(txt)
  }
}
Promise.all([
  fetch('./ana.js').then(r => r.text()),
  fetch('./bob.js').then(r => r.text()),
]).then(srcs => {
  return srcs.map(_2blob).map(_2href).map(iframe)
}).then(iframes => {
  document.body.append(...iframes.map(ctrls))
})