import pandas as pd
import joblib

print("===================================")
print("   FUEL DEMAND PREDICTION SYSTEM")
print("===================================")

# Load trained model
print("\nLoading trained model...")

model = joblib.load("fuel_demand_model.pkl")

print("Model loaded successfully!")

# -------------------------------
# Get user inputs
# -------------------------------

station_name = input("\nEnter Station Name: ")

ago_price = float(input("Enter AGO Price: "))

pms_price = float(input("Enter PMS Price: "))

diesel_price = float(input("Enter Diesel Price: "))

lpg_price = float(input("Enter LPG Price: "))

shift = input("Enter Shift: ")

weekday = input("Enter Weekday: ")

date_input = input("Enter Date (YYYY-MM-DD): ")

# Convert date
date = pd.to_datetime(date_input)

year = date.year
month = date.month
day = date.day
day_of_week = date.dayofweek

# -------------------------------
# Create prediction input
# -------------------------------

input_data = pd.DataFrame([
    {
        "Station_Name": station_name,
        "AGO_Price": ago_price,
        "PMS_Price": pms_price,
        "Diesel_Price": diesel_price,
        "LPG_Price": lpg_price,
        "Shift": shift,
        "Weekday": weekday,
        "Year": year,
        "Month": month,
        "Day": day,
        "DayOfWeek": day_of_week
    }
])

# -------------------------------
# Make prediction
# -------------------------------

prediction = model.predict(input_data)[0]

# -------------------------------
# Display result
# -------------------------------

print("\n===================================")
print("       PREDICTION RESULT")
print("===================================")

print(f"Station        : {station_name}")
print(f"Date           : {date_input}")
print(f"Shift          : {shift}")
print(f"Predicted Fuel Demand : {prediction:.2f} Litres")

print("===================================")
print("Prediction completed successfully!")