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
    default : {'1913' : false}
}

const interviewer = mongoose.Schema({

    username: reqString,
    password: reqString,
    email: reqString,
    joinTimeStamp: reqNumber,
    appointments: unReqObject,
    availability: reqObject,
    interviewer: { type: Boolean }
})

module.exports = mongoose.model('interviewers', interviewer)