from flask import Flask, g, render_template, jsonify
from sqlalchemy import create_engine, text
import traceback
import functools
import requests
import time
import simplejson as json
from datetime import datetime
import pickle
import pandas as pd

# Database configuration
URI = "dbbikes2.cytgvbje9wgu.us-east-1.rds.amazonaws.com"
PORT = "3306"
DB = "dbbikes2"
USER = "admin"
PASSWORD = "DublinBikes1"

engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)

# opening pickle file with pretrained model
with open('MLModel/model.pkl', 'rb') as handle:
    model = pickle.load(handle)

# Initialize Flask app
app = Flask("__name__")

@app.route('/')
def home():
    return render_template('index.html')

##JCDeaux API Key
JCDEAUXAPI =  "https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=8ad0fc88de299d032d91bc99f1e01c34a44d39a0"

# Define the function to get availability data
@app.route("/stations")
@functools.lru_cache(maxsize=128)
def get_stations():
    try: 
        # Retrieve the data passed into the function and load it as a JSON object
        text = requests.get(JCDEAUXAPI).text
        stations = json.loads(text)
        # Loop through each station in the JSON object and extract the necessary values
        vals = []
        for station in stations:
            for i in range(1, 9):
                name = "prediction" + str(i)
                predictions = model.predict([[station.get('number'), 4, datetime.now().hour + i]]).tolist()[0]
                station[name] = int(predictions)
                name = "tomorrow" + str(i)
                predictions = model.predict([[station.get('number'), 5, datetime.now().hour + i]]).tolist()[0]
                station[name] = int(predictions)
                name =  "Sunday" + str(i)
                predictions = model.predict([[station.get('number'), 6, datetime.now().hour + i]]).tolist()[0]
                station[name] = int(predictions)

            vals.append((station.get('number'), station.get('available_bikes'), station.get('available_bike_stands'), station.get('status'), datetime.timestamp(datetime.now()), predictions))
        #print('#found {} Availability {}'.format(len(vals), vals))
    
        return stations
    except Exception as e:
        print(traceback.format_exc())
        return "Error in get_stations: " + str(e), 404


##Weather API Key
WEATHERAPI = "http://api.openweathermap.org/data/2.5/weather?appid=d5de0b0a9c3cc6473da7d0005b3798ac&q=Dublin, IE"

# Define a new app route to get the weather data
@app.route("/averages/<int:number>")
def get_averages(number):
    try:
        sql = text("""SELECT s.address, AVG(a.available_bike_stands) AS Avg_bike_stands,
                AVG(a.available_bikes) AS Avg_bikes_free, 
                DATE_FORMAT(FROM_UNIXTIME(a.datetime), '%a') AS day_of_week FROM dbbikes2.station s
                JOIN dbbikes2.availability2 a ON s.number = a.number AND DATE_FORMAT(FROM_UNIXTIME(a.datetime), '%a') IS NOT NULL
                WHERE s.number = :number
                GROUP BY s.address, day_of_week
                ORDER BY s.address, day_of_week;""")
        
        df = pd.read_sql(sql, engine, params={'number': number})   
        df = df.to_dict(orient="records")   
        return jsonify(df)
    
    except Exception as e:
        print(traceback.format_exc())
        return "Error in get_stations: " + str(e), 404

# Define the function to get weather data
@app.route("/weather")
def get_weather():
    try: 
        # Retrieve the data passed into the function and load it as a JSON object
        text = requests.get(WEATHERAPI).text
        weather = json.loads(text)
        # Extract the necessary values from the JSON object
        vals = (weather["weather"][0]["main"], weather["weather"][0]["description"], weather["main"]["temp"], weather["visibility"], weather["wind"]["speed"], weather["wind"]["deg"], weather["clouds"]["all"], datetime.timestamp(datetime.now()))
        print('#found {} Availability {}'.format(len(vals), vals))
        return weather
    except Exception as e:
        print(traceback.format_exc())
        return "Error in get_weather: " + str(e), 404
    
# Define the main function that will call the get_stations function every 30 seconds
def update_data():
    while True:
        try:
            # Call the get_stations function and update the stations variable
            stations = get_stations()
            weather = get_weather()
            print("Data updated at {}".format(datetime.now()))
            # Sleep for 30 seconds before calling the function again
            time.sleep(60)
        except Exception as e:
            print(traceback.format_exc())
            print("Error updating data: {}".format(e))
            # Sleep for 30 seconds before calling the function again
            time.sleep(60)
        return stations, weather


if __name__ == "__main__":
    # Start a new thread to continuously update the data
    import threading
    t = threading.Thread(target=update_data)
    t.start()
    app.run(debug=True)