from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import pandas as pd
import joblib


# Create FastAPI app
app = FastAPI(
    title="Fuel Demand Prediction API",
    description="ML API for predicting fuel demand",
    version="1.0"
)


# --------------------------------------------------
# CORS - Allow React frontend
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://online-fuel-delivery-management-sys.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Load trained ML model
# --------------------------------------------------

MODEL_PATH = Path(__file__).parent / "fuel_demand_model.pkl"

model = joblib.load(MODEL_PATH)


# --------------------------------------------------
# Input data structure
# --------------------------------------------------

class FuelInput(BaseModel):
    Station_Name: str
    AGO_Price: float
    PMS_Price: float
    Diesel_Price: float
    LPG_Price: float
    Shift: str
    Weekday: str
    Date: str


# --------------------------------------------------
# Home API
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Fuel Demand Prediction API is running"
    }


# --------------------------------------------------
# Fuel Demand Prediction API
# --------------------------------------------------

@app.post("/predict")
def predict(data: FuelInput):

    try:

        # Convert date
        date = pd.to_datetime(data.Date)

        # Prepare input data
        input_data = pd.DataFrame([
            {
                "Station_Name": data.Station_Name,
                "AGO_Price": data.AGO_Price,
                "PMS_Price": data.PMS_Price,
                "Diesel_Price": data.Diesel_Price,
                "LPG_Price": data.LPG_Price,
                "Shift": data.Shift,
                "Weekday": data.Weekday,
                "Year": date.year,
                "Month": date.month,
                "Day": date.day,
                "DayOfWeek": date.dayofweek
            }
        ])

        # Predict fuel demand
        prediction = model.predict(input_data)[0]

        # Return prediction
        return {
            "predicted_fuel_demand_litres": round(float(prediction), 2)
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )
