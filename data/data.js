
const interviewee = require('./models/interviewee');
const interviewer = require('./models/interviewer');


const setInterviewee = async (userid, thingtoset, value) => {
    interviewee.findOneAndUpdate({ username: userid }, {
        $set: {
            [thingtoset]: value
        }
    }, async function (err, docs) {
        return docs
    })
}
const setInterviewer = async (userid, thingtoset, value) => {
    interviewer.findOneAndUpdate({ username: userid }, {
        $set: {
            [thingtoset]: value
        }
    }, async function (err, docs) {
        return docs
    })
}


const fetchInterviewee = async (options) => {
    const result = await interviewee.findOne(options)
    return result
}

const fetchInterviewer = async (options) => {
    const result = await interviewer.findOne(options)
    return result
}

const newInterviewer = async (
    username,
    password,
    timeStamp,
    email
) => {
    if (!username || !password || !timeStamp || !email) {
        return undefined
    }
    let user = await new interviewer({
        username: username,
        password: password,
        email: email,
        joinTimeStamp: timeStamp,
        interviewer:true
    }).save()
    return user
}

const newInterviewee = async (
    username,
    password,
    timeStamp,
    email,
    github,
    website,
    linkedin
) => {
    if (!username || !password || !timeStamp || !email) {
        return undefined
    }
    let user = await new interviewee({
        username: username,
        password: password,
        email: email,
        joinTimeStamp: timeStamp,
        github: github,
        website: website,
        linkedin: linkedin,
        interviewer:false
    }).save()
    return user
}

module.exports = {
    newInterviewee,
    newInterviewer,
    fetchInterviewee,
    fetchInterviewer,
    setInterviewee,
    setInterviewer
}