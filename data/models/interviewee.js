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
const reqObject = {
    type: Object,
    required: true,
    default: {}
}
const interviewee = mongoose.Schema({

    username: reqString,
    password: reqString,
    email: reqString,
    github: unReqString,
    website: unReqString,
    linkedin: unReqString,
    joinTimeStamp: reqNumber,
    availability: reqObject,
    appointments: unReqObject,
    interviewer: { type: Boolean }


})

module.exports = mongoose.model('interviewee', interviewee)