const d = document

const ul = d.querySelector('ul')
var cursor = 0, totalIndexed = 0

function message(data, first = true) {
  if (data[0] > cursor) cursor = data[0]
  totalIndexed++
  var li = d.createElement('li')
  li.innerHTML = `
  <div class="user">
    <a target="blank" href="//wasteof.money/users/${data[1]}">
      <img src="//api.wasteof.money/users/${data[1]}/picture"/>
      <span>@${data[1]}</span>
    </a>
    <span>${new Date(data[3]).toLocaleString()}</span>
  </div>
  <div class="content"></div>`
  li.querySelector('div.content').innerText = data[2]
  if (first) ul.insertBefore(li, ul.firstChild)
  else ul.appendChild(li)
}

async function fetchJSON(path, fetchInit) {
  return new Promise(resolve => fetch(path, fetchInit).then(r => r.json()).then(json => resolve(json)))
}

var busy = false, loading = d.querySelector('span.loading')
async function loadMore() {
  busy = true, loading.style.display = 'block'
  var _ = (await fetchJSON(`/api?offset=${totalIndexed}`)).forEach(data => message(data, false))
  busy = false, loading.style = ''
}

(async () => {
  (await fetchJSON('/api')).reverse().forEach(message)
  d.querySelector('span.connecting').remove()
  onscroll = e => {
    if (cursor - totalIndexed < 0 || busy || innerHeight + scrollY + 50 < d.body.offsetHeight) return
    loadMore()
  }
  while (true) message(await fetchJSON('/pool', { timeout: 1000000000 }))
})()