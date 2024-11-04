require('dotenv').config();

const API_KEY = process.env.WEATHER_API_KEY;
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const suggestionsContainer = document.getElementById("suggestions-container");
const cityName = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");

let timeoutId;
const debounce = (func, delay) => {
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

// Function to fetch city suggestions
async function fetchCitySuggestions(query) {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}

// Function to display suggestions
function displaySuggestions(suggestions) {
  suggestionsContainer.innerHTML = "";

  if (suggestions.length > 0) {
    suggestions.forEach((city) => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.textContent = `${city.name}, ${city.country}`;

      div.addEventListener("click", () => {
        cityInput.value = city.name;
        suggestionsContainer.style.display = "none";
        getWeather(city.name);
      });

      suggestionsContainer.appendChild(div);
    });
    suggestionsContainer.style.display = "block";
  } else {
    suggestionsContainer.style.display = "none";
  }
}

// Handle input changes with debounce
const handleInput = debounce(async (event) => {
  const query = event.target.value.trim();

  if (query.length >= 2) {
    const suggestions = await fetchCitySuggestions(query);
    displaySuggestions(suggestions);
  } else {
    suggestionsContainer.style.display = "none";
  }
}, 300);

// Add event listeners
cityInput.addEventListener("input", handleInput);

// Close suggestions when clicking outside
document.addEventListener("click", (event) => {
  if (!event.target.closest(".search-container")) {
    suggestionsContainer.style.display = "none";
  }
});

// Handle keyboard navigation
cityInput.addEventListener("keydown", (event) => {
  const suggestions =
    suggestionsContainer.getElementsByClassName("suggestion-item");
  let currentFocus = -1;

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();

    // Change focus
    currentFocus = Array.from(suggestions).findIndex(
      (item) => item === document.activeElement,
    );

    if (event.key === "ArrowDown") {
      currentFocus =
        currentFocus < suggestions.length - 1 ? currentFocus + 1 : 0;
    } else {
      currentFocus =
        currentFocus > 0 ? currentFocus - 1 : suggestions.length - 1;
    }

    suggestions[currentFocus].focus();
  }

  if (event.key === "Enter") {
    event.preventDefault();
    if (document.activeElement.classList.contains("suggestion-item")) {
      document.activeElement.click();
    } else {
      const city = cityInput.value;
      if (city) {
        getWeather(city);
        suggestionsContainer.style.display = "none";
      }
    }
  }
});

async function getWeather(city) {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`,
    );
    const data = await response.json();

    cityName.textContent = `${data.location.name}, ${data.location.country}`;
    weatherIcon.src = `https:${data.current.condition.icon}`;
    temperature.textContent = `${data.current.temp_c}°C`;
    description.textContent = data.current.condition.text;
    humidity.textContent = `Luftfeuchtigkeit: ${data.current.humidity}%`;
    windSpeed.textContent = `Windgeschwindigkeit: ${data.current.wind_kph} km/h`;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    cityName.textContent = "Stadt nicht gefunden";
  }
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value;
  if (city) {
    getWeather(city);
    suggestionsContainer.style.display = "none";
  }
});

// Initial weather data for a default city
getWeather("Munich");
