from flask import Flask, g, render_template
from sqlalchemy import create_engine

URI = "database-2.ckmnj1f5m6qh.eu-west-1.rds.amazonaws.com"
PORT = "3306"
DB = "backupdata"
USER = "admin"
PASSWORD = "DublinBikes3"

engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)
sql = """
SELECT 
"""

app = Flask(__name__, template_folder="templates")

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/maps")
def map():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)