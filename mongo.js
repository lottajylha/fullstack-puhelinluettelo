const mongoose = require('mongoose')

if ( process.argv.length<3 ) {
  console.log('give password as argument')
  process.exit(1)
}
console.log(process.argv.length)

const password = process.argv[2]

const url =
  `mongodb+srv://Lotta:${password}@cluster0-owolm.mongodb.net/phonebook-db?retryWrites=true`

mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
  id: String,
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if ( process.argv.length === 3 ) {
    console.log('puhelinluettelo')
    Person.find({}).then(result => {
        result.forEach(person => {
          console.log(person.name, ' ', person.number)
        })
        mongoose.connection.close()
      })
} else if ( process.argv.length === 5 ) {
    
    const person = new Person({
    id: Math.floor(Math.random() * Math.floor(100000)),
    name: process.argv[3],
    number: process.argv[4],
    })

    person.save().then(response => {
    console.log('lisätään ', person.name, ' numero ', person.number, ' luetteloon');
    mongoose.connection.close();
    })
}