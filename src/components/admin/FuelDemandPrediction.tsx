import React, { useState } from 'react';

export const FuelDemandPrediction: React.FC = () => {
  const [stationName, setStationName] = useState('idimu');
  const [agoPrice, setAgoPrice] = useState('9751');
  const [pmsPrice, setPmsPrice] = useState('14423');
  const [dieselPrice, setDieselPrice] = useState('1407');
  const [lpgPrice, setLpgPrice] = useState('1407');
  const [shift, setShift] = useState('Morning');
  const [weekday, setWeekday] = useState('Monday');
  const [date, setDate] = useState('2025-01-20');

  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predictFuelDemand = async () => {
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          Station_Name: stationName,
          AGO_Price: Number(agoPrice),
          PMS_Price: Number(pmsPrice),
          Diesel_Price: Number(dieselPrice),
          LPG_Price: Number(lpgPrice),
          Shift: shift,
          Weekday: weekday,
          Date: date,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      setPrediction(data.predicted_fuel_demand_litres);
    } catch (err) {
      console.error(err);
      setError(
        'Unable to connect to ML API. Make sure FastAPI is running on port 8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white">
          Fuel Demand Prediction
        </h2>

        <p className="text-xs text-slate-400 mt-1">
          Predict fuel demand using the trained Random Forest model.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <div>
          <label className="text-xs text-slate-400">
            Station Name
          </label>

          <input
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">
            AGO Price
          </label>

          <input
            type="number"
            value={agoPrice}
            onChange={(e) => setAgoPrice(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">
            PMS Price
          </label>

          <input
            type="number"
            value={pmsPrice}
            onChange={(e) => setPmsPrice(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">
            Diesel Price
          </label>

          <input
            type="number"
            value={dieselPrice}
            onChange={(e) => setDieselPrice(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">
            LPG Price
          </label>

          <input
            type="number"
            value={lpgPrice}
            onChange={(e) => setLpgPrice(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">
            Shift
          </label>

          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
          >
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
            <option>Night</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400">
            Weekday
          </label>

          <select
            value={weekday}
            onChange={(e) => setWeekday(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
          >
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
            <option>Friday</option>
            <option>Saturday</option>
            <option>Sunday</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400">
            Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
          />
        </div>

      </div>

      <button
        onClick={predictFuelDemand}
        disabled={loading}
        className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold"
      >
        {loading ? 'Predicting...' : 'Predict Fuel Demand'}
      </button>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-sm">
          {error}
        </div>
      )}

      {prediction !== null && (
        <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-700">
          <p className="text-sm text-emerald-300">
            Predicted Fuel Demand
          </p>

          <p className="text-4xl font-extrabold text-white mt-2">
            {prediction.toLocaleString()} Litres
          </p>

          <p className="text-xs text-slate-400 mt-2">
            Station: {stationName} | Date: {date} | Shift: {shift}
          </p>
        </div>
      )}
    </div>
  );
};