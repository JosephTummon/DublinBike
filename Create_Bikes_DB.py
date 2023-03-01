import sqlalchemy 
from sqlalchemy import create_engine
from sqlalchemy import text
import traceback
import glob
import os
from pprint import pprint
import simplejson as json
import requests
import time
from IPython.display import display

URI = "database-2.ckmnj1f5m6qh.eu-west-1.rds.amazonaws.com"
PORT = "3306"
DB = "backupdata"
USER = "admin"
PASSWORD = "DublinBikes3"
engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)

sql = """
CREATE DATABASE IF NOT EXISTS backupdata;
"""
engine.connect().execute(text(sql))

#for res in engine.execute("SHOW VARIABLES;"):
 #   print(res)

sql = """
CREATE TABLE IF NOT EXISTS station (
   address VARCHAR(256),
   banking INTEGER,
   bike_stands INTEGER,
   bonus INTEGER,
   contract_name VARCHAR(256),
   name VARCHAR(256),
   number INTEGER,
   position_lat REAL,
   position_lng REAL,
   status VARCHAR(256)
)
"""

try:
    #res = engine.execute("DROP TABLE IF EXISTS station")
    res = engine.connect().execute(text(sql))
    print(res.fetchall())
except Exception as e:
    print(e)

sql = """
CREATE TABLE IF NOT EXISTS availability (
number INTEGER,
available_bikes INTEGER,
available_bike_stands INTEGER,
datetime INTEGER
)
"""
try:
    res = engine.connect().execute(text(sql))
    print(res.fetchall())
except Exception as e:
    print(e)


    

def stations_to_db(text):
    stations = json.loads(text)
    #print(type(stations), len(stations))
    for station in stations:
        #print(station)
        vals = (station.get('address'), int(station.get('banking')), station.get('bike_stands'), int(station.get('bonus')), station.get('contract_name'), station.get('name'), station.get('number'), station.get('position').get('lat'), station.get('position').get('lng'), station.get("status"))
        engine.execute("insert into station values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", vals)
        
    return


JCKEY = "8ad0fc88de299d032d91bc99f1e01c34a44d39a0"
NAME = "Dublin"
URI =  "https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=8ad0fc88de299d032d91bc99f1e01c34a44d39a0"
r = requests.get(URI, params= {"api_key":JCKEY, "contract": NAME})
json.loads(r.text)
#stations_to_db(r.text)

# Creating weather table
sql = """
CREATE TABLE IF NOT EXISTS weather (
main VARCHAR(256),
description VARCHAR(256),
temp REAL,
visibility REAL,
wind_speed FLOAT,
wind_direction FLOAT,
clouds FLOAT,
datetime INTEGER
)
"""
try:
    res = engine.connect().execute(text(sql))
    print(res.fetchall())
except Exception as e:
    print(e)
