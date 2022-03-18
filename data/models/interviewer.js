const mongoose = require("mongoose")

const reqString = {
    type: String,
    required: true
}

const unReqString = {
    type: String,
    required: false
}
const reqNumber = {
    type: Number,
    required: true
}

const unReqObject = {
    type: Object,
    required: false
}

const interviewer = mongoose.Schema({

    username: reqString,
    password: reqString,
    email: reqString,
    joinTimeStamp: reqNumber,
    appointments : unReqObject,
    availability : unReqObject
})

module.exports = mongoose.model('interviewers', interviewer)