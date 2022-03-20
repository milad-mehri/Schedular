const mongoose = require('mongoose')
require('dotenv').config();

const mongoUri  = process.env.mongoUri
async function mongo() {
    await mongoose.connect(mongoUri, {

        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    console.log("Connected to mongo!")

    return mongoose
}
module.exports = mongo