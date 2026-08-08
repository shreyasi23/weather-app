// constants
const API_KEY = "75122a74c0204989a3e23948260408";
const WEATHER_API = `http://api.weatherapi.com/v1`;

/** getData function fetches weather data
 * @param city - name of the city for which weather data is requested
 * @param requirment - type of weather information to be fetched. It takes two values current and forecast.
 * current fetches the weather at the point of time when the request is made and forecast fetches weather for 3 days and each hour of the day
 * @returns weather data in JSON format
 **/
const getData = async (city, requirment) => {
  const nonLetterCharRegex = /[^a-zA-z]/;
  if (nonLetterCharRegex.test(city)) {
    alert("Enter a valid city name");
    return;
  }

  const url = `${WEATHER_API}/${requirment}.json?key=${API_KEY}&q=${city.trim()}`;
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
  return userInput.value.toLowerCase();
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
  city = getUserInput();
  const nonLetterCharRegex = /[^a-zA-Z]/;
  if (city.length === 0 || nonLetterCharRegex.test(city)) {
    alert("Enter a valid city name");
    return;
  }

  // get weather data
  try {
    data = await getData(city, "current");
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
  });
};

main();
