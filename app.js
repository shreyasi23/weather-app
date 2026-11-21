import { weatherCodes } from "./weatherCodes.js";

// constants
const API_KEY = "weather_api_key";
const BASE_URL = `http://api.weatherapi.com/v1`;
const nonLetterCharRegex = /[^a-zA-Z ]/;
const loadingText = document.querySelector("#loadingText");

/**
 * Get the name of the city from search input and return it only if the input is
 * non-empty string and has no numbers and special characters
 * @returns name of the city
 */
const getUserInput = () => {
  const userInput = document.querySelector(".search-input");
  const city = userInput.value.toLowerCase().trim();
  if (city.length === 0 || nonLetterCharRegex.test(city)) {
    throw new Error("Enter a valid city name");
  }
  return city;
};

/**
 * Fetches weather forecast data for a specified city.
 *
 * Makes an API request to retrieve a 3-day forecast, including
 * current weather conditions and hourly forecasts for each day.
 *
 * @param {string} city - The name of the city for which weather data is requested.
 * @returns {Promise<Object>} A promise that resolves to the weather data returned by the API.
 * @throws {Error} If the network request fails or the API returns an unsuccessful response.
 */
const getData = async (city) => {
  const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=3`;
  let response;
  try {
    response = await fetch(url);
  } catch (e) {
    throw new Error("Network error");
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error.message || `HTTP Error, ${response.status}`,
    );
  }

  return response.json();
};

/**
 * Collects and organizes hourly weather forecast data for the next three days.
 *
 * Extracts hourly weather information from the API response and organizes it
 * by weekday. Each hourly forecast entry contains a unique ID, time, weather
 * icon URL, and temperature in Celsius. The current hour is labeled as "Now"
 * for the current day.
 *
 * @param {string} firstDay - The weekday name of the current day (e.g., "Monday").
 * @param {Object} weatherData - The weather data returned by the API.
 * @returns {Object} An object containing hourly forecast data grouped by weekday.
 */

const collectWeatherForecastData = (firstDay, weatherData) => {
  const forecastDay = weatherData.forecast.forecastday;
  const hourlyForecast = {};
  forecastDay.forEach((day) => {
    const weekday = new Date(day.date + "T00:00:00").toLocaleDateString(
      "en-US",
      { weekday: "long" },
    );

    const arr = [];
    day.hour.forEach((item) => {
      let time;
      const data = {};
      const dateTime = item.time;
      const date = new Date(dateTime.replace(" ", "T"));
      const now = new Date();
      if (weekday === firstDay) {
        if (now.getHours() === date.getHours()) {
          time = "Now";
        }
      }

      if (!time) {
        time = date
          .toLocaleTimeString("en-US", { hour: "numeric", hour12: true })
          .toLowerCase();
      }

      data["id"] = item.time_epoch;
      data["time"] = time;
      data["weatherIcon"] = item.condition.icon;
      data["temp"] = Math.round(item.temp_c);

      arr.push(data);
    });

    hourlyForecast[weekday] = arr;
  });
  return hourlyForecast;
};

/**
 * function to assign a value to a property of an element
 * @param {*} element DOM node
 * @param {*} prop name of the property
 * @param {*} value value to be assigned to the property
 * @param {*} elemName name of the element
 */
const setProp = (element, prop, value, elemName) => {
  if (!element) {
    console.error(`Required element ${elemName} was not found`);
    return;
  }

  element[prop] = value;
};

/**
 * Render the current weather for a given city
 */
const renderCurrentWeather = (weatherData) => {
  const location = document.querySelector("#location");
  setProp(
    location,
    "textContent",
    `${weatherData.location.name}, ${weatherData.location.region}`,
    "location",
  );

  const currentTemp = document.querySelector("#currentTemp");
  setProp(
    currentTemp,
    "textContent",
    `${Math.round(weatherData.current.temp_c)}\u00B0C`,
    "currentTemp",
  );

  const currentTempImg = document.querySelector(".current-weather-img");
  setProp(
    currentTempImg,
    "src",
    `https:${weatherData.current.condition.icon}`,
    "currentTempImg",
  );

  const weatherCondition = document.querySelector("#weather");
  setProp(
    weatherCondition,
    "textContent",
    weatherData.current.condition.text,
    "weatherCondition",
  );

  const precipitation = document.querySelector("#precipitation");
  setProp(
    precipitation,
    "textContent",
    `Precip: ${weatherData.current.precip_mm} mm`,
    "precipitation",
  );

  const humidity = document.querySelector("#humidity");
  setProp(
    humidity,
    "textContent",
    `Humidity: ${weatherData.current.humidity}%`,
    "humidity",
  );

  const windSpeed = document.querySelector("#windSpeed");
  setProp(
    windSpeed,
    "textContent",
    `Wind speed: ${weatherData.current.wind_kph} Kph`,
    "windSpeed",
  );

  const feelsLikeText = document.querySelector("#feelsLike");
  setProp(
    feelsLikeText,
    "textContent",
    `Feels like ${Math.round(weatherData.current.feelslike_c)}\u00B0C`,
    "feelsLikeText",
  );
};

/**
 * Renders the hourly weather forecast for a specified day.
 *
 * Generates forecast cards using the provided hourly forecast data and
 * inserts them into the forecast list. If the current hour is available,
 * its card is highlighted and automatically scrolled into view.
 *
 * @param {string} day - The weekday for which the hourly forecast is to be rendered (e.g., "Monday").
 * @param {Object} hourlyForecast - An object containing hourly forecast data grouped by weekday.
 * @returns {void}
 */
const renderHourlyForecast = (day, hourlyForecast) => {
  const data = hourlyForecast[day];

  const cards = data.map((item) => {
    const forecastCardMkp = `
  <li class="forecast-card ${item.time === "Now" ? "current-hour" : ""}" id="${item.id}">
    <p id="time-${item.id}">${item.time}</p>
    <img id="weather-img-${item.id}" alt="weather image" src="https:${item.weatherIcon}">
    <p id="temp-${item.id}">${item.temp}\u00B0C</p>
  </li>
  `;
    return forecastCardMkp;
  });

  const forecastList = document.querySelector("#forecastToday");
  if (!forecastList) {
    console.error("Element Forecast list not found");
    const weatherData = document.querySelector(".weather-data");
    weatherData.insertAdjacentHTML("beforeend", `<p>Data not found</p>`);
    return;
  }

  forecastList.innerHTML = cards.join("\n");
  const currentHourItem = document.querySelector(".current-hour");
  // used console logs for debugging scroll issue
  /*console.log("current hour item: ", currentHourItem);
  console.log("forecast list: ", forecastList);
  console.log("current hour item offset: ", currentHourItem.offsetLeft);
  console.log("list scroll left: ", forecastList.scrollLeft);
  console.log("list width: ", forecastList.clientWidth);
  console.log("list scroll width: ", forecastList.scrollWidth);*/
  if (currentHourItem) {
    currentHourItem.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }
};

/**
 * Renders day tabs for the current day and the following two days.
 *
 * Extracts the forecast dates from the API response and converts them
 * into weekday names to be displayed as tab labels.
 *
 * @param {Object} weatherData - The weather data returned by the API.
 * @returns {void}
 */
const renderDayTabs = (weatherData) => {
  // get the date strings and convert them into week day strings
  const dates = weatherData.forecast.forecastday.map((item) => item.date);
  const days = dates.map((date) => {
    const day = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
    });
    return day;
  });

  // create list items to render week days as tabs
  const tabsList = document.querySelector(".nav.nav-underline");
  if (!tabsList) {
    throw new Error("tabs list not found");
  }

  const tabs = days.map((day, i) => {
    return `
    <li class="nav-item">
      <a class="nav-link ${i === 0 ? "active" : ""}" aria-current="page" href="#" id="${day}">${day}</a>
    </li>
    `;
  });

  tabsList.innerHTML = tabs.join("\n");
};

/**
 * Sets the page background based on the current weather conditions.
 *
 * Determines whether it is day or night and applies the corresponding CSS
 * class to the page content. During the day, the CSS class is determined
 * by the current weather condition code.
 *
 * @param {Object} weatherData - The weather data returned by the API.
 * @returns {void}
 */
const setBackgroundColor = (weatherData) => {
  // const data = WEATHER_DATA;
  const pageContent = document.querySelector(".page-content");
  if (!pageContent) {
    console.error("page content not found");
    return;
  }

  const isDay = weatherData.current.is_day === 1;
  if (!isDay) {
    pageContent.classList = "page-content night";
    return;
  }

  const code = weatherData.current.condition.code;
  const weather = weatherCodes[code];
  pageContent.classList = `page-content ${weather}`;
};

/**
 * Fetches and renders weather data for the specified city.
 *
 * Retrieves weather data from the API, renders the forecast day tabs,
 * updates the page background based on current weather conditions,
 * and displays the current weather and hourly forecast for the first day.
 * Hides the loading indicator after the rendering process completes.
 *
 * @param {string} [city] - The name of the city to fetch weather data for.
 * If omitted, the city is obtained from the user's input.
 * @returns {Promise<Object>} A promise that resolves to the hourly forecast
 * data grouped by weekday.
 * @throws {Error} If fetching weather data or rendering the day tabs fails.
 */
const renderWeatherData = async (city) => {
  let weatherData, hourlyForecast;
  loadingText.hidden = false;
  try {
    if (!city) {
      city = getUserInput();
    }
    weatherData = await getData(city);
  } catch (e) {
    alert(e.message);
    loadingText.hidden = true;
    throw e;
  }

  try {
    renderDayTabs(weatherData);
  } catch (e) {
    console.error(e.message);
    loadingText.hidden = true;
    throw e; // propagate the original error
  }

  try {
    const firstTab = document.querySelector(".nav-item .nav-link");
    const firstDay = firstTab.innerText.trim();
    setBackgroundColor(weatherData);
    hourlyForecast = collectWeatherForecastData(firstDay, weatherData);
    renderCurrentWeather(weatherData);
    renderHourlyForecast(firstDay, hourlyForecast);
  } finally {
    loadingText.hidden = true;
  }
  return hourlyForecast;
};

// main function
const main = async () => {
  let searchBtn, hourlyForecast;
  try {
    hourlyForecast = await renderWeatherData("Hyderabad");
  } catch (e) {
    return;
  }

  searchBtn = document.querySelector(".search-btn");
  if (!searchBtn) {
    console.log("Search button not found");
    return;
  }
  searchBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      hourlyForecast = await renderWeatherData();
    } catch (e) {
      return;
    }
  });

  const tab = document.querySelector("ul.nav.nav-underline");

  tab.addEventListener("click", (e) => {
    if (e.target.tagName.toLowerCase() !== "a") {
      return;
    }

    const activeTab = document.querySelector(
      ".weather-forecast .nav.nav-underline .nav-link.active",
    );

    if (!activeTab) {
      console.error("active tab not found");
    } else {
      activeTab.classList.remove("active");
    }

    const tabID = e.target.id.trim();
    e.target.classList.add("active");
    renderHourlyForecast(tabID, hourlyForecast);
  });
};

main();
