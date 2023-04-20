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
        return stations
    
    except Exception as e:
        print(traceback.format_exc())
        return "Error in get_stations: " + str(e), 404


##Weather API Key
WEATHERAPI = "http://api.openweathermap.org/data/2.5/weather?appid=d5de0b0a9c3cc6473da7d0005b3798ac&q=Dublin, IE"

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

@app.route("/predictionsold/<int:number>")
def get_predictions(number):
    try:
        vals = {}
        for i in range(7):
            vals[str(i)] = {}
            for j in range(24):
                prediction = model.predict([[number, i, j]]).tolist()[0]
                name = "station" + str(number) + str(i) + str(j)
                vals[str(i)][str(j)] = prediction
        return jsonify(vals)
    
    except Exception as e:
        print(traceback.format_exc())
        return "Error in get_predictions: " + str(e), 404
    
@app.route("/predictions/<int:number>")
def get_predict(number):
    try:
        WEATHERAPI = "http://api.openweathermap.org/data/2.5/forecast?lat=53.3498&lon=6.2603&appid=d5de0b0a9c3cc6473da7d0005b3798ac"
        # Need to get Temperature, Wind Speed, Wind direction, Clouds 
        text = requests.get(WEATHERAPI).text
        forecast = json.loads(text)['list']
        predictions = {}
        
        # initialize predictions dictionary for all seven days of the week
        for i in range(7):
            predictions[i] = {}
        
        for i in forecast:
            datetime_obj = datetime.fromtimestamp(i['dt'])
            hour = int(datetime_obj.strftime("%H"))
            day = int(datetime_obj.weekday())

            for j in range(5):
                df = pd.DataFrame(columns=["number","temp", "wind_speed","wind_direction","clouds","hour",'weekday_or_weekend_weekday','weekday_or_weekend_weekend'])
                df.loc[0, "number"] = number
                df.loc[0, "temp"] = i["main"]["temp"]
                df.loc[0, "wind_speed"] = i["wind"]["speed"]
                df.loc[0, "wind_direction"] = i["wind"]["deg"]
                df.loc[0, "clouds"] = i["clouds"]["all"]

                # Check in case it has gone into the next day
                if (hour + j) >= 24:
                    day += 1
                    if day == 7:
                        day = 0
                    hour -= 24

                df.loc[0, "hour"] = hour + j
                if day < 5:
                    df.loc[0, "weekday_or_weekend_weekend"] = 0
                    df.loc[0, "weekday_or_weekend_weekday"] = 1
                else:
                    df.loc[0, "weekday_or_weekend_weekend"] = 1
                    df.loc[0, "weekday_or_weekend_weekday"] = 0
                prediction = int(model.predict(df).tolist()[0])
                predictions[day][hour+j] = prediction

        return predictions
    
    except Exception as e:
        print(traceback.format_exc())
        return "Error in get_predict: " + str(e), 404
    

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
        return "Error in get_averages: " + str(e), 404
    
if __name__ == "__main__":
    # Start a new thread to continuously update the data
    import threading
    t = threading.Thread(target=update_data)
    t.start()
    app.run(debug=True)