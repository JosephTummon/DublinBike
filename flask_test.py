from flask import Flask, g, jsonify, render_template
from sqlalchemy import create_engine
from sqlalchemy import text

URI = "dbbikes2.cytgvbje9wgu.us-east-1.rds.amazonaws.com"
PORT = "3306"
DB = "dbbikes2"
USER = "admin"
PASSWORD = "DublinBikes1"

MAPS_API = "AIzaSyBoz4zBXk6t06QD4MsYq2sl56oV3Mco9ao"


app = Flask(__name__)
# Connecting to databse
engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)

#Going to try to get some basic data from database
sql = """
SELECT description FROM weather WHERE datetime = 1677248754
"""
data = engine.connect().execute(text(sql))

with engine.connect() as connection:
    result = connection.execute(text("select position_lat,position_lng from station"))
    display = ""
    for row in result:
        display += "position_lat:" + str(row["position_lat"]) + ", position_lng" + str(row["position_lng"]) + "\n"

@app.route('/map', methods=['GET'])
def index():
    return render_template('index.html')

@app.route("/")
def hello():
    return "Hello World!"

# Test page to see if we can collect data
@app.route("/test")
def change():
    return display

@app.route("/station/<int:station_id>")
def station(station_id):
    return f'Retrieving info for Station: {station_id}'

if __name__ == "__main__":
    app.run(debug=True)
