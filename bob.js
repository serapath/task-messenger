// bob.js
module.exports = function bob (c = 999) {
  const id = setInterval(() => {
    console.log('bob', localStorage.bob = c--)
  }, 1000)
  const B = document.createElement('button')
  B.onclick = () => clearTimeout(id)
  B.textContent = 'stop bob'
  document.body.innerHTML = localStorage.bob
  document.body.append(B)
  document.body.style = 'background: pink;'
}