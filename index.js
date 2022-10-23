import { Wasteof2Auth } from 'wasteof-client';
import express from 'express';
import * as fs from 'fs';

const app = express()
app.use('/public', express.static('public'))
app.use(express.json())

var db, id;
fs.readFile(`./data.json`, 'utf8', (err, file) => { db = JSON.parse(file); id = db.length ? Math.max(...db.map(data => data[0])) : 0; id++ })
setInterval(() => fs.writeFileSync(`./data.json`, JSON.stringify(db)), 10000)

const client = new Wasteof2Auth('chat-history', process.env.password)

const html = fs.readFileSync('./public/index.html')

client.login().then(function() {
  console.log('logged in')
  client.listen(function({ type, data }, _) {
    switch (type) {
      case 'chat message':
        if (isNaN(id)) return
        var message = [id++, data.from.name, data.content, new Date()]
        db.unshift(message)
        pool.forEach(res => res.json(message))
        pool = []
        break
    }
  })
});

app.get('/api', (req, res) => {
  var limit = +req.query.limit, offset = +req.query.offset
  if (isNaN(limit) || limit > 30 || limit < 0) limit = 30
  if (isNaN(offset) || offset < 0) offset = 0
  res.json(db.slice(offset, Math.min(offset + limit, db.length)))
});

app.get('/', (req, res) => { res.header('Content-Type', 'text/html; charset=UTF-8'); res.send(html) })


var pool = [] //im way lazy for adding ws
app.get('/pool', (req, res) => pool.push(res))

app.listen(6942);