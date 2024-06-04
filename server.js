require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Funzione per ottenere l'icona meteo basata sulla condizione
function weatherIcon(condition) {
    const iconMap = {
        'clear-day': 'fas fa-sun',
        'clear-night': 'fas fa-moon',
        'rain': 'fas fa-cloud-rain',
        'snow': 'fas fa-snowflake',
        'sleet': 'fas fa-cloud-meatball',
        'wind': 'fas fa-wind',
        'fog': 'fas fa-smog',
        'cloudy': 'fas fa-cloud',
        'partly-cloudy-day': 'fas fa-cloud-sun',
        'partly-cloudy-night': 'fas fa-cloud-moon',
        'hail': 'fas fa-cloud-showers-heavy',
        'thunderstorm': 'fas fa-bolt',
        'tornado': 'fas fa-poo-storm'
    };

    return iconMap[condition] || 'fas fa-question';
}

app.get('/', (req, res) => {
    res.render('index', { weather: null, error: null });
});

app.get('/weather', async (req, res) => {
    const pirateWeatherApiKey = process.env.PIRATE_WEATHER_API_KEY;
    const openCageApiKey = process.env.OPENCAGE_API_KEY;
    const city = req.query.city;
    const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${openCageApiKey}`;

    try {
        const geoResponse = await axios.get(geoUrl);
        const { lat, lng } = geoResponse.data.results[0].geometry;
        const weatherUrl = `https://api.pirateweather.net/forecast/${pirateWeatherApiKey}/${lat},${lng}?units=si`;
        const weatherResponse = await axios.get(weatherUrl);
        const weather = weatherResponse.data;
        weather.latitude = lat;
        weather.longitude = lng;
        weather.city = geoResponse.data.results[0].components.city || geoResponse.data.results[0].components.town || geoResponse.data.results[0].components.village || city;



        // Assegna la classe dell'icona meteo
        weather.iconClass = weatherIcon(weather.currently.icon);

        // Rendi il template con i dati meteorologici
        res.render('index', { weather, error: null });
    } catch (error) {
        // Se si verifica un errore, rendi il template con un messaggio di errore
        res.render('index', { weather: null, error: 'City not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
