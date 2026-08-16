// constants
const API_KEY = "75122a74c0204989a3e23948260408";
const WEATHER_API = `http://api.weatherapi.com/v1`;
const nonLetterCharRegex = /[^a-zA-Z]/;
const loadingText = document.querySelector("#loadingText");

/** getData function fetches weather data
 * @param city - name of the city for which weather data is requested
 * @param requirment - type of weather information to be fetched. It takes two values current and forecast.
 * current fetches the weather at the point of time when the request is made and forecast fetches weather for 3 days and each hour of the day
 * @returns weather data in JSON format
 **/
const getData = async (city) => {
  const nonLetterCharRegex = /[^a-zA-z]/;
  if (nonLetterCharRegex.test(city)) {
    alert("Enter a valid city name");
    return;
  }

  const url = `${WEATHER_API}/forecast.json?key=${API_KEY}&q=${city.trim()}&days=5`;
  let response;
  try {
    response = await fetch(url);
  } catch (e) {
    throw new Error("Netwrok error");
  }

  if (!response.ok) {
    throw new Error(`HTTP Error, ${response.status}`);
  }

  return response.json();
};

/**
 * Get the name of the city from search input and return it only if the input is
 * non-empty string and has no numbers and special characters
 * @returns name of the city
 */
const getUserInput = () => {
  const userInput = document.querySelector(".search-input");
  const city = userInput.value.toLowerCase();
  if (city.length === 0 || nonLetterCharRegex.test(city)) {
    throw new Error("Enter a valid city name");
    return;
  }
  return city;
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
const getCurrentWeather = async (city) => {
  let data;

  // get user input
  if (!city) {
    try {
      city = getUserInput();
    } catch (e) {
      alert(e.message);
      return;
    }
  }

  // get weather data
  try {
    data = await getData(city);
  } catch (e) {
    console.error(e.message);
    return;
  }

  const location = document.querySelector("#location");
  setProp(
    location,
    "textContent",
    `${data.location.name}, ${data.location.region}`,
    "location",
  );

  const currentTemp = document.querySelector("#currentTemp");
  setProp(
    currentTemp,
    "textContent",
    `${Math.round(data.current.temp_c)}\u00B0C`,
    "currentTemp",
  );

  const currentTempImg = document.querySelector(".current-weather-img");
  setProp(
    currentTempImg,
    "src",
    `https:${data.current.condition.icon}`,
    "currentTempImg",
  );

  const weatherCondition = document.querySelector("#weather");
  setProp(
    weatherCondition,
    "textContent",
    data.current.condition.text,
    "weatherCondition",
  );

  const preciptation = document.querySelector("#preciptation");
  setProp(
    preciptation,
    "textContent",
    `Precip: ${data.current.precip_mm} mm`,
    "precipitation",
  );

  const humidity = document.querySelector("#humidity");
  setProp(
    humidity,
    "textContent",
    `Humidity: ${data.current.humidity}%`,
    "humidity",
  );

  const windSpeed = document.querySelector("#windSpeed");
  setProp(
    windSpeed,
    "textContent",
    `Wind speed: ${data.current.wind_kph} Kph`,
    "windSpeed",
  );

  const feelsLikeText = document.querySelector("#feelsLike");
  setProp(
    feelsLikeText,
    "textContent",
    `Feels like ${Math.round(data.current.feelslike_c)}\u00B0C`,
    "feels like",
  );
};

/**
 * Renders one day's hourly weather forecast for the searched city
 * @param {*} index day of the week
 */
const getWeatherForecastOneDay = async (index, city) => {
  let data;
  if (!city) {
    try {
      city = getUserInput();
    } catch (e) {
      alert(e.message);
      return;
    }
  }

  try {
    data = await getData(city);
  } catch (e) {
    console.error(e.message);
    return;
  }

  const hours = data.forecast.forecastday[index].hour;
  const cards = hours.map((hour, i) => {
    let currentTime, convertedTime;
    const dateTime = hour.time;
    // adding T to make time according to format which JS Date
    // parser understands (2026-08-11T08:00) ISO style date-time
    const date = new Date(dateTime.replace(" ", "T"));
    const now = new Date();
    if (index === 0) {
      if (date.getHours() === now.getHours()) {
        currentTime = "Now";
      }
    }

    if (!currentTime) {
      convertedTime = date
        .toLocaleTimeString("en-us", {
          hour: "numeric",
          hour12: true,
        })
        .toLowerCase();
    }

    const weatherIcon = hour.condition.icon;

    const temp = Math.round(hour.temp_c);

    const id = hour.time_epoch;

    const listItem = document.createElement("li");
    listItem.setAttribute("class", "forecast-card");
    const forecastCardMkp = `
  <li class="forecast-card ${currentTime ? "current-hour" : ""}" id="${id}">
    <p id="time">${currentTime ? currentTime : convertedTime}</p>
    <img id="weather-img" alt="weather image" src="https:${weatherIcon}">
    <p id="temp">${temp}\u00B0C</p>
  </li>
  `;
    return forecastCardMkp;
  });

  const forecastList = document.querySelector("#forecastToday");
  if (!forecastList) {
    console.error("Element Forecast list not found");
    const weatherData = document.querySelector("weather-data");
    weatherData.insertAdjacentElement("beforeend", `<p>Data not found</p>`);
    return;
  }

  forecastList.innerHTML = cards.join("\n");
  const currentHourItem = document.querySelector(".current-hour");
  currentHourItem.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "start",
  });
};

/**
 * Render hourly weather forecast for next 2 days from the current day of the week
 * @param {*} day name of the week day
 */
const renderWeatherForecast = async (day) => {
  // get weather data for a random city, for example hyderabad
  // at this point we need the data only to get the array of weather forecast
  // which is used to determine the index of the day for which hourly forecast is to be rendered
  let data;
  try {
    data = await getData("hyderabad");
  } catch (e) {
    console.error(e.message);
    return;
  }

  // collect the date strings
  const dates = data.forecast.forecastday.map((item) => {
    return item.date;
  });

  // get the index of the day in the weather forecast array
  const index = dates.findIndex((date) => {
    const weekday = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
    });
    return weekday === day;
  });

  if (!index || index !== -1) {
    console.error("Requested day not found in data");
  }

  // render hourly forecast for the given day
  return await getWeatherForecastOneDay(index);
};

// get local date
const getDay = (date) => {
  const now = new Date();
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return today;
};

/**
 * render tabs with name of the present, tomorrow and day after tomorrow days
 */
const renderDayTabs = async () => {
  // get weather forecast data for 3 days from now
  let data;
  try {
    data = await getData("hyderabad");
  } catch (e) {
    console.error(e.message);
    return;
  }

  // get the date strings and convert them into week day strings
  const dates = data.forecast.forecastday.map((item) => item.date);
  const days = dates.map((date) => {
    const day = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
    });
    return day;
  });

  // create list items to render week days as tabs
  const tabsList = document.querySelector(".nav.nav-underline");
  if (!tabsList) {
    console.error("tabs list not found");
    return;
  }

  const tabs = days.map((day) => {
    return `
    <li class="nav-item">
      <a class="nav-link" aria-current="page" href="#" id="${day}">${day}</a>
    </li>
    `;
  });

  tabsList.innerHTML = tabs.join("\n");
};

// main function
const main = async () => {
  let searchBtn;

  await renderDayTabs();
  loadingText.hidden = false;
  await getCurrentWeather("Hyderabad");
  await getWeatherForecastOneDay(0, "Hyderabad");
  loadingText.hidden = true;

  searchBtn = document.querySelector(".search-btn");
  if (!searchBtn) {
    console.log("Search button not found");
    return;
  }
  searchBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    loadingText.hidden = false;
    await getCurrentWeather();
    await getWeatherForecastOneDay(0);
    loadingText.hidden = true;
  });

  const tabs = document.querySelectorAll("li a");

  for (let tab of tabs) {
    tab.addEventListener("click", async (event) => {
      const tabID = event.currentTarget.id;
      await renderWeatherForecast(tabID);
    });
  }
};

main();
