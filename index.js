const express = require('express')
const fs = require('fs')
const morgan = require('morgan')
const path = require('path')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
const Person = require('./models/person')
app.use(cors())
app.use(express.static('build'))
app.use(bodyParser.json())

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

morgan.token('body', (req) => {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

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
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  });
  
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
  .then(person => {
    if (person) {
      response.json(person.toJSON())
    } else {
      response.status(404).end() 
    }
  })
  .catch(error => next(error))
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
  /*const sameName = persons.filter(person => person.name === body.name)
  const sameNumber = persons.filter(person => person.number === body.number)
  if (sameName.length > 0) {
    return response.status(400).json({ error: 'name must be unique' })
  }
  if (sameNumber.length > 0) {
    return response.status(400).json({ error: 'number must be unique' })
  }*/
  const randomId = Math.floor(Math.random() * Math.floor(100000));
  const person = new Person({
    id: randomId,
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson.toJSON())
  })
  
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

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})