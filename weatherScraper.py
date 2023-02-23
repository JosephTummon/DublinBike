# Necessary Modules
import requests, json

API_KEY = "d5de0b0a9c3cc6473da7d0005b3798ac"

base_url = "http://api.openweathermap.org/data/2.5/weather?"

# Specifying for Dublin
city_name = "Dublin"

# complete_url 
complete_url = base_url + "appid=" + API_KEY + "&q=" + city_name

# Get request
response = requests.get(complete_url)

x = response.json()


if x["cod"] != "404":
 
    # store the value of "main"
    # key in variable y
    y = x["main"]
    # store the value corresponding
    # to the "temp" key of y
    current_temperature = y["temp"]
 
    # store the value corresponding
    # to the "pressure" key of y
    current_pressure = y["pressure"]
 
    # store the value corresponding
    # to the "humidity" key of y
    current_humidity = y["humidity"]
 
    # store the value of "weather"
    # key in variable z
    z = x["weather"]
 
    # store the value corresponding
    # to the "description" key at
    # the 0th index of z
    weather_description = z[0]["description"]
 
    # print following values
    print(" Temperature (in kelvin unit) = " +
                    str(current_temperature) +
          "\n atmospheric pressure (in hPa unit) = " +
                    str(current_pressure) +
          "\n humidity (in percentage) = " +
                    str(current_humidity) +
          "\n description = " +
                    str(weather_description))
 
else:
    print(" City Not Found ")

