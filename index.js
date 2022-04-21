const { response } = require('express');
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express(); //express allows us to create an app
app.listen(3001, () => console.log("listening at port 3001")); //specifies port
app.use(express.static('public')); //specifiec the foldes with static webpages to send to user
app.use(express.json({ limit: '1mb' })); //allows the app to parse JSON data. "limit" is one of the options we can change

const Datastore = require('nedb')
db = new Datastore({ filename: 'weatherData' });
db.loadDatabase();

require('dotenv').config()

app.get('/weather/:lat/:lon', async (request, response) => {
    const lat = request.params.lat;
    const lon = request.params.lon;

    data = await Promise.all([getWeather(lat, lon), getAQ(lat, lon)])

    const dataObj = {
        weather: data[0],
        air_pollution: data[1]
    }

    await response.json(dataObj);
});

async function getWeather(lat, long) {

    const location = lat.toString() + ',' + long.toString();
    const apiKey = process.env.API_KEY_WEATHER;
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=${apiKey}`

    const response = await fetch(url, {
        method: 'GET',
        headers: {},
    })

    const responseJSON = await response.json();
    return responseJSON;
}

async function getAQ(lat, lon) {

    const apiKey = process.env.API_KEY_AQ;
    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {},
    })

    const responseJSON = await response.json();
    return responseJSON.list[0].components.pm2_5;
}

app.post('/weather', (request, response) => {

    const lat = request.body.lat;
    const lon = request.body.lon;
    const tempmax = request.body.tempmax;
    const tempmin = request.body.tempmin;
    const aq = request.body.aq;
    const timestamp = new Date().getTime();

    const dbEntry = {
        latitude: lat,
        longitude: lon,
        time: timestamp,
        tempmax: tempmax,
        tempmin: tempmin,
        air_pollution: aq
    }

    response.json({
        message: 'post request successful!!! The following data was posted.',
        data: dbEntry
    });

    db.insert(dbEntry);

})

app.get('/weather/all', async (request, response) => {

    db.find({}, function (err, docs) {
        response.json(docs);
    });

});
