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
const { response } = require('express')

app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

// let persons = [
//     {
//         id: 1,
//         name: "Arto Hellas",
//         number: "040-123456"
//     },
//     {
//         id: 2,
//         name: "Ada Lovelace",
//         number: "39-44-5323523"
//     },
//     {
//         id: 3,
//         name: "Dan Abramov",
//         number: "12-43-234345"
//     },
//     {
//         id: 4,
//         name: "Mary Poppendick",
//         number: "39-23-6423122"
//     }
// ]

// server endpoints
/* GET requests */
app.get('/', (req, resp) => {
    resp.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, resp) => {
    // console.log("sending info about phonebook to client")
    const time = new Date().toString()
    const num = persons.length
    resp.send(`<p>Phonebook has info for ${num} people</p><p>${time}</p>`)
})

app.get('/api/persons', (req, resp) => {
    // console.log('returning list of persons to client')
    Person.find({}).then(people => {
        resp.json(people)
    })
    
})

app.get('/api/persons/:id', (req, resp) => {
    Person.findById(req.params.id)
        .then(person => {
            resp.json(person)
        })
        .catch((error) => {
            console.log(error)
        })
})
/* POST requests */
app.post('/api/persons', (req, resp) => {
    // console.log(req.headers)
    // const newId = Math.trunc(Math.random() * 100000)
    const body = req.body

    if (body.name && body.number) {
        // const duplicate = persons.find(person => person.name === body.name)
        // if (duplicate) {
        //     // a duplicate exists
        //     console.log(duplicate)
        //     const error = { error: "name must be unique!" }
        //     resp.json(error)
        // } else {

        // }
        const person = new Person({
            name: body.name,
            number: body.number
        })

        person.save()
            .then(savedPerson => {
                resp.json(savedPerson)
            })
            .catch((error) => {
                console.log(error)
            })
    } else {
        const response = { error: "name or number is missing!" }
        resp.json(response)
    }
})
/* PUT requests */
/* DELETE requests */
app.delete('/api/persons/:id', (req, resp) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            resp.status(204).end()
        })
        .catch(error => next(error))
})

// start app
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})