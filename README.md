[Try it](https://schedular.milad.wtf/)

# Schedular

## Inspiration

The difficulty in scheduling interviews and the inconvenience of going back and forth with an interviewer until a consensus is reached gave us the inspiration to create a program that solves that problem and allows for a more efficient and simpler way of finding times to meet.

## What it does

Schedular allows for employers to easily create a interviewing schedule. The interviewer must create an account and set their availability then share a link to all the interviewees who have accounts and have set their availability. After doing so, every time the link is pressed by an interviewee, the website will update the schedule on both sides. Using Twilio, the interviewee will recieve a SMS notification when their appointment is booked or modified.

## How we built it

The main things used to build the web app are figma, express.js, ejs, Twilio, bcrypt, mongo and CSS. Figma was used to prototype the website and give us an idea of what we wanted before starting development. For the front end, CSS and ejs were used in order to provide a smooth and soothing user interface. Mongo was used to store the data for logins, preferences and appointments. It also stores passwords which were encrypted using bcrypt. Twilio was used to send confirmation SMS messages once an appointment was booked.

## Challenges we ran into

Throughout the process of building this web app, we ran into several challenges. The main ones include challenges within the login system and trouble with our original concept. We had trouble setting up a login system and allowing for the back-end to communicate with the front end which we then solved using ejs. Our original concept was more complex than what we were able to develop within the two days so we had to tweak it in order to complete our project. Though we weren't able to finish, we are looking forward to work on it and finish what we would like to have done in the future.

## Accomplishments that we're proud of

We are proud to have created an application that improves the process of finding a time where both an interviewee and interviewer are available. Usually this process would take multiple emails back and forth which is a annoying process. Simplifying the process and making it less stressful is something we are proud to be able to bring into peoples lives.

## What we learned

This project taught us how to create a secure and efficient login and profile system using mongodb, express and bcrypt. Expanding our knowledge about how to use databases while working with web apps is an important thing that may come in handy while working on future projects. Learning how to allow the user to change their settings will help us expand the project

## What's next for Schedular

Possible updates for Schedular include more customization and support for more dates. As of now, you are only able to book within one week, in the future this may expand to a month or maybe even a year. More customization means having more settings for the availability section such as preference or the ability to rank the times. We can also include a better incorporation of Twilio. Twilio can be used to confirm accounts and notify users about upcoming appointments.
