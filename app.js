require('dotenv').config();

let TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
let TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
// twilio
const accountSid = TWILIO_ACCOUNT_SID;
const authToken = TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


// express server
const express = require('express')
const app = express()
const server = require('http').createServer(app)

// bcrypt  
const bcrypt = require('bcrypt');
const saltRounds = 10;

// session
var session = require('express-session');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded())
//ejs
const ejs = require('ejs')
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// data
const db = require('./data/data');
const e = require('express');
require('./data/mongo')()


app.get('/', async (req, res) => {
    if (req.session.loggedin) {
        if (req.session.user.interviewer) {
            let result = await db.fetchInterviewer({ username: req.session.user.username })

            req.session.user = result
            return res.render('index', { session: req.session })

        }
    }
    res.render('index', { session: req.session })
})

app.get('/logout', (req, res) => {
    delete req.session.user;
    req.session.loggedin = false
    res.redirect('/')
})

app.get('/er-login', (req, res) => {
    if (req.session.loggedin) return res.redirect('/')
    res.render('er-login', { session: req.session, errors: {} })
})


app.get('/ee-login', (req, res) => {
    if (req.session.loggedin) return res.redirect('/')
    res.render('ee-login', { session: req.session, errors: {} })
})

app.get('/ee-signup', (req, res) => {
    if (req.session.loggedin) return res.redirect('/')
    res.render('ee-signup', { session: req.session, errors: {} })
})

app.get('/er-signup', (req, res) => {
    if (req.session.loggedin) return res.redirect('/')
    res.render('er-signup', { session: req.session, errors: {} })
})

app.get('/settings', (req, res) => {
    if (!req.session.loggedin) return res.redirect('/')
    res.render('settings', { session: req.session, errors: {} })
})


app.get('/schedule/:user', async (req, res) => {
    if (!req.session.loggedin) return res.redirect('/ee-login')
    if (req.session.user.interviewer) return res.redirect('/')

    let result = await db.fetchInterviewer({ username: req.params.user })

    if (!result) return res.render('error', { message: "This is not a valid interviewer" })


    if (result.appointments) {
        if (Object.values(result.appointments).includes(req.session.user.username)) {
            return res.render('error', { message: "You have already scheduled an appointment with this interviewer" })
        }
    }

    let erAvailability = result.availability
    let eeAvailability = req.session.user.availability

    if (!erAvailability) return res.render('error', { message: "Interviewer has not set availability" })
    if (!eeAvailability) return res.render('error', { message: "You have not set availability" })

    let common = []

    let daysEE = Object.keys(eeAvailability)
    let daysER = Object.keys(erAvailability)
    if (!result.appointments) result.appointments = {}
    if (!req.session.user.appointments) req.session.user.appointments = {}
    daysEE.forEach(dayEE => {

        daysER.forEach(dayER => {
            if (dayEE === dayER) {



                let timesEE = Object.keys(eeAvailability[dayEE])
                let timesER = Object.keys(erAvailability[dayER])

                timesEE.forEach(timeEE => {

                    timesER.forEach(timeER => {
                        if (timeEE === timeER) {

                            let times = []
                            if (!result.appointments[`${dayEE} ${timeEE}`]) {
                                common.push(`${dayEE} ${timeEE}`)
                            }
                        }
                    })
                })




            }
        })

    })


    if (common.length === 0) return res.render('error', { message: "No common availability" })

    result.appointments[`${common[0].split(' ')[0]} ${common[0].split(' ')[1]}`] = req.session.user.username
    await db.setInterviewer(result.username, 'appointments', result.appointments)
    req.session.user.appointments[`${common[0].split(' ')[0]} ${common[0].split(' ')[1]}`] = result.username
    await db.setInterviewee(req.session.user.username, 'appointments', req.session.user.appointments)

    try {
        client.messages
            .create({
                body: `${req.session.user.username}, you have been scheduled an interview with ${result.username} on the ${common[0]} between between ${parseInt(common[0].split(' ')[1]) * 2 - 2} and ${parseInt(common[0].split(' ')[1]) * 2} PST.`,
                from: '+18454129518',
                to: req.session.user.website
            })
            .then(message => console.log(message.sid));

    } catch (e) {
        console.log('Invalid phone number')
    }
    return res.render('error', { message: `You have been booked on ${common[0].split(' ')[0]} at the times between ${parseInt(common[0].split(' ')[1]) * 2 - 2} and ${parseInt(common[0].split(' ')[1]) * 2}.` })

})

app.post('/er-auth', async (req, res) => {
    if (req.session.loggedin) return res.redirect('/')
    var username = req.body.username.toLowerCase();
    var password = req.body.password;

    let result = await db.fetchInterviewer({ username: username })
    if (!result) {
        return res.render('er-login', {
            errors: { login: "Invalid login" },
            username: username
        })
    }
    bcrypt.compare(password, result.password, async function (err, check) {
        if (check) {
            req.session.loggedin = true;
            req.session.user = result;
            return res.redirect('/')
        } else {
            result = await db.fetchInterviewer({ username: username })
            bcrypt.compare(password, result.password, async function (err, check) {
                if (check) {
                    req.session.loggedin = true;
                    req.session.user = result;
                    return res.redirect('/')
                } else {
                    return res.render('er-login', {
                        errors: { login: "Invalid login" },
                        username: username
                    })
                }
            })
        }
    });

})

app.post('/update-settings', async (req, res) => {
    if (!req.session.loggedin) return res.redirect('/')
    let object = {}
    Object.keys(req.body).forEach(async key => {
        if (object[key.split` `[0]]) {
            object[key.split` `[0]][key.split` `[1]] = true
        } else {
            object[key.split` `[0]] = { [key.split` `[1]]: true }
        }
    })
    if (req.session.user.interviewer) {
        await db.setInterviewer(req.session.user.username, 'availability', object)
        req.session.user.availability = object
    } else {
        await db.setInterviewee(req.session.user.username, 'availability', object)
        req.session.user.availability = object

    }
    res.render('settings', { session: req.session })

})
app.post('/ee-auth', async (req, res) => {
    if (req.session.loggedin) return res.redirect('/')
    var username = req.body.username.toLowerCase();
    var password = req.body.password;

    let result = await db.fetchInterviewee({ username: username })
    if (!result) {
        return res.render('ee-login', {
            errors: { login: "Invalid login" },
            username: username
        })
    }
    bcrypt.compare(password, result.password, async function (err, check) {
        if (check) {
            req.session.loggedin = true;
            req.session.user = result;
            return res.redirect('/')
        } else {
            result = await db.fetchInterviewee({ username: username })
            bcrypt.compare(password, result.password, async function (err, check) {
                if (check) {
                    req.session.loggedin = true;
                    req.session.user = result;
                    return res.redirect('/')
                } else {
                    return res.render('ee-login', {
                        errors: { login: "Invalid login" },
                        username: username
                    })
                }
            })
        }
    });

})




app.post('/ee-join', async (req, res) => {
    if (req.session.loggedin) return res.redirect('/')
    try {
        var username = req.body.username.toLowerCase();
        var password = req.body.password
        var email = req.body.email.toLowerCase();
        var joinTimeStamp = Date.now();
    }
    catch (e) {
        return res.render('ee-signup', {
            errors: {
                email: null,
                username: "Invalid username.",
                password: null
            },
            username: username,
            email: email
        })
    }
    if (!email.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi)) {
        return res.render('ee-signup', {
            errors: {
                email: "Invalid email.",
                username: null,
                password: null
            },
            username: username,
            email: email
        })
    } else if (!username.match(/^(?=.{5,15}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/gi)) {
        return res.render('ee-signup', {
            errors: {
                email: null,
                username: "Invalid username.",
                password: null
            },
            username: username,
            email: email
        })
    } else if (password.length < 8) {
        return res.render('ee-signup', {
            errors: {
                email: null,
                username: null,
                password: "Password too short."
            },
            username: username,
            email: email
        })
    }

    let emailCheck = await db.fetchInterviewee({ email: email })
    let usernameCheck = await db.fetchInterviewee({ username: username })



    if (emailCheck) {
        res.render('ee-signup', {
            errors: {
                email: "Email already exists.",
                username: null,
                password: null
            },
            username: username,
            email: email

        })
    } else if (usernameCheck) {
        res.render('ee-signup', {
            errors: {
                email: null,
                username: "Username already exists.",
                password: null
            },
            username: username,
            email: email

        })

    } else {
        bcrypt.hash(password, saltRounds, async function (err, hash) {
            let user = await db.newInterviewee(username, hash, joinTimeStamp, email, req.body.github || '', req.body.website || '', req.body.linkedin || '')
            req.session.user = user
            req.session.loggedin = true
            res.render('index', { session: req.session })
        });

    }
})


app.post('/er-join', async (req, res) => {
    if (req.session.loggedin) return res.redirect('/')

    try {
        var username = req.body.username.toLowerCase();
        var password = req.body.password
        var email = req.body.email.toLowerCase();
        var joinTimeStamp = Date.now();
    }
    catch (e) {
        return res.render('er-signup', {
            errors: {
                email: null,
                username: "Invalid username.",
                password: null
            },
            username: username,
            email: email
        })
    }

    if (!email.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi)) {
        return res.render('er-signup', {
            errors: {
                email: "Invalid email.",
                username: null,
                password: null
            },
            username: username,
            email: email
        })
    } else if (!username.match(/^(?=.{5,15}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/gi)) {
        return res.render('er-signup', {
            errors: {
                email: null,
                username: "Invalid username.",
                password: null
            },
            username: username,
            email: email
        })
    } else if (password.length < 8) {
        return res.render('er-signup', {
            errors: {
                email: null,
                username: null,
                password: "Password too short."
            },
            username: username,
            email: email
        })
    }

    let emailCheck = await db.fetchInterviewer({ email: email })
    let usernameCheck = await db.fetchInterviewer({ username: username })



    if (emailCheck) {
        res.render('er-signup', {
            errors: {
                email: "Email already exists.",
                username: null,
                password: null
            },
            username: username,
            email: email

        })
    } else if (usernameCheck) {
        res.render('er-signup', {
            errors: {
                email: null,
                username: "Username already exists.",
                password: null
            },
            username: username,
            email: email

        })

    } else {
        bcrypt.hash(password, saltRounds, async function (err, hash) {
            let user = await db.newInterviewer(username, hash, joinTimeStamp, email)
            req.session.user = user
            req.session.loggedin = true
            res.render('index', { session: req.session })
        });

    }
})

app.get('/data', (req, res) => {
    res.json(req.session)
})

server.listen(3000, function () {
    console.log("Listening on port 3000")
})
