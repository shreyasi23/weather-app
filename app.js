// import { weatherCodes } from "./weatherCodes";

// constants
const API_KEY = "weather_api_key";
const BASE_URL = `http://api.weatherapi.com/v1`;
const nonLetterCharRegex = /[^a-zA-Z ]/;
const loadingText = document.querySelector("#loadingText");
const weatherCodes = {
  1000: "sunny",
  1003: "cloudy",
  1006: "cloudy",
  1009: "cloudy",
  1012: "cloudy",
  1015: "cloudy",
  1018: "cloudy",
  1021: "cloudy",
  1024: "cloudy",
  1027: "cloudy",
  1030: "cloudy",
  1033: "cloudy",
  1036: "cloudy",
  1039: "cloudy",
  1042: "cloudy",
  1045: "cloudy",
  1048: "cloudy",
  1063: "rainy",
  1066: "snow",
  1069: "snow",
  1072: "snow",
  1087: "rainy",
  1114: "snow",
  1135: "snow",
  1147: "snow",
  1117: "snow",
  1050: "rainy",
  1153: "rainy",
  1168: "snow",
  1171: "snow",
  1180: "rainy",
  1183: "rainy",
  1186: "rainy",
  1153: "rainy",
  1189: "rainy",
  1192: "rainy",
  1195: "rainy",
  1198: "rainy",
  1201: "rainy",
  1204: "snow",
  1207: "snow",
  1210: "snow",
  1213: "snow",
  1216: "snow",
  1219: "snow",
  1222: "snow",
  1204: "snow",
  1225: "snow",
  1237: "snow",
  1204: "snow",
  1240: "rainy",
  1243: "rainy",
  1246: "rainy",
  1249: "rainy",
  1252: "snow",
  1255: "snow",
  1258: "snow",
  1261: "snow",
  1264: "snow",
  1273: "rainy",
  1276: "rainy",
  1249: "rainy",
  1279: "snow",
  1282: "snow",
};

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

/** getData function fetches weather data
 * @param city - name of the city for which weather data is requested
 * @param requirment - type of weather information to be fetched. It takes two values current and forecast.
 * current fetches the weather at the point of time when the request is made and forecast fetches weather for 3 days and each hour of the day
 * @returns weather data in JSON format
 **/
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
 * Collect the hourly weather forecast data for today, tomorrow and day after tomorrow
 * @param {*} firstDay current day of the week
 */
const collectWeatherForecastData = (firstDay, weatherData) => {
  const forecastDay = weatherData.forecast.forecastday;
  HOURLY_FORECAST = {};
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

    HOURLY_FORECAST[weekday] = arr;
  });
  return HOURLY_FORECAST;
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
  // const data = WEATHER_DATA;

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
 * Renders one day's hourly weather forecast for the searched city
 * @param {*} day day of the week
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
 * render tabs with name of the present, tomorrow and day after tomorrow days
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

// set background color
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

// function to render weather data
const renderWeatherData = async (city) => {
  let weatherData;
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
    const hourlyForecast = collectWeatherForecastData(firstDay, weatherData);
    renderCurrentWeather(weatherData);
    renderHourlyForecast(firstDay, hourlyForecast);
  } finally {
    loadingText.hidden = true;
  }
};

// main function
const main = async () => {
  let searchBtn;

  try {
    await renderWeatherData("Hyderabad");
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
      await renderWeatherData();
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
    renderHourlyForecast(tabID);
  });
};

main();
