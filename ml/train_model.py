import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

import joblib


# ==========================================
# 1. LOAD DATASET
# ==========================================

print("Loading dataset...")

df = pd.read_csv("dataset.csv")

# Remove accidental spaces from column names
df.columns = df.columns.str.strip()

print("Dataset loaded successfully!")
print("Dataset Shape:", df.shape)

print("\nDataset Columns:")
print(df.columns.tolist())


# ==========================================
# 2. CREATE TOTAL FUEL DEMAND
# ==========================================

df["Total_Fuel_Demand"] = (
    pd.to_numeric(df["AGO_Sales (L)"], errors="coerce")
    + pd.to_numeric(df["PMS_Sales (L)"], errors="coerce")
    + pd.to_numeric(df["Diesel_Sales (L)"], errors="coerce")
)

print("\nTotal Fuel Demand created successfully.")


# ==========================================
# 3. PROCESS DATE
# ==========================================

df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

df["Year"] = df["Date"].dt.year
df["Month"] = df["Date"].dt.month
df["Day"] = df["Date"].dt.day
df["DayOfWeek"] = df["Date"].dt.dayofweek


# ==========================================
# 4. REMOVE INVALID TARGET ROWS
# ==========================================

df = df.dropna(subset=["Total_Fuel_Demand"])

print("\nValid rows after cleaning:", len(df))


# ==========================================
# 5. SELECT FEATURES
# ==========================================

features = [
    "Station_Name",
    "AGO_Price",
    "PMS_Price",
    "Diesel_Price",
    "LPG_Price",
    "Shift",
    "Weekday",
    "Year",
    "Month",
    "Day",
    "DayOfWeek"
]

target = "Total_Fuel_Demand"


X = df[features]
y = df[target]


print("\nFeatures selected:")
print(features)

print("\nTarget:")
print(target)


# ==========================================
# 6. DEFINE CATEGORICAL AND NUMERICAL DATA
# ==========================================

categorical_features = [
    "Station_Name",
    "Shift",
    "Weekday"
]

numerical_features = [
    "AGO_Price",
    "PMS_Price",
    "Diesel_Price",
    "LPG_Price",
    "Year",
    "Month",
    "Day",
    "DayOfWeek"
]


# ==========================================
# 7. PREPROCESSING
# ==========================================

numeric_transformer = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="median"))
    ]
)

categorical_transformer = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore"))
    ]
)


preprocessor = ColumnTransformer(
    transformers=[
        ("num", numeric_transformer, numerical_features),
        ("cat", categorical_transformer, categorical_features)
    ]
)


# ==========================================
# 8. CREATE RANDOM FOREST MODEL
# ==========================================

model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)


model_pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


# ==========================================
# 9. SPLIT DATA
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ==========================================
# 10. TRAIN MODEL
# ==========================================

print("\nTraining Random Forest model...")

model_pipeline.fit(X_train, y_train)

print("Training completed successfully!")


# ==========================================
# 11. MAKE PREDICTIONS
# ==========================================

y_pred = model_pipeline.predict(X_test)


# ==========================================
# 12. MODEL EVALUATION
# ==========================================

mae = mean_absolute_error(y_test, y_pred)

rmse = np.sqrt(
    mean_squared_error(y_test, y_pred)
)

r2 = r2_score(y_test, y_pred)


print("\n===================================")
print("       MODEL EVALUATION")
print("===================================")

print(f"R2 Score : {r2:.4f}")
print(f"R2 Percentage : {r2 * 100:.2f}%")
print(f"MAE : {mae:.2f} Litres")
print(f"RMSE : {rmse:.2f} Litres")

print("===================================")


# ==========================================
# 13. SAVE TRAINED MODEL
# ==========================================

joblib.dump(
    model_pipeline,
    "fuel_demand_model.pkl"
)

print("\nModel saved successfully!")
print("File: fuel_demand_model.pkl")


# ==========================================
# 14. SAMPLE PREDICTION
# ==========================================

sample = pd.DataFrame([
    {
        "Station_Name": df["Station_Name"].iloc[0],

        "AGO_Price": df["AGO_Price"].median(),
        "PMS_Price": df["PMS_Price"].median(),
        "Diesel_Price": df["Diesel_Price"].median(),
        "LPG_Price": df["LPG_Price"].median(),

        "Shift": df["Shift"].mode()[0],
        "Weekday": df["Weekday"].mode()[0],

        "Year": 2025,
        "Month": 1,
        "Day": 1,
        "DayOfWeek": 2
    }
])


prediction = model_pipeline.predict(sample)[0]


print("\n===================================")
print("       SAMPLE PREDICTION")
print("===================================")

print(
    f"Predicted Fuel Demand: {prediction:.2f} Litres"
)

print("===================================")