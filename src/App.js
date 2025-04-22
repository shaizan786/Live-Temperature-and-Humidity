import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import './App.css';

function App() {
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [sensorData, setSensorData] = useState([]);

  const authToken = process.env.REACT_APP_BLYNK_TOKEN;  // <-- Fetch token from .env

  const fetchSensorData = async () => {
    try {
      // Fetching temperature (V0) and humidity (V1) values from Blynk
      const tempRes = await fetch(`https://blynk.cloud/external/api/get?token=${authToken}&V0`);
      const humRes = await fetch(`https://blynk.cloud/external/api/get?token=${authToken}&V1`);

      const temp = parseFloat(await tempRes.text());
      const hum = parseFloat(await humRes.text());

      setTemperature(temp);
      setHumidity(hum);

      // Update the sensor data for real-time graph
      setSensorData(prev => [
        ...prev.slice(-20),  // Keep the last 20 entries
        { time: new Date().toLocaleTimeString(), temperature: temp, humidity: hum }
      ]);
    } catch (err) {
      console.error("Error fetching from Blynk:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchSensorData, 2000);  // Fetch data every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold text-center">🌡️ Temperature & Humidity Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="tw-card">
          <h2 className="tw-card-title">Temperature</h2>
          <p className="tw-card-value">{temperature} °C</p>
        </div>

        <div className="tw-card">
          <h2 className="tw-card-title">Humidity</h2>
          <p className="tw-card-value">{humidity} %</p>
        </div>
      </div>

      <div className="tw-card w-full max-w-5xl">
        <h2 className="tw-card-title">📈 Real-Time Graph</h2>

        {sensorData.length > 0 ? (
          <LineChart width={700} height={300} data={sensorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#f43f5e" name="Temperature (°C)" dot={false} />
            <Line type="monotone" dataKey="humidity" stroke="#3b82f6" name="Humidity (%)" dot={false} />
          </LineChart>
        ) : (
          <p>No data yet...</p>
        )}
      </div>
    </div>
  );
}

export default App;
