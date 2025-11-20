// src/components/StatsCard.jsx
import React from "react";
import { Card, Badge } from "react-bootstrap";

export default function StatsCard({ title, value, subtitle, variant = "primary" }) {
  return (
    <Card
      className="shadow-sm border-0"
      style={{
        borderRadius: 18,
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <Card.Body>
        <div className="d-flex justify-content-between">
          <div>
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#6b7280",
              }}
            >
              {title}
            </div>

            <h2 style={{ fontWeight: 800, marginTop: 3 }}>
              {value}{" "}
              <Badge bg={variant} style={{ fontSize: "0.75rem" }}>
                {subtitle}
              </Badge>
            </h2>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
