navigator.geolocation.getCurrentPosition(success, error);

async function success(pos) {
    getData(pos.coords.latitude, pos.coords.longitude);
}
async function error(err) {
    console.error(err);
}

async function getData(lat, lon) {

    try {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        }

        const response = await fetch(`/weather/${lat}/${lon}`, options)
        const responseJSON = await response.json();
        printWeatherData(responseJSON);
        postToDatabase(responseJSON);
    }
    catch (error) {
        console.error(error);
        const errorMessage = document.createElement('div');
        errorMessage.style.color = 'red';
        errorMessage.textContent = 'Something went wrong while searching for the data. Please reload the page to try again';
        document.getElementById('dataDiv').append(errorMessage);
    }


}

function printWeatherData(data) {
    //location
    const location = data.weather.resolvedAddress;
    const locArray = location.split(',');
    const lat = parseFloat(locArray[0]).toFixed(2);
    const lon = parseFloat(locArray[1]).toFixed(2);
    const days = data.weather.days;
    const time = days[0].datetime;
    const locText = document.createElement('div');
    locText.textContent = `You checked in at location (${lat} , ${lon}) at ${time}`
    document.getElementById('dataDiv').append(locText);

    //temperature
    const forecastText = document.createElement('div');
    const tempMinC = parseFloat((5/9) * (days[0].tempmin - 32)).toFixed(1);
    const tempMaxC = parseFloat((5/9) * (days[0].tempmax - 32)).toFixed(1);
    forecastText.textContent = `The temperature today ranges from ${tempMinC} to ${tempMaxC} °C`
    document.getElementById('dataDiv').append(forecastText);

    //air pollution
    const ap = data.air_pollution;
    const apText = document.createElement('div');
    apText.textContent = 'Current Air Quality: ' + ap + ' pm2.5';
    document.getElementById('dataDiv').append(apText);
}

async function postToDatabase(data) {

    const location = data.weather.resolvedAddress.split(',')

    const newEntry = {
        lat: location[0],
        lon: location[1],
        tempmax: data.weather.days[0].tempmin,
        tempmin: data.weather.days[0].tempmax,
        aq: data.air_pollution
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEntry)
    }

    const response = await fetch('/weather', options);
    const responseJSON = await response.json();
    console.log(responseJSON);
}