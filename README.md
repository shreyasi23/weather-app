# Weather App

## About

A simple weather application that displays the current weather conditions and hourly weather forecasts for a searched city. It provides forecasts for the current day and the following two days.

## Features

- Search for a city to view its weather information.
- Display current weather conditions and hourly forecasts for three days.
- Handle invalid city names and search errors gracefully.
- Dynamically change the background colour based on the searched city's weather conditions.
- Highlight the current hour as **Now** in the hourly forecast for the present day.

## Technologies Used

- HTML
- CSS
- JavaScript
- [WeatherAPI.com](https://www.weatherapi.com/)

## Key Learnings

- **Closures:** Used closures to retain access to the hourly forecast data, which is prepared once per search and reused to render the forecast for all three days.
- **Event Delegation:** Used event delegation to handle tab clicks through a single event listener on the parent element. The tabs are dynamically rendered after each search to reflect the forecast days returned for the searched city.
- **JavaScript Modules:** Used ES modules to separate weather code data into `weatherCodes.js` and imported it into `app.js` using named exports.
- **Separation of Responsibilities:** Organised the code into functions with distinct responsibilities for fetching data, processing forecast information, rendering UI elements, and coordinating the application flow.
- **Error Handling:** Practised handling network errors, API errors, and invalid search inputs.

## Known Issues

- **Timezone Handling:** The current hour highlighted as **Now** is determined using the system's local timezone instead of the searched city's local timezone. Consequently, the highlighted hour may be incorrect for cities in different timezones. For example, when viewing New York's weather from India, the highlighted hour may not correspond to New York's current local time.

## Future Improvements

- Use the searched city's local timezone to determine and highlight the current hour accurately.
- Improve the application's responsiveness and user experience across different screen sizes.
