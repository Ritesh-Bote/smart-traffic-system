/**
 * CitizenPortal.js
 * Public page where citizens check traffic violations
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiAlertCircle,
  FiMapPin,
  FiCalendar
} from "react-icons/fi";
import { MdOutlineDirectionsCar } from "react-icons/md";
import axios from "axios";

/* 🔹 IMPORTANT: Backend API URL (Render) */
const API_BASE = "https://smart-traffic-backend-chb3.onrender.com/api";

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: { background: "#fffbeb", color: "#92400e" },
    Paid: { background: "#f0fdf4", color: "#14532d" },
    Disputed: { background: "#fdf4ff", color: "#7e22ce" },
    Cancelled: { background: "#f1f5f9", color: "#475569" }
  };

  const s = styles[status] || styles.Pending;

  return (
    <span
      style={{
        ...s,
        padding: "3px 10px",
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 600
      }}
    >
      {status}
    </span>
  );
};

const CitizenPortal = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!vehicleNumber.trim()) {
      setError("Please enter a vehicle number");
      return;
    }

    if (vehicleNumber.trim().length < 4) {
      setError("Please enter a valid vehicle number");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.get(
        `${API_BASE}/citizen/check/${vehicleNumber.trim()}`
      );

      setResult(response.data);
      setSearched(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to search. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVehicleNumber("");
    setResult(null);
    setError("");
    setSearched(false);
  };

  return (
    <div className="citizen-portal">
      {/* Login Button */}
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <Link
          to="/login"
          style={{
            background: "rgba(255,255,255,0.1)",
            padding: "8px 16px",
            borderRadius: 8,
            color: "white"
          }}
        >
          Police Login →
        </Link>
      </div>

      <div className="citizen-card">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 50 }}>🚦</div>
          <h1>Traffic Violation Check</h1>
          <p>Enter your vehicle number to check violations</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch}>
          <div style={{ position: "relative" }}>
            <MdOutlineDirectionsCar
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)"
              }}
            />

            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) =>
                setVehicleNumber(e.target.value.toUpperCase())
              }
              placeholder="MH12AB1234"
              className="form-control"
              style={{ paddingLeft: 35 }}
            />

            {vehicleNumber && (
              <button
                type="button"
                onClick={handleReset}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "none",
                  cursor: "pointer"
                }}
              >
                ×
              </button>
            )}
          </div>

          {error && (
            <div style={{ color: "red", marginTop: 10 }}>
              <FiAlertCircle /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: 15, width: "100%" }}
          >
            {loading ? "Searching..." : "Check Violations"}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div style={{ marginTop: 30 }}>
            <h3>
              Vehicle: <strong>{result.vehicleNumber}</strong>
            </h3>

            <p>Total Violations: {result.summary.totalViolations}</p>
            <p>Total Fine: ₹{result.summary.totalFineAmount}</p>
            <p>Pending Fine: ₹{result.summary.pendingFineAmount}</p>

            <div style={{ marginTop: 20 }}>
              {result.violations.map((v) => (
                <div
                  key={v._id}
                  style={{
                    border: "1px solid #ddd",
                    padding: 15,
                    borderRadius: 8,
                    marginBottom: 10
                  }}
                >
                  <h4>{v.violationType}</h4>

                  <p>
                    <FiCalendar /> {v.formattedDate}
                  </p>

                  <p>
                    <FiMapPin /> {v.location}
                  </p>

                  <p>Fine: ₹{v.fineAmount}</p>

                  <StatusBadge status={v.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 20, fontSize: 12, textAlign: "center" }}>
          For queries contact your nearest traffic police station
        </div>
      </div>
    </div>
  );
};

export default CitizenPortal;