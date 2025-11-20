// src/components/PredictionsTable.jsx
import React from "react";
import { Table, Badge } from "react-bootstrap";

export default function PredictionsTable({ rows }) {
  return (
    <Table
      hover
      responsive
      className="shadow-sm border-0"
      style={{
        fontFamily: '"Inter", sans-serif',
        borderRadius: 18,
        overflow: "hidden",
        background: "white",
      }}
    >
      <thead style={{ background: "#f9fafb" }}>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Academic</th>
          <th>Motivation</th>
          <th>Attendance</th>
          <th>Dropout %</th>
          <th>Deserving</th>
          <th>Risk</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td style={{ fontWeight: 600 }}>{r.name || "—"}</td>
            <td>{r.academic_score}</td>
            <td>{r.motivation_level}</td>
            <td>{r.attendance_rate}</td>
            <td style={{ fontWeight: 600 }}>
              {(r.dropout_probability * 100).toFixed(1)}%
            </td>
            <td>{r.deservingness_score}</td>
            <td>
              <Badge
                bg={
                  r.risk_tier === "HIGH"
                    ? "danger"
                    : r.risk_tier === "MEDIUM"
                    ? "warning"
                    : "success"
                }
                pill
              >
                {r.risk_tier}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
