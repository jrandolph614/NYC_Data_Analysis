# Import Dependencies
import os

import pandas as pd
import numpy as np 

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


# Database setup

app.config["***"] = "sqlits:///db/***"
db = SQLAlchemy(app)

# Reflect an existing database into a new model 

Base = automap_base()

# Reflect the tables

Base.prepare(db.engine, reflect=True)

# Save references to each table 

Samples_Metadata = Base.classes.Samples_Metadata
Samples = Base.classes.Samples


@app.route("/")
def index():
    """Homepage"""
    return render_template("index.html")



# Give variables 



# Create a dictinary entry (zip as key and have list of school rating and crime rates)


    



if __name__ == "__main__":
    app.run()

