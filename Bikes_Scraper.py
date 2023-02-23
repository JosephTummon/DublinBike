import sqlalchemy as sqla
from sqlalchemy import create_engine
import traceback
import glob
import os
from pprint import pprint
import simplejson as json
import requests
import time
from IPython.display import display
URI = "dbbikes2.cytgvbje9wgu.us-east-1.rds.amazonaws.com"
PORT = "3306"
DB = "dbbikes2"
USER = "admin"
PASSWORD = "DublinBikes1"
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
        vals = (station.get('number'), station.get('available_bikes'), station.get('available_bike_stands'), station.get('last_update'))
        engine.execute("insert into availability values(%s,%s,%s,%s)", vals)
        
    return

def main():
    while True:
        try:
            r = requests.get(URI, params= {"api_key":JCKEY, "contract": NAME})
            #write_to_file(r.text)
            availability_to_db(r.text)
            time.sleep(5*60)
        except:
            print(traceback.format.exc())
            #if engine is None:
    return

main()