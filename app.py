from flask import Flask, g, render_template, jsonify
from sqlalchemy import create_engine, text
import traceback
import functools

URI = "dbbikes2.cytgvbje9wgu.us-east-1.rds.amazonaws.com"
PORT = "3306"
DB = "dbbikes2"
USER = "admin"
PASSWORD = "DublinBikes1"
engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)

app = Flask("__name__", template_folder="templates")

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

@app.route("/stations")
@functools.lru_cache(maxsize=128)
def get_stations():
    engine = connect_to_database()
    sql = "select * from station;"
    try:
        with engine.connect() as conn:
            rows = conn.execute(text(sql)).fetchall()
            print('#found {} stations', len(rows), rows)
            return jsonify([row._asdict() for row in rows]) # use this formula to turn the rows into a list of dicts
    except:
        print(traceback.format_exc())
        return "error in get_stations", 404

# @app.route("/availability")
# @functools.lru_cache(maxsize=128)
# def get_availability():
#     engine = connect_to_database()
#     sql = "SELECT station.address, availability2.available_bikes FROM station JOIN available2 ON station.number = availability2.number;"
#     try:
#         with engine.connect() as conn:
#             rows = conn.execute(text(sql)).fetchall()
#             print('#found {} availability', len(rows), rows)
#             return jsonify([row._asdict() for row in rows]) # use this formula to turn the rows into a list of dicts
#     except:
#         print(traceback.format_exc())
#         return "error in get_availability", 404


    

if __name__ == "__main__":
    app.run(debug=True)


