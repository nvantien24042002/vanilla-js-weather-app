/**
 * WEATHER APP CONFIGURATION
 */
const CONFIG = {
  API_KEY: "6823f4f12963c3176fc898f68b73dd3d",
  BASE_URL: "https://api.openweathermap.org/data/2.5/weather",
  UNITS: "metric",
  LANG: "vi",
  MIN_LOADING_TIME: 600, // Thời gian xoay loading tối thiểu (ms)
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
 * 1. HÀM CẬP NHẬT GIAO DIỆN
 */
function updateUI(data) {
  // Hiệu ứng Fade-in nội dung
  UI.weatherBox.style.opacity = "1";
  UI.weatherBox.style.transform = "translateY(0)";

  document.querySelector(".city").innerHTML = data.name;
  document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
  document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
  document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
  document.querySelector(".description").innerHTML =
    data.weather[0].description;

  // Bản đồ Icon thời tiết
  const status = data.weather[0].main;
  const icons = {
    Clouds: "https://cdn-icons-png.flaticon.com/512/4804/4804275.png",
    Clear: "https://cdn-icons-png.flaticon.com/512/4814/4814268.png",
    Rain: "https://cdn-icons-png.flaticon.com/512/1146/1146858.png",
    Drizzle: "https://cdn-icons-png.flaticon.com/512/3076/3076129.png",
    Mist: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
    Snow: "https://cdn-icons-png.flaticon.com/512/2315/2315309.png",
  };

  const newSrc = icons[status] || icons["Clouds"];
  UI.weatherIcon.src = newSrc;
  if (UI.favicon) UI.favicon.href = newSrc;
}

/**
 * 2. HÀM GỌI API CHÍNH
 */
async function fetchWeatherData(params) {
  const startTime = Date.now();

  // Trạng thái Loading
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

    // Đảm bảo loading xoay ít nhất một khoảng thời gian cho mượt
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

/**
 * 3. HÀM TIỆN ÍCH
 */
function setBackgroundTheme() {
  const hour = new Date().getHours();
  document.body.className = hour >= 6 && hour < 18 ? "day" : "night";
}

/**
 * 4. SỰ KIỆN & KHỞI CHẠY
 */

// Tìm kiếm theo tên thành phố
const handleSearch = () => {
  const city = UI.searchInput.value.trim();
  if (city) fetchWeatherData({ q: city });
};

UI.searchBtn.addEventListener("click", handleSearch);
UI.searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

// Tự động chạy khi mở trang
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
        // Nếu từ chối vị trí, mặc định lấy Hà Nội
        fetchWeatherData({ q: "Hanoi" });
      },
    );
  } else {
    fetchWeatherData({ q: "Hanoi" });
  }
});
// Tự động cập nhật năm cho Copyright
document.getElementById("year").innerText = new Date().getFullYear();
