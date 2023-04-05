from flask import Flask, g, render_template, jsonify
from sqlalchemy import create_engine, text
import traceback
import functools
import requests
import time
import simplejson as json
from datetime import datetime

# Database configuration
URI = "dbbikes2.cytgvbje9wgu.us-east-1.rds.amazonaws.com"
PORT = "3306"
DB = "dbbikes2"
USER = "admin"
PASSWORD = "DublinBikes1"
# engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)

# Initialize Flask app
app = Flask("__name__")

@app.route('/')
def home():
    return render_template('index.html')

##JCDeaux API Key
URI1 =  "https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=8ad0fc88de299d032d91bc99f1e01c34a44d39a0"

# Define the function to get availability data
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
            
        # Print out the number of stations found and the extracted values
        return stations
    except Exception as e:
        print(traceback.format_exc())
        return "Error in get_stations: " + str(e), 404
    


# Define the main function that will call the get_stations function every 30 seconds
def update_data():
    while True:
        try:
            # Call the get_stations function and update the stations variable
            stations = get_stations()
            # Sleep for 30 seconds before calling the function again
            time.sleep(30)
        except Exception as e:
            print(traceback.format_exc())
            print("Error updating data: {}".format(e))
            # Sleep for 30 seconds before calling the function again
            time.sleep(30)
    


# de-serialize model.pkl file into an object called model using pickle
with open('MLModel/model.pkl', 'rb') as handle:
    model = pickle.load(handle)

@app.route("/predict")
def predict():
    # now we can call various methods over model as as:
    # Let X_test be the feature for which we want to predict the output
    # result = model.predict(([1,2], [1, 4],[1,5])).tolist()
    predicted_data = {}
    current_hour = 1
    current_day = 2
    for i in range(1, 116):
        toAdd = {}
        for j in range(1, 7):
            toAdd[j] = model.predict([[current_day, current_hour]]).tolist()
        predicted_data[i] = toAdd

    return jsonify(predicted_data)



if __name__ == "__main__":
    # Start a new thread to continuously update the data
    t = threading.Thread(target=update_data)
    t.start()
    app.run(debug=True)