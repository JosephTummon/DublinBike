from flask import Flask, g, jsonify

URI = "dbbikes2.cytgvbje9wgu.us-east-1.rds.amazonaws.com"
PORT = "3306"
DB = "dbbikes2"
USER = "admin"
PASSWORD = "DublinBikes1"

app = Flask(__name__)

@app.route('/')
def home():
    return '<h1>Hello</h1>'

def connect_to_database():
    engine = create_engine("mysql://{}:{}@{}:{}/{}".format(config.USER, config.PASSWORD, config.URI, 
    config.PORT, config.DB), echo=True)
    return engine

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = connect_to_database()
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route("/available/<int:station_id>")
def get_stations():
    engine = get_db()
    data = []
    rows = engine.execute("SELECT available_bikes from stations where number = {};".format(station_id))
    for row in rows:
        data.append(dict(row))
    return jsonify(available=data)

if __name__ == "__main__":
    app.run(debug=True)
