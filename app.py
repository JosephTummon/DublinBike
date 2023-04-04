from flask import Flask, g, render_template, jsonify
from sqlalchemy import create_engine, text
import traceback
import functools
import requests
import time
import simplejson as json
from datetime import datetime

URI = "dbbikes2.cytgvbje9wgu.us-east-1.rds.amazonaws.com"
PORT = "3306"
DB = "dbbikes2"
USER = "admin"
PASSWORD = "DublinBikes1"
engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)

app = Flask("__name__")

def connect_to_database():
    engine = create_engine("mysql://{}:{}@{}:{}/{}".format(USER,PASSWORD,URI,PORT,DB), echo=True)
    return engine

  
def load_stations_from_db():
    engine = connect_to_database()
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM station"))
        stations = []
        for row in result.all():
            stations.append((dict(row)))
        return stations

def load_station_coordinates():
    engine = connect_to_database()
    with engine.connect() as conn:
        result = conn.execute(text("SELECT position_lat, position_lng FROM dbbikes2.station;"))
        co_ordinates = []
        for row in result.all():
            co_ordinates.append((dict(row)))
        return co_ordinates

def load_availability_from_db():
    engine = connect_to_database()
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM availability2"))
        availabile_bikes = []
        for row in result.all():
            availabile_bikes.append((dict(row)))
        return availabile_bikes

@app.route('/')
def home():
    stations = load_stations_from_db()
    co_ordinates = load_station_coordinates()
    return render_template('index.html')

# @app.route("/stations")
# @functools.lru_cache(maxsize=128)
# def get_stations():
#     engine = connect_to_database()
#     sql = f"""SELECT s.address, 
#                 s.position_lat, 
#                 s.position_lng, 
#                 a.available_bike_stands as bike_stands,
#                 a.available_bikes as bikes_free,
#                 a.datetime
#             FROM dbbikes2.availability2 as a
#             JOIN dbbikes2.station as s
#             ON s.number = a.number
#             JOIN (
#                 SELECT number, MAX(datetime) as max_datetime
#                 FROM dbbikes2.availability2
#                 GROUP BY number
#             ) as max_times
#             ON a.number = max_times.number AND a.datetime = max_times.max_datetime
#             WHERE s.number = a.number
#             ORDER BY s.address;"""
#     try:
#         with engine.connect() as conn:
#             rows = conn.execute(text(sql)).fetchall()
#             print('#found {} stations', len(rows), rows)
#             return jsonify([row._asdict() for row in rows]) # use this formula to turn the rows into a list of dicts
#     except:
#         print(traceback.format_exc())
#         return "error in get_stations", 404

# Define the main function that will call the get_stations function every 30 seconds
def update_data():
    while True:
        try:
            # Call the get_stations function and update the stations variable
            stations = get_stations()
            print("Data updated at {}".format(datetime.now()))

            # Sleep for 30 seconds before calling the function again
            time.sleep(30)
        except Exception as e:
            print(traceback.format_exc())
            print("Error updating data: {}".format(e))
            # Sleep for 30 seconds before calling the function again
            time.sleep(30)

# Define the route for /stations
@app.route("/stations")
@functools.lru_cache(maxsize=128)
def get_stations():
    try: 
        # Retrieve the data passed into the function and load it as a JSON object
        text = requests.get(URI1).text
        stations = json.loads(text)
        # Loop through each station in the JSON object and extract the necessary values
        vals = []
        for station in stations:
            vals.append((station.get('number'), station.get('available_bikes'), station.get('available_bike_stands'), station.get('status'), datetime.timestamp(datetime.now())))
        print('#found {} Availability {}'.format(len(vals), vals))
            
        # Print out the number of stations found and the extracted values
        print('#found {} stations {}'.format(len(vals), vals))
        return stations
    except Exception as e:
        print(traceback.format_exc())
        return "Error in get_stations: " + str(e), 404

##URL's with parameters already included
URI1 =  "https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=8ad0fc88de299d032d91bc99f1e01c34a44d39a0"


if __name__ == "__main__":
    # Start a new thread to continuously update the data
    import threading
    t = threading.Thread(target=update_data)
    t.start()
    app.run(debug=True)


