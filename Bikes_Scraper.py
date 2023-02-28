import sqlalchemy as sqla
from sqlalchemy import create_engine
import traceback
import glob
import os
from pprint import pprint
import simplejson as json
import requests
from datetime import datetime
import time
from IPython.display import display
URI = "demodublinbikes3.cix4fu1foszu.eu-west-1.rds.amazonaws.com"
PORT = "3306"
DB = "dbikestest"
USER = "admin"
PASSWORD = "feed123456"
engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)
JCKEY = "8ad0fc88de299d032d91bc99f1e01c34a44d39a0"
NAME = "Dublin"
URI =  "https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=8ad0fc88de299d032d91bc99f1e01c34a44d39a0"

#r = requests.get(URI, params= {"api_key":JCKEY, "contract": NAME})
#json.loads(r.text)

def availability_to_db(text):
    stations = json.loads(text)
    for station in stations:
        #print(station)
        vals = (station.get('number'), station.get('available_bikes'), station.get('available_bike_stands'), datetime.timestamp(datetime.now()))
        engine.connect().execute("insert into availability values(%s,%s,%s,%s)", vals)
        
    return

def weather_to_db(text):
    vals = (text["weather"][0]["main"], text["weather"][0]["description"], text["main"]["temp"], text["visibility"], text["wind"]["speed"], text["wind"]["deg"], text["clouds"]["all"], datetime.timestamp(datetime.now()))
    engine.connect().execute("insert into weather values(%s,%s,%s,%s,%s,%s,%s,%s)", vals)

    return
    

# Weather scraper
API_KEY = "d5de0b0a9c3cc6473da7d0005b3798ac"
base_url = "http://api.openweathermap.org/data/2.5/weather?"
city_name = "Dublin, IE"
complete_url = base_url + "appid=" + API_KEY + "&q=" + city_name
response = requests.get(complete_url)
# Save json data into a variable called x
weather = response.json()


def main():
    while True:
        try:
            r = requests.get(URI, params= {"api_key":JCKEY, "contract": NAME})
            availability_to_db(r.text)
            weather_to_db(weather)
            time.sleep(5*60)
        except:
            print(traceback.format_tb.execute())
            #if engine is None:
    return

main()