// initialize app and other needed vars
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

// morgan configuration
morgan.token('body', (req) => {
    if (req.method === 'POST') {
        return JSON.stringify({ name: req.body.name, number: req.body.number })
    }
})

const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

// server endpoints
/* GET requests */
app.get('/', (req, resp) => {
    resp.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, resp, next) => {
    // console.log("sending info about phonebook to client")
    const time = new Date().toString()
    Person.find({}).then(people => {
        const num = people.length
        resp.send(`<p>Phonebook has info for ${num} people</p><p>${time}</p>`)
    })
        .catch(error => next(error))
})

app.get('/api/persons', (req, resp, next) => {
    // console.log('returning list of persons to client')
    Person.find({}).then(people => {
        resp.json(people)
    })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (req, resp, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                resp.json(person)
            } else {
                resp.status(404).end()
            }
        })
        .catch(error => next(error))
})
/* POST requests */
app.post('/api/persons', (req, resp, next) => {
    const body = req.body

    if (body.name && body.number) {
        const person = new Person({
            name: body.name,
            number: body.number
        })

        person.save()
            .then(savedPerson => {
                resp.json(savedPerson)
            })
            .catch(error => next(error))
    } else {
        const response = { error: 'name or number is missing!' }
        resp.status(400).json(response)
    }
})
/* PUT requests */
app.put('/api/persons/:id', (req, resp, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            resp.json(updatedPerson)
        })
        .catch(error => next(error))
})
/* DELETE requests */
app.delete('/api/persons/:id', (req, resp, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            resp.status(204).json(result).end()
        })
        .catch(error => next(error))
})

// unknown endpoint handling
const UnknownEndpoint = (req, resp) => {
    resp.status(404).send({ error: 'unknown endpoint' })
}
app.use(UnknownEndpoint)

// error handling
const errorHandler = (error, req, resp, next) => {
    console.error(error.message)

    // cast error from mongodb object transform
    if (error.name === 'CastError') {
        return resp.status(400).send({ error: 'malformed id' })
    } else if (error.name === 'ValidationError') {
        return resp.status(400).json({ error: error.message })
    }

    next(error)
}
app.use(errorHandler)

// start app
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})