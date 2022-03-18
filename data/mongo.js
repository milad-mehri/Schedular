const mongoose = require('mongoose')

const { mongoUri } = require('../config.json')
async function mongo() {
    await mongoose.connect(mongoUri, {

        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    console.log("Connected to mongo!")

    return mongoose
}
module.exports = mongo