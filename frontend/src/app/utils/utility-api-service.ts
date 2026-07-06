/**
 * Utility API Service
 * Integrates IP Geolocation, TimeZoneDB, and Weather APIs
 * Currently in SIMULATION MODE for demonstration
 */

export interface GeolocationData {
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  currency: string;
  language: string;
}

export interface TimezoneData {
  timezone: string;
  offset: number; // in hours
  abbreviation: string;
  currentTime: string;
  isDST: boolean;
}

export interface WeatherCondition {
  temperature: number; // in Celsius
  feelsLike: number;
  humidity: number; // percentage
  pressure: number; // hPa
  windSpeed: number; // km/h
  description: string;
  icon: string;
  sunrise: string;
  sunset: string;
  uvIndex: number;
}

export interface AirQuality {
  aqi: number; // Air Quality Index
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm25: number;
  pm10: number;
  recommendations: string[];
}

class UtilityApiService {
  private cachedLocation: GeolocationData | null = null;
  
  // ============ IP GEOLOCATION API ============
  
  /**
   * Get user location from IP address
   * In production: Use IPGeolocation.io or similar service
   */
  async getLocationFromIP(): Promise<GeolocationData> {
    console.log('🌍 [IP Geolocation API - SIMULATION] Detecting location...');
    
    // Check cache first
    if (this.cachedLocation) {
      console.log('✅ Using cached location');
      return this.cachedLocation;
    }
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Simulated location data for Indian cities
    const indianCities = [
      {
        ip: '103.21.124.45',
        city: 'New Delhi',
        region: 'Delhi',
        country: 'India',
        countryCode: 'IN',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        language: 'Hindi, English',
      },
      {
        ip: '103.21.124.46',
        city: 'Mumbai',
        region: 'Maharashtra',
        country: 'India',
        countryCode: 'IN',
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        language: 'Marathi, Hindi, English',
      },
      {
        ip: '103.21.124.47',
        city: 'Bangalore',
        region: 'Karnataka',
        country: 'India',
        countryCode: 'IN',
        latitude: 12.9716,
        longitude: 77.5946,
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        language: 'Kannada, English',
      },
    ];
    
    const location = indianCities[Math.floor(Math.random() * indianCities.length)];
    this.cachedLocation = location;
    
    console.log('✅ [Geolocation] Location detected:', location.city);
    
    // In production:
    // const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}`);
    // const data = await response.json();
    
    return location;
  }

  /**
   * Get location by city name
   */
  async getLocationByCity(cityName: string): Promise<GeolocationData | null> {
    console.log('🔍 [Geolocation - SIMULATION] Searching for city:', cityName);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cities: { [key: string]: GeolocationData } = {
      'delhi': {
        ip: '103.21.124.45',
        city: 'New Delhi',
        region: 'Delhi',
        country: 'India',
        countryCode: 'IN',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        language: 'Hindi, English',
      },
      'mumbai': {
        ip: '103.21.124.46',
        city: 'Mumbai',
        region: 'Maharashtra',
        country: 'India',
        countryCode: 'IN',
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        language: 'Marathi, Hindi, English',
      },
    };
    
    const cityKey = cityName.toLowerCase();
    return cities[cityKey] || null;
  }

  // ============ TIMEZONEDB API ============
  
  /**
   * Get timezone information
   * In production: Use TimeZoneDB API
   */
  async getTimezoneInfo(location?: GeolocationData): Promise<TimezoneData> {
    console.log('🕐 [TimeZoneDB API - SIMULATION] Getting timezone info...');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const loc = location || await this.getLocationFromIP();
    
    // India Standard Time (IST)
    const timezoneData: TimezoneData = {
      timezone: loc.timezone,
      offset: 5.5, // UTC+5:30
      abbreviation: 'IST',
      currentTime: new Date().toLocaleString('en-IN', { timeZone: loc.timezone }),
      isDST: false, // India doesn't observe DST
    };
    
    console.log('✅ [TimeZoneDB] Timezone:', timezoneData.timezone);
    
    // In production:
    // const response = await fetch(
    //   `http://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=zone&zone=${timezone}`
    // );
    
    return timezoneData;
  }

  /**
   * Adjust time based on user's timezone
   */
  adjustTimeForTimezone(time: string, fromTimezone: string, toTimezone: string): string {
    console.log('⏰ [Timezone Adjustment - SIMULATION] Adjusting time...');
    
    // In simulation, just return the time as-is since India is in single timezone
    return time;
  }

  /**
   * Get best time for notifications based on timezone
   */
  getOptimalNotificationTimes(timezone: string): string[] {
    // Return times in local timezone
    return [
      '08:00', // Morning
      '13:00', // Afternoon
      '18:00', // Evening
      '21:00', // Night
    ];
  }

  // ============ WEATHER API ============
  
  /**
   * Get current weather conditions
   * In production: Use OpenWeatherMap API
   */
  async getCurrentWeather(location?: GeolocationData): Promise<WeatherCondition> {
    console.log('☀️ [Weather API - SIMULATION] Fetching weather data...');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const loc = location || await this.getLocationFromIP();
    
    // Simulate Indian weather conditions
    const temp = 20 + Math.floor(Math.random() * 20); // 20-40°C
    const humidity = 40 + Math.floor(Math.random() * 40); // 40-80%
    
    const conditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Hazy', 'Light Rain'];
    const description = conditions[Math.floor(Math.random() * conditions.length)];
    
    const weather: WeatherCondition = {
      temperature: temp,
      feelsLike: temp + (humidity > 70 ? 3 : -2),
      humidity,
      pressure: 1010 + Math.floor(Math.random() * 20),
      windSpeed: 5 + Math.floor(Math.random() * 15),
      description,
      icon: this.getWeatherIcon(description),
      sunrise: '06:15 AM',
      sunset: '06:45 PM',
      uvIndex: Math.floor(Math.random() * 11),
    };
    
    console.log('✅ [Weather] Temperature:', weather.temperature, '°C');
    
    // In production:
    // const response = await fetch(
    //   `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    // );
    
    return weather;
  }

  /**
   * Get weather forecast for next 7 days
   */
  async getWeatherForecast(location?: GeolocationData): Promise<WeatherCondition[]> {
    console.log('📅 [Weather Forecast - SIMULATION] Fetching 7-day forecast...');
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const forecast: WeatherCondition[] = [];
    const baseTemp = 25 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < 7; i++) {
      const temp = baseTemp + Math.floor(Math.random() * 10) - 5;
      forecast.push({
        temperature: temp,
        feelsLike: temp + 2,
        humidity: 50 + Math.floor(Math.random() * 30),
        pressure: 1010,
        windSpeed: 10,
        description: 'Partly Cloudy',
        icon: '⛅',
        sunrise: '06:15 AM',
        sunset: '06:45 PM',
        uvIndex: 6,
      });
    }
    
    return forecast;
  }

  /**
   * Get hydration recommendation based on weather
   */
  getHydrationRecommendation(weather: WeatherCondition): {
    baseWater: number; // liters
    multiplier: number;
    recommendation: string;
  } {
    const temp = weather.temperature;
    const humidity = weather.humidity;
    
    let multiplier = 1.0;
    let recommendation = 'Maintain normal hydration (2-3 liters/day)';
    
    if (temp > 35) {
      multiplier = 1.5;
      recommendation = 'Very hot! Increase water intake to 3-4 liters/day';
    } else if (temp > 30) {
      multiplier = 1.3;
      recommendation = 'Hot weather. Drink 2.5-3.5 liters/day';
    } else if (temp > 25) {
      multiplier = 1.1;
      recommendation = 'Warm weather. Stay hydrated with 2-3 liters/day';
    }
    
    if (humidity > 70) {
      multiplier += 0.2;
      recommendation += '. High humidity - drink more frequently';
    }
    
    return {
      baseWater: 2.5,
      multiplier,
      recommendation,
    };
  }

  /**
   * Get exercise recommendation based on weather
   */
  getExerciseRecommendation(weather: WeatherCondition): {
    outdoor: boolean;
    bestTime: string;
    precautions: string[];
  } {
    const temp = weather.temperature;
    const uvIndex = weather.uvIndex;
    
    let outdoor = true;
    let bestTime = 'Morning (6-8 AM) or Evening (5-7 PM)';
    const precautions: string[] = [];
    
    if (temp > 38) {
      outdoor = false;
      bestTime = 'Indoor exercise recommended';
      precautions.push('Temperature too high for outdoor exercise');
      precautions.push('Stay in air-conditioned environment');
    } else if (temp > 32) {
      bestTime = 'Early morning (before 8 AM) only';
      precautions.push('Avoid midday exercise');
      precautions.push('Wear light-colored, breathable clothing');
      precautions.push('Carry water bottle');
    }
    
    if (uvIndex > 7) {
      precautions.push('High UV - wear sunscreen');
      precautions.push('Wear sunglasses and cap');
    }
    
    if (weather.description.includes('Rain')) {
      outdoor = false;
      precautions.push('Rainy weather - prefer indoor activities');
    }
    
    return {
      outdoor,
      bestTime,
      precautions,
    };
  }

  // ============ AIR QUALITY API ============
  
  /**
   * Get air quality information
   * In production: Use AQI API or OpenWeatherMap Air Pollution API
   */
  async getAirQuality(location?: GeolocationData): Promise<AirQuality> {
    console.log('🌫️ [Air Quality API - SIMULATION] Fetching AQI data...');
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Simulate AQI (varies by Indian city)
    const aqi = 50 + Math.floor(Math.random() * 200); // 50-250 range
    
    let category: AirQuality['category'];
    const recommendations: string[] = [];
    
    if (aqi <= 50) {
      category = 'Good';
      recommendations.push('Air quality is good. Perfect for outdoor activities!');
    } else if (aqi <= 100) {
      category = 'Moderate';
      recommendations.push('Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exertion.');
    } else if (aqi <= 150) {
      category = 'Unhealthy for Sensitive Groups';
      recommendations.push('Children, elderly, and people with respiratory issues should limit outdoor activities.');
      recommendations.push('Consider wearing a mask outdoors.');
    } else if (aqi <= 200) {
      category = 'Unhealthy';
      recommendations.push('Everyone should limit prolonged outdoor exertion.');
      recommendations.push('Wear N95 mask if going outside.');
      recommendations.push('Keep windows closed.');
    } else if (aqi <= 300) {
      category = 'Very Unhealthy';
      recommendations.push('Avoid outdoor activities.');
      recommendations.push('Use air purifier indoors.');
      recommendations.push('Mandatory mask usage outside.');
    } else {
      category = 'Hazardous';
      recommendations.push('Stay indoors. Emergency conditions!');
      recommendations.push('Use air purifier on high setting.');
      recommendations.push('Avoid all outdoor activities.');
    }
    
    return {
      aqi,
      category,
      pm25: aqi * 0.4,
      pm10: aqi * 0.6,
      recommendations,
    };
  }

  // ============ HELPER METHODS ============
  
  private getWeatherIcon(description: string): string {
    const icons: { [key: string]: string } = {
      'Clear': '☀️',
      'Partly Cloudy': '⛅',
      'Cloudy': '☁️',
      'Hazy': '🌫️',
      'Light Rain': '🌧️',
      'Rain': '🌧️',
      'Heavy Rain': '⛈️',
      'Thunderstorm': '⛈️',
    };
    
    return icons[description] || '🌤️';
  }

  /**
   * Get user's local time
   */
  async getUserLocalTime(): Promise<string> {
    const timezone = await this.getTimezoneInfo();
    return timezone.currentTime;
  }

  /**
   * Check if it's a good time for outdoor activity
   */
  async isGoodTimeForOutdoorActivity(): Promise<{
    suitable: boolean;
    reason: string;
  }> {
    const weather = await this.getCurrentWeather();
    const airQuality = await this.getAirQuality();
    
    if (weather.temperature > 38) {
      return { suitable: false, reason: 'Temperature too high (>38°C)' };
    }
    
    if (airQuality.aqi > 150) {
      return { suitable: false, reason: `Poor air quality (AQI: ${airQuality.aqi})` };
    }
    
    if (weather.description.includes('Rain')) {
      return { suitable: false, reason: 'Rainy weather' };
    }
    
    const hour = new Date().getHours();
    if (hour >= 12 && hour <= 16) {
      return { suitable: false, reason: 'Midday heat - not recommended' };
    }
    
    return { suitable: true, reason: 'Good conditions for outdoor activity' };
  }

  /**
   * Clear cached location
   */
  clearLocationCache(): void {
    this.cachedLocation = null;
  }
}

export const utilityApiService = new UtilityApiService();
