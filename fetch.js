/**
 * WEATHER APP CONFIGURATION
 */
const CONFIG = {
  API_KEY: "6823f4f12963c3176fc898f68b73dd3d",
  BASE_URL: "https://api.openweathermap.org/data/2.5/weather",
  FORECAST_URL: "https://api.openweathermap.org/data/2.5/forecast",
  UNITS: "metric",
  LANG: "vi",
  MIN_LOADING_TIME: 400, // Thời gian xoay loading tối thiểu (ms)
};

const UI = {
  searchInput: document.querySelector(".search input"),
  searchBtn: document.querySelector(".search button"),
  weatherBox: document.querySelector(".weather"),
  loadingSpinner: document.querySelector(".loading"),
  weatherIcon: document.querySelector(".weather-icon"),
  favicon: document.querySelector("link[rel~='icon']"),
};

/**
 * CACHE CONFIGURATION
 */
const CACHE_KEY = "weather_cache";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function makeCacheKey(params) {
  if (params.q) {
    return `q:${params.q.trim().toLowerCase()}`;
  }
  if (params.lat != null && params.lon != null) {
    return `coords:${params.lat.toFixed(4)},${params.lon.toFixed(4)}`;
  }
  return JSON.stringify(params);
}

function getCache(params) {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    const key = makeCacheKey(params);
    const entry = cached[key];
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > CACHE_TTL;
    if (isExpired) {
      delete cached[key];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

function setCache(params, data) {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    cached[makeCacheKey(params)] = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch {
    console.warn("Cache save failed");
  }
}

function getIconPath(status) {
  const icons = {
    Clouds: "./img/cloud.png",
    Clear: "./img/clear.png",
    Rain: "./img/rain.png",
    Drizzle: "./img/drizzle.png",
    Mist: "./img/mist.png",
    Snow: "./img/snow.png",
  };

  return icons[status] || icons.Clouds;
}

/**
 * 1. HÀM CẬP NHẬT GIAO DIỆN
 */
function updateUI(data) {
  UI.weatherBox.style.opacity = "1";
  UI.weatherBox.style.transform = "translateY(0)";

  document.querySelector(".city").innerHTML = data.name;
  document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
  document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
  document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
  document.querySelector(".description").innerHTML =
    data.weather[0].description;

  const status = data.weather[0].main;
  const newSrc = getIconPath(status);
  UI.weatherIcon.src = newSrc;
  if (UI.favicon) UI.favicon.href = newSrc;
}

function getDailyForecast(forecast) {
  const days = [];
  const seenDates = new Set();

  for (const item of forecast.list) {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toISOString().split("T")[0];
    const hour = date.getHours();

    if (hour === 12 && !seenDates.has(dateKey)) {
      seenDates.add(dateKey);
      days.push(item);
    }

    if (days.length >= 5) break;
  }

  if (days.length < 5) {
    const fallback = [];
    const added = new Set();

    for (const item of forecast.list) {
      const dateKey = new Date(item.dt * 1000)
        .toISOString()
        .split("T")[0];
      if (!added.has(dateKey)) {
        added.add(dateKey);
        fallback.push(item);
      }
      if (fallback.length >= 5) break;
    }

    return fallback;
  }

  return days;
}

function updateForecast(forecast) {
  const forecastList = document.querySelector(".forecast-list");
  if (!forecastList) return;

  if (!forecast || !forecast.list) {
    forecastList.innerHTML =
      "<p class=\"forecast-empty\">Không có dữ liệu dự báo.</p>";
    return;
  }

  const dailyForecast = getDailyForecast(forecast);
  forecastList.innerHTML = dailyForecast
    .map((item) => {
      const date = new Date(item.dt * 1000);
      const dayLabel = date.toLocaleDateString("vi-VN", {
        weekday: "short",
      });
      const iconSrc = getIconPath(item.weather[0].main);
      return `
        <div class="forecast-item">
          <p class="day">${dayLabel}</p>
          <img src="${iconSrc}" alt="${item.weather[0].main}" />
          <p class="temp">${Math.round(item.main.temp)}°C</p>
          <p class="desc">${item.weather[0].description}</p>
        </div>
      `;
    })
    .join("");
}

async function fetchForecastData(params) {
  const queryParams = new URLSearchParams({
    ...params,
    appid: CONFIG.API_KEY,
    units: CONFIG.UNITS,
    lang: CONFIG.LANG,
  });

  const response = await fetch(`${CONFIG.FORECAST_URL}?${queryParams}`);
  if (!response.ok) {
    throw new Error("Không thể tải dữ liệu dự báo!");
  }

  return response.json();
}

async function fetchWeatherData(params) {
  const cachedData = getCache(params);
  if (cachedData) {
    console.log("Using cached data");
    updateUI(cachedData.current);
    updateForecast(cachedData.forecast);
    return;
  }

  const startTime = Date.now();

  // Status Loading
  UI.weatherBox.style.opacity = "0.3";
  UI.weatherBox.style.transform = "translateY(10px)";
  UI.loadingSpinner.style.display = "block";
  UI.searchBtn.disabled = true;

  try {
    const queryParams = new URLSearchParams({
      ...params,
      appid: CONFIG.API_KEY,
      units: CONFIG.UNITS,
      lang: CONFIG.LANG,
    });

    const response = await fetch(`${CONFIG.BASE_URL}?${queryParams}`);

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("API Key chưa sẵn sàng. Thử lại sau 30-60 phút!");
      if (response.status === 404) throw new Error("Không tìm thấy thành phố!");
      throw new Error("Đã có lỗi xảy ra!");
    }

    const data = await response.json();
    let forecast = null;

    try {
      forecast = await fetchForecastData(params);
    } catch (forecastError) {
      console.warn(forecastError);
    }

    setCache(params, { current: data, forecast });
    const duration = Date.now() - startTime;
    const delay = Math.max(0, CONFIG.MIN_LOADING_TIME - duration);

    setTimeout(() => {
      UI.loadingSpinner.style.display = "none";
      UI.searchBtn.disabled = false;
      updateUI(data);
      updateForecast(forecast);
    }, delay);
  } catch (error) {
    UI.loadingSpinner.style.display = "none";
    UI.searchBtn.disabled = false;
    UI.weatherBox.style.opacity = "1";
    alert(error.message);
  }
}


function setBackgroundTheme() {
  const hour = new Date().getHours();
  document.body.className = hour >= 6 && hour < 18 ? "day" : "night";
}


const handleSearch = () => {
  const city = UI.searchInput.value.trim();
  if (city) fetchWeatherData({ q: city });
};

UI.searchBtn.addEventListener("click", handleSearch);
UI.searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

window.addEventListener("load", () => {
  setBackgroundTheme();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherData({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {
        fetchWeatherData({ q: "Hue" });
      },
    );
  } else {
    fetchWeatherData({ q: "Hue" });
  }
});
document.getElementById("year").innerText = new Date().getFullYear();
