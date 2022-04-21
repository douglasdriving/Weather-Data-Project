document.getElementById('map').style.height = '500px';

//create map
const map = L.map('map').setView([0, 0], 4);
const attribution = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';
const tileURL = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'
const tileLayer = L.tileLayer(tileURL, {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZG91Z2xhc2RyaXZpbmciLCJhIjoiY2wxeWZhZGk4MGM4eTNjbGZsNDAxNm0wNiJ9.FsJnVQu_aUwYugDUtJHlSw'
});
tileLayer.addTo(map);

addToMap();

async function addToMap() {
    const allWeatherData = await getAllWeatherData();
    console.log(allWeatherData);
    addMarkers(allWeatherData);
}

async function getAllWeatherData() {
    try {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        }

        const response = await fetch(`/weather/all`, options)
        const responseJSON = await response.json();
        return responseJSON;
    }
    catch (error) {
        console.error(error);
    }
};

function addMarkers(data) {

    data.forEach(function (dataEntry) {
        const lat = parseFloat(dataEntry.latitude).toFixed(2);
        const lon = parseFloat(dataEntry.longitude).toFixed(2);
        const date = new Date(dataEntry.time);
        let marker = L.marker([lat, lon]).addTo(map);
        const tempMinC = parseFloat((5/9) * (dataEntry.tempmax - 32)).toFixed(1); //these got switched up somewhere. I dont have time to fix
        const tempMaxC = parseFloat((5/9) * (dataEntry.tempmin - 32)).toFixed(1);

        let toolTip;
        if (dataEntry.air_pollution){
            toolTip =
            `
                <b>Location:</b> ${lat} , ${lon}<br>
                <b>Check-in Time:</b> ${date}<br>
                <b>Temperature Range:</b> ${tempMinC} - ${tempMaxC} °C<br>
                <b>Air Pollution:</b> ${dataEntry.air_pollution} pm25
            `;
        }
        else{
            toolTip =
            `
                <b>Location:</b> ${lat} , ${lon}<br>
                <b>Check-in Time:</b> ${date}<br>
                <b>Temperature Range:</b> ${dataEntry.tempmax} - ${dataEntry.tempmin} °C<br>
                <b>Air Pollution:</b> No measurment recorded.
            `;
        }

        marker.bindTooltip(toolTip).openTooltip();
    });
}


