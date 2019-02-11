const express = require('express')
const fs = require('fs')
const morgan = require('morgan')
const path = require('path')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

app.use(cors())
/*const requestLogger = (request, response, next) => {
  if (request.method === "POST") {
    console.log('name: ' , request.body.name, "number: ", request.body.number)
  }
  next()
}*/

app.use(bodyParser.json())

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(express.static('build'))
morgan.token('body', (req) => {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456'
    },
    {
    id: 2,
    name: 'Arto Järvinen',
    number: '040-123456'
    },
    {
    id: 3,
    name: 'Lea Kutvonen',
    number: '040-123456'
    },
    {
    id: 4,
    name: 'Martti Tienari',
    number: '040-123456'
    }
  ]

  app.get('/', (req, res) => {
    res.send('<h1>Etusivu</h1>')
  })

  app.get('/api', (req, res) => {
    res.send('<h1>Api</h1>')
  })

  app.get('/api/info', (req, res) => {
    const number = persons.length
    console.log('list', number)
    
    res.send(`<p>Puhelinluettelossa ${number} henkilön tiedot</p><p>${Date()}</p>`)
  })
  
  app.get('/api/persons', (req, res) => {
    res.json(persons)
  })

  app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => 
        person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.end()
        response.status(404)
        
    }
  })

  app.post('/api/persons', (request, response) => {
    console.log(request.body)
    const body = request.body
    if (body.name === undefined) {
      return response.status(400).json({ error: 'name missing' })
    }
    if (body.number === undefined) {
      return response.status(400).json({ error: 'number missing' })
    }
    const sameName = persons.filter(person => person.name === body.name)
    const sameNumber = persons.filter(person => person.number === body.number)
    if (sameName.length > 0) {
      return response.status(400).json({ error: 'name must be unique' })
    }
    if (sameNumber.length > 0) {
      return response.status(400).json({ error: 'number must be unique' })
    }
    const randomId = Math.floor(Math.random() * Math.floor(100000));
    const person = {
      id: randomId,
      name: body.name,
      number: body.number
    }
  
    persons = persons.concat(person)
  
    response.json(person)
    
  })

  /*app.delete('/persons/:id', (request, response) => {
    const deletePerson = persons.filter(person => person.id == id)
    const id = Number(request.params.id)
    if (id === undefined) {
      return response.json({ error: 'wrong id' })
    } else if (deletePerson === undefined) {
      return response.json({ error: 'person not found' })
    } else {
      persons = persons.filter(person => person.id !== id)
    }
    response.end()
    response.status(204)
  })*/

  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id);

    response.status(204).end();
  });

  
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })