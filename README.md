# Vanilla JS Weather App

A simple, fast weather application built with **vanilla JavaScript, HTML, and CSS**. No frameworks, no dependencies—just pure web technologies.

🌐 **Live Demo:** https://nvantien24042002.github.io/vanilla-js-weather-app

## 🚀 Features

- **Real-time Weather Updates** - Get current weather based on city name
- **Geolocation Support** - Automatically detect your location (with permission)
- **Day/Night Theme** - Dynamic background changes based on time of day
- **Smart Caching** - Reduces API calls with 10-minute localStorage cache
- **Local Icons** - All weather icons stored locally (no CDN dependency)
- **5-Day Forecast** - Displays a short forecast for the next days
- **Responsive Design** - Works on mobile, tablet, and desktop
- **No Framework** - Built entirely with vanilla JS (ES6+), HTML5, CSS3
- **Error Handling** - Clear error messages for failed searches

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Gradients, animations, responsive layout
- **Vanilla JavaScript (ES6+)** - No dependencies
- **OpenWeatherMap API** - Real-time weather data
- **localStorage** - Client-side caching

## 📦 Installation

### Clone & Setup

```bash
# Clone the repository
git clone https://github.com/nvantien24042002/vanilla-js-weather-app.git
cd vanilla-js-weather-app

# Open in browser (if using Live Server in VS Code)
# OR
# Simply open index.html with any web server
```

### Using Live Server (VS Code)

1. Install the "Live Server" extension
2. Right-click `index.html`
3. Click "Open with Live Server"

### Using Python

```bash
# Python 3.x
python -m http.server 8000

# OR Python 2.x
python -m SimpleHTTPServer 8000
```

Then visit `http://localhost:8000`

## 🔑 API Setup

This app uses **OpenWeatherMap API**, which is already configured with a test key. To use your own API key:

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. In `fetch.js`, replace:

```javascript
const CONFIG = {
  API_KEY: "YOUR_API_KEY_HERE", // Replace with your key
  // ...
};
```

## 💡 How It Works

1. **Search by City** - Type a city name and hit Enter or click the search button
2. **Auto-Detect Location** - Allows browser geolocation on first load
3. **Smart Caching** - Results cached for 10 minutes to reduce API calls
4. **Theme Switching** - Background changes based on current hour (6 AM - 6 PM is day, else night)
5. **Live Updates** - Real-time temperature, humidity, wind speed, and weather description

### Cache Behavior

- ✅ First search: Fetches from API and caches result
- ⚡ Subsequent searches within 10 min: Uses cached data (instant)
- 🔄 After 10 min: Fetches fresh data from API

## 📸 Screenshots

[Add screenshots here]

## 🔒 Security Notes

- ⚠️ API key is visible in code (for demo purposes only)
- In production, use a backend proxy to hide the API key
- Never commit real API keys to public repositories

## 🚀 Future Improvements

- [ ] 5-day forecast display
- [ ] Multi-language support
- [ ] Favorites/bookmarks feature
- [ ] Dark mode toggle
- [ ] Unit conversion (°C / °F, km/h / mph)
- [ ] PWA support for offline mode
- [ ] Improved error boundary handling

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

## 📄 License

This project is open source and available under the MIT License.

## 📧 Contact

Made by **Nguyen Van Tien** with **ChatGPT**

- GitHub: [nvantien24042002](https://github.com/nvantien24042002)
- 📧 Email: nguyenvantienthuanan12b3@gmail.com

---

⭐ **If you find this useful, please give it a star!**
