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

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///school.sqlite"
db = SQLAlchemy(app)

# Reflect an existing database into a new model 

Base = automap_base()

# Reflect the tables

Base.prepare(db.engine, reflect=True)

# Save references to each table 

ZipAnalytics = Base.classes.zipanalytics
#print(Base.classes)

@app.route("/")
def index():
    """Homepage"""
    return render_template("index.html")

@app.route("/names")
def names():
    """Return a list of sample zipcodes."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(ZipAnalytics).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Return a list of the column names (sample names)
    return jsonify(list(df.columns)[2:])

@app.route("/zipcodedata/<zipcode>")
def zipcodedata(zipcode):
    """Return the MetaData for a given zipcode."""
    sel = [
        ZipAnalytics.zipcode,
        ZipAnalytics.latitude,
        ZipAnalytics.longitude,
        ZipAnalytics.saleprice,
        ZipAnalytics.rent,
        ZipAnalytics.marketindex,
        ZipAnalytics.totalincome,
        ZipAnalytics.totalcrime,
        ZipAnalytics.rankStars
    ]

    results = db.session.query(*sel).filter(ZipAnalytics.zipcode == zipcode).all()

    # Create a dictionary entry for each row of metadata information
    zip_analytics = {}
    for result in results:
        zip_analytics["zipcode"] = result[0]
        zip_analytics["latitude"] = result[1]
        zip_analytics["longitude"] = result[2]
        zip_analytics["saleprice"] = result[3]
        zip_analytics["rent"] = result[4]
        zip_analytics["marketindex"] = result[5]
        zip_analytics["totalincome"] = result[6]
        zip_analytics["totalcrime"] = result[7]
        zip_analytics["rankStars"] = result[8]

    print(zip_analytics)
    return jsonify(zip_analytics)
    
@app.route("/alldata")
def alldata():
    """Return the all data."""
    sel = [
        ZipAnalytics.zipcode,
        ZipAnalytics.latitude,
        ZipAnalytics.longitude,
        ZipAnalytics.saleprice,
        ZipAnalytics.rent,
        ZipAnalytics.marketindex,
        ZipAnalytics.totalincome,
        ZipAnalytics.totalcrime,
        ZipAnalytics.rankStars
    ]

    results = db.session.query(*sel).all()
    #print(results)
    # Create a dictionary entry for each row of metadata information
    zipanalyticsList = []
    for result in results:
        zip_analytics = {}
        zip_analytics["zipcode"] = result[0]
        zip_analytics["latitude"] = result[1]
        zip_analytics["longitude"] = result[2]
        zip_analytics["saleprice"] = result[3]
        zip_analytics["rent"] = result[4]
        zip_analytics["marketindex"] = result[5]
        zip_analytics["totalincome"] = result[6]
        zip_analytics["totalcrime"] = result[7]
        zip_analytics["rankStars"] = result[8]

        zipanalyticsList.append(zip_analytics)
    return jsonify(zipanalyticsList)

@app.route("/toptenzipcodedata/<factor>")
def toptendata(factor):
    """Return the top 10 zip codes for entered factor."""
    
    stmt = db.session.query(ZipAnalytics).statement
    df = pd.read_sql_query(stmt, db.session.bind)
    toptendata = df[['zipcode', factor]].sort_values(by = factor, ascending=False).head(10)
    data = {
        "zipcode" : toptendata.zipcode.values.tolist(),
        factor : toptendata[factor].values.tolist()
    }

    return jsonify(data)

if __name__ == "__main__":
    app.run()

