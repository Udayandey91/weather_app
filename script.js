const userLocation = document.getElementById("userLocation"),
    currentLocationButton = document.getElementById("currentLocationButton"),
    convertor = document.getElementById("convertor"),
    weatherIcon = document.querySelector(".weatherIcon"),
    temperature = document.querySelector(".temperature"),
    description = document.querySelector(".description"),
    date = document.querySelector(".date"),
    city = document.querySelector(".city"),
    recentHistoryDropdown = document.getElementById("recentHistoryDropdown"),
    
    HValue = document.getElementById("HValue"),
    WValue = document.getElementById("WValue"),
    SRValue = document.getElementById("SRValue"),
    SSValue = document.getElementById("SSValue"),
    CValue = document.getElementById("CValue"),
    UVValue = document.getElementById("UVValue"),
    PValue = document.getElementById("PValue"),
    Forecast = document.querySelector(".Forecast");

const WEATHER_API_ENDPOINT = `https://api.weatherbit.io/v2.0/forecast/daily`;
const API_KEY = `631900645dde4565a9bfc6850f7693e3`;

let currentTempCelsius = 0;

function storeRecentSearch(locationName) {
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    if (!recentSearches.includes(locationName)) {
        recentSearches.unshift(locationName);
        if (recentSearches.length > 5) recentSearches.pop();
    }
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    updateRecentSearchDropdown();
}

function updateRecentSearchDropdown() {
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    recentHistoryDropdown.innerHTML = `<option value="" disabled selected>Select a recent search</option>`;
    recentSearches.forEach((search) => {
        let option = document.createElement("option");
        option.value = search;
        option.textContent = search;
        recentHistoryDropdown.appendChild(option);
    });
}

recentHistoryDropdown.addEventListener("change", function () {
    let selectedLocation = this.value;
    if (selectedLocation) {
        findUserLocation({ city: selectedLocation });
    }
});

const loading = document.getElementById("loading");
const errorDisplay = document.getElementById("error");

function showLoading() {
    loading.style.display = "block";
}
function hideLoading() {
    loading.style.display = "none";
}
function showError(msg) {
    errorDisplay.textContent = msg;
}
function clearError() {
    errorDisplay.textContent = "";
}

function findUserLocation(location = null) {
    let query = "";

    if (location && location.latitude && location.longitude) {
        query = `lat=${location.latitude}&lon=${location.longitude}`;
    } else if (location && location.city) {
        query = `city=${encodeURIComponent(location.city)}`;
    } else if (userLocation.value.trim()) {
        query = `city=${encodeURIComponent(userLocation.value.trim())}`;
    } else {
        showError("Please enter a location.");
        return;
    }

    showLoading();
    clearError();

    fetch(`${WEATHER_API_ENDPOINT}?${query}&days=5&key=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            hideLoading();
            if (!data || !data.data || data.data.length === 0) {
                showError("Invalid location or no forecast available.");
                return;
            }

            const current = data.data[0];
            city.innerHTML = `${data.city_name}, ${data.country_code}`;
            storeRecentSearch(data.city_name);

            const localTime = new Date();
            date.innerHTML = `📅 ${localTime.toLocaleString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            })}`;

            currentTempCelsius = current.temp;
            updateTemperatureDisplay();
            description.innerHTML = current.weather.description;
            weatherIcon.innerHTML = `<img src="https://www.weatherbit.io/static/img/icons/${current.weather.icon}.png" alt="${current.weather.description}" width="80" height="80">`;

            HValue.innerHTML = `${current.rh}%`;
            WValue.innerHTML = `${current.wind_spd.toFixed(1)} m/s`;
            SRValue.innerHTML = `Sunrise: N/A`;
            SSValue.innerHTML = `Sunset: N/A`;
            CValue.innerHTML = `${current.clouds}%`;
            UVValue.innerHTML = current.uv;
            PValue.innerHTML = `${current.pres} mb`;

            Forecast.innerHTML = "";
            data.data.forEach(day => {
                Forecast.innerHTML += `
                    <div class="forecast-item" aria-label="Forecast for ${day.valid_date}">
                        <p>${day.valid_date}</p>
                        <img src="https://www.weatherbit.io/static/img/icons/${day.weather.icon}.png" alt="${day.weather.description}" width="50" height="50">
                        <p>Min: ${convertTemperature(day.min_temp)}</p>
                        <p>Max: ${convertTemperature(day.max_temp)}</p>
                        <p>${day.weather.description}</p>
                    </div>`;
            });
        })
        .catch(err => {
            hideLoading();
            console.error(err);
            showError("Failed to load weather data.");
        });
}


function convertTemperature(tempC) {
    return convertor.value === "°F"
        ? `${Math.round((tempC * 9) / 5 + 32)}°F`
        : `${Math.round(tempC)}°C`;
}

function updateTemperatureDisplay() {
    temperature.innerHTML = convertTemperature(currentTempCelsius);
}


convertor.addEventListener("change", updateTemperatureDisplay);

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                findUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                alert("Error getting location: " + error.message);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

currentLocationButton.addEventListener("click", getCurrentLocation);
document.addEventListener("DOMContentLoaded", updateRecentSearchDropdown);
