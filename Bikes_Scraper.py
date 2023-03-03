from sqlalchemy import create_engine
import traceback
import simplejson as json
import requests
from datetime import datetime
import time


URI = "demodublinbikes3.cix4fu1foszu.eu-west-1.rds.amazonaws.com"
PORT = "3306"
DB = "demodublinbikes3"
USER = "admin"
PASSWORD = "feed123456"

engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)

JCKEY = "8ad0fc88de299d032d91bc99f1e01c34a44d39a0"
NAME = "Dublin"
URI =  "https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=8ad0fc88de299d032d91bc99f1e01c34a44d39a0"

##Read availability json data and insert dynamic values to db
def availability_to_db(text):
    stations = json.loads(text)
    for station in stations:
        vals = (station.get('number'), station.get('available_bikes'), station.get('available_bike_stands'), station.get('status'), datetime.timestamp(datetime.now()))
        engine.connect().execute("insert into availability2 values(%s,%s,%s,%s,%s)", vals)
    return

##Read weather json data and insert dynamic values to db
def weather_to_db(text):
    vals = (text["weather"][0]["main"], text["weather"][0]["description"], text["main"]["temp"], text["visibility"], text["wind"]["speed"], text["wind"]["deg"], text["clouds"]["all"], datetime.timestamp(datetime.now()))
    engine.connect().execute("insert into weather2 values(%s,%s,%s,%s,%s,%s,%s,%s)", vals)

    return

##URL's with parameters already included
URI1 =  "https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=8ad0fc88de299d032d91bc99f1e01c34a44d39a0"
URI2 = "http://api.openweathermap.org/data/2.5/weather?appid=d5de0b0a9c3cc6473da7d0005b3798ac&q=Dublin, IE"

##loop every 5 mins to call both api requests, and call update table funcs
def main():
    while True:
        try:
            r1 = requests.get(URI1)
            availability_to_db(r1.text)
            r2 = requests.get(URI2)
            weather_to_db(r2.json())
            time.sleep(5*60)
        except:
            print("Error, no longer running")
    return
main()