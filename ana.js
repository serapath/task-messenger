// ana.js
module.exports = function ana (c = 0) {
  const id = setInterval(() => {
    console.log('ana', localStorage.ana = c--)
  }, 1000)
  const B = document.createElement('button')
  B.onclick = () => clearTimeout(id)
  B.textContent = 'stop ana'
  document.body.innerHTML = localStorage.ana
  document.body.append(B)
  document.body.style = 'background: skyblue;'
}