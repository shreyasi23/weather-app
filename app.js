// constants
const API_KEY = "75122a74c0204989a3e23948260408";
const WEATHER_API = `http://api.weatherapi.com/v1`;
const nonLetterCharRegex = /[^a-zA-Z]/;

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

const getUserInput = () => {
  const userInput = document.querySelector(".search-input");
  const city = userInput.value.toLowerCase();
  if (city.length === 0 || nonLetterCharRegex.test(city)) {
    throw new Error("Enter a valid city name");
    return;
  }
  return city;
};

const setProp = (element, prop, value, elemName) => {
  // debugger;
  if (!element) {
    console.error(`Required element ${elemName} was not found`);
    return;
  }

  element[prop] = value;
};

const getCurrentWeather = async () => {
  let city, data;

  // get user input
  try {
    city = getUserInput();
  } catch (e) {
    alert(e.message);
    return;
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
    `${data.current.temp_c}\u00B0C`,
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
    `Feels like ${data.current.feelslike_c}\u00B0C`,
    "feels like",
  );
};

const getWeatherForecastOneDay = async (index) => {
  let data, city;
  try {
    city = getUserInput();
  } catch (e) {
    alert(e.message);
    return;
  }

  try {
    data = await getData(city);
  } catch (e) {
    console.error(e.message);
    return;
  }

  const hours = data.forecast.forecastday[index].hour;
  const cards = hours.map((hour, i) => {
    const dateTime = hour.time;
    // adding T to make time according to format which JS Date parser understands. (2026-08-11T08:00) ISO style date-time
    const date = new Date(dateTime.replace(" ", "T"));
    const convertedTime = date
      .toLocaleTimeString("en-us", {
        hour: "numeric",
        hour12: true,
      })
      .toLowerCase();

    const weatherIcon = hour.condition.icon;

    const temp = hour.temp_c;
    const listItem = document.createElement("li");
    listItem.setAttribute("class", "forecast-card");
    // listItem.setAttribute("id", "abc");
    const forecastCardMkp = `
  <li class="forecast-card" id="ABC">
    <p id="time">${convertedTime}</p>
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
};

const main = () => {
  let searchBtn;
  searchBtn = document.querySelector(".search-btn");
  if (!searchBtn) {
    console.log("Search button not found");
    return;
  }
  searchBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    await getCurrentWeather();
    await getWeatherForecastOneDay(0);
  });
};

main();
