// initialize app and other needed vars
const { response } = require('express')
const express = require('express')
const app = express()

app.use(express.json())

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
]

// server endpoints
/* GET requests */
app.get('/', (req, resp) => {
    resp.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, resp) => {
    console.log("sending info about phonebook to client")
    const time = new Date().toString()
    const num = persons.length
    resp.send(`<p>Phonebook has info for ${num} people</p><p>${time}</p>`)
})

app.get('/api/persons', (req, resp) => {
    console.log('returning list of persons to client')
    resp.json(persons)
})

app.get('/api/persons/:id', (req, resp) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)
    
    if (person) {
        console.log(`returning single item of id ${id.toString()} to client`)
        resp.json(person)
    } else {
        resp.status(404).end()
    }
})
/* POST requests */
app.post('/api/persons', (req, resp) => {
    console.log(req.headers)
    const newId = Math.trunc(Math.random() * 100000)
    const body = req.body

    if (body.name && body.number) {
        const duplicate = persons.find(person => person.name === body.name)
        if (duplicate) {
            // a duplicate exists
            console.log(duplicate)
            const error = { error: "name must be unique!" }
            resp.json(error)
        } else {
            // new entry is made
            const newPerson = {
                id: newId,
                name: body.name,
                number: body.number
            }
        
            persons = persons.concat(newPerson)
        
            resp.json(newPerson)
        }
    } else {
        const response = { error: "name or number is missing!" }
        resp.json(response)
    }
})
/* PUT requests */
/* DELETE requests */
app.delete('/api/persons/:id', (req, resp) => {
    const id = Number(req.params.id)
    // reassigns persons var to the new array created from filter function
    persons = persons.filter(person => person.id !== id)

    // returns a 'no content' status
    resp.status(204).end()
})

// start app
const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})