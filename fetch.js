/**
 * WEATHER APP CONFIGURATION
 */
const CONFIG = {
  API_KEY: "6823f4f12963c3176fc898f68b73dd3d",
  BASE_URL: "https://api.openweathermap.org/data/2.5/weather",
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

function getCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CACHE_TTL;

    if (isExpired) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(data) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    console.warn("Cache save failed");
  }
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
  const icons = {
    Clouds: "./img/cloud.png",
    Clear: "./img/clear.png",
    Rain: "./img/rain.png",
    Drizzle: "./img/drizzle.png",
    Mist: "./img/mist.png",
    Snow: "./img/snow.png",
  };

  const newSrc = icons[status] || icons["Clouds"];
  UI.weatherIcon.src = newSrc;
  if (UI.favicon) UI.favicon.href = newSrc;
}
async function fetchWeatherData(params) {
  // Check cache first
  const cachedData = getCache();
  if (cachedData) {
    console.log("Using cached data");
    updateUI(cachedData);
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
    setCache(data); // Save to cache
    const duration = Date.now() - startTime;
    const delay = Math.max(0, CONFIG.MIN_LOADING_TIME - duration);

    setTimeout(() => {
      UI.loadingSpinner.style.display = "none";
      UI.searchBtn.disabled = false;
      updateUI(data);
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
