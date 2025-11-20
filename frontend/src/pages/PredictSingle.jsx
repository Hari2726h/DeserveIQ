// src/pages/PredictSingle.jsx
import React, { useState } from "react";
import TopNav from "../components/TopNav";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  OverlayTrigger,
  Tooltip,
  ProgressBar,
} from "react-bootstrap";
import { predictSingle } from "../services/api";
import { toast } from "react-toastify";

// small pill helper for labels
const InfoPill = ({ label, value, variant = "secondary" }) => {
  if (!value && value !== 0) return null;
  return (
    <Badge
      bg={variant}
      pill
      className="me-2 mb-2"
      style={{ fontSize: "0.7rem", fontWeight: 600 }}
    >
      {label}: {value}
    </Badge>
  );
};

// simple gauge bar used on the right side summary
const Gauge = ({ label, value, suffix = "", variant = "info" }) => {
  const numeric = Number(value) || 0;
  const clamped = Math.max(0, Math.min(100, numeric));

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center">
        <span className="small text-muted">{label}</span>
        <span className="small">
          <strong>{clamped.toFixed(1)}</strong>
          {suffix}
        </span>
      </div>
      <ProgressBar
        now={clamped}
        variant={variant}
        style={{ height: 8 }}
        className="rounded-pill mt-1"
      />
    </div>
  );
};

export default function PredictSingle() {
  // full payload required by model
  const [form, setForm] = useState({
    passed_out_10: 2022,
    passed_out_11: 2023,
    passed_out_12: 2024,

    marks_10: 80,
    marks_11: 80,
    marks_12: 80,

    family_income: 20000,
    family_members: 4,

    academic_score: 75,
    motivation_level: 3,
    attendance_rate: 80,

    district: "Chennai",
    school_type_10: "Government",
    school_type_11: "Government",
    school_type_12: "Government",

    orphan: "No",
    single_parent: "No",
    girl_child: "No",

    // REQUIRED BY MODEL
    siblings: "No",
    siblings_details: "",
    siblings_work_or_college: "",

    rent_or_own: "Rent",
    property_owned: "No",
    parents_occupation: "Labour",
    private_or_govt_school: "Government",

    willing_hostel: "Yes",
    any_scholarship: "No",
    first_graduate: "Yes",
    scholarship_eligibility: "Yes",

    communication_frequency: "Medium",
    family_support: "Medium",
    extra_curricular: "No",
    interest_level: "Medium",
    attitude: "Respectful",

    home_address: "",
    school_fee_6_to_12: "10k-20k",
  });

  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await predictSingle(form);
      setResult(res);
      toast.success("Prediction success");
    } catch (err) {
      console.error(err);
      toast.error("Prediction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const pageBackground =
    "linear-gradient(180deg, #eff6ff 0%, #ffffff 40%, #f9fafb 100%)";
  const headerGradient =
    "linear-gradient(135deg, rgba(248,250,252,1) 0%, rgba(239,246,255,1) 40%, rgba(219,234,254,1) 100%)";

  const dropoutPct = result
    ? (Number(result.dropout_probability || 0) * 100).toFixed(1)
    : "0.0";
  const deservingScore = result
    ? Number(result.deservingness_score || 0).toFixed(2)
    : "0.00";

  const riskVariant =
    result?.risk_tier === "HIGH"
      ? "danger"
      : result?.risk_tier === "MEDIUM"
      ? "warning"
      : "success";

  return (
    <>
      <TopNav />
      <div
        style={{
          minHeight: "100vh",
          background: pageBackground,
          fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont',
        }}
      >
        <Container className="py-4">
          {/* HEADER STRIP */}
          <Row className="mb-3">
            <Col>
              <Card
                className="border-0 shadow-sm"
                style={{ borderRadius: 18, background: headerGradient }}
              >
                <Card.Body className="d-flex justify-content-between flex-wrap align-items-center">
                  <div className="mb-2 mb-md-0">
                    <h3
                      className="mb-1"
                      style={{ color: "#111827", fontWeight: 700 }}
                    >
                      Single Student Prediction
                    </h3>
                    <small className="text-muted">
                      Enter a student’s academic, family and support details,
                      then let the model estimate dropout risk and
                      deservingness.
                    </small>
                  </div>
                  <div className="text-end">
                    <InfoPill
                      label="Default district"
                      value={form.district}
                      variant="primary"
                    />
                    <InfoPill
                      label="School type"
                      value={form.private_or_govt_school}
                      variant="info"
                    />
                    <div className="small text-muted mt-1">
                      Uses the same schema as your batch CSV.
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Form onSubmit={submit}>
            <Row className="g-4">
              {/* LEFT big form */}
              <Col lg={8}>
                {/* ACADEMIC CARD */}
                <Card
                  className="p-3 mb-3 shadow-sm border-0"
                  style={{ borderRadius: 18 }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h5 className="mb-0">Academic Information</h5>
                      <small className="text-muted">
                        Scores and marks directly influence dropout probability.
                      </small>
                    </div>
                    <OverlayTrigger
                      placement="left"
                      overlay={
                        <Tooltip id="ac-tip">
                          Higher academic and attendance values usually reduce
                          dropout risk and increase deservingness score.
                        </Tooltip>
                      }
                    >
                      <span
                        className="badge bg-light text-secondary"
                        style={{ cursor: "help" }}
                      >
                        ?
                      </span>
                    </OverlayTrigger>
                  </div>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Academic Score</Form.Label>
                        <Form.Control
                          type="number"
                          value={form.academic_score}
                          onChange={(e) =>
                            update("academic_score", +e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Motivation Level (1–5)</Form.Label>
                        <Form.Control
                          type="number"
                          value={form.motivation_level}
                          onChange={(e) =>
                            update("motivation_level", +e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Attendance Rate (%)</Form.Label>
                        <Form.Control
                          type="number"
                          value={form.attendance_rate}
                          onChange={(e) =>
                            update("attendance_rate", +e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Marks 10</Form.Label>
                        <Form.Control
                          type="number"
                          value={form.marks_10}
                          onChange={(e) =>
                            update("marks_10", +e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Marks 11</Form.Label>
                        <Form.Control
                          type="number"
                          value={form.marks_11}
                          onChange={(e) =>
                            update("marks_11", +e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Marks 12</Form.Label>
                        <Form.Control
                          type="number"
                          value={form.marks_12}
                          onChange={(e) =>
                            update("marks_12", +e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-2">
                        <Form.Label>10th Passed Out Year</Form.Label>
                        <Form.Control
                          type="number"
                          value={form.passed_out_10}
                          onChange={(e) =>
                            update("passed_out_10", +e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-2">
                        <Form.Label>11th Passed Out Year</Form.Label>
                        <Form.Control
                          type="number"
                          value={form.passed_out_11}
                          onChange={(e) =>
                            update("passed_out_11", +e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-2">
                        <Form.Label>12th Passed Out Year</Form.Label>
                        <Form.Control
                          type="number"
                          value={form.passed_out_12}
                          onChange={(e) =>
                            update("passed_out_12", +e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card>

                {/* FAMILY CARD */}
                <Card
                  className="p-3 mb-3 shadow-sm border-0"
                  style={{ borderRadius: 18 }}
                >
                  <h5>Family Information</h5>
                  <small className="text-muted">
                    Income, support and household structure are strong
                    indicators in the model.
                  </small>

                  <Row className="mt-2">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Family Income</Form.Label>
                        <Form.Control
                          type="number"
                          value={form.family_income}
                          onChange={(e) =>
                            update("family_income", +e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Family Members</Form.Label>
                        <Form.Control
                          type="number"
                          value={form.family_members}
                          onChange={(e) =>
                            update("family_members", +e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Orphan</Form.Label>
                        <Form.Select
                          value={form.orphan}
                          onChange={(e) => update("orphan", e.target.value)}
                        >
                          <option>No</option>
                          <option>Yes</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Single Parent</Form.Label>
                        <Form.Select
                          value={form.single_parent}
                          onChange={(e) =>
                            update("single_parent", e.target.value)
                          }
                        >
                          <option>No</option>
                          <option>Yes</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Girl Child</Form.Label>
                        <Form.Select
                          value={form.girl_child}
                          onChange={(e) =>
                            update("girl_child", e.target.value)
                          }
                        >
                          <option>No</option>
                          <option>Yes</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Siblings</Form.Label>
                        <Form.Select
                          value={form.siblings}
                          onChange={(e) => update("siblings", e.target.value)}
                        >
                          <option>No</option>
                          <option>Yes</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Siblings Details</Form.Label>
                        <Form.Control
                          value={form.siblings_details}
                          onChange={(e) =>
                            update("siblings_details", e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Siblings Work / College</Form.Label>
                        <Form.Control
                          value={form.siblings_work_or_college}
                          onChange={(e) =>
                            update("siblings_work_or_college", e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card>

                {/* SCHOOL & SUPPORT */}
                <Row>
                  <Col md={6}>
                    <Card
                      className="p-3 mb-3 shadow-sm border-0"
                      style={{ borderRadius: 18 }}
                    >
                      <h5>School Information</h5>
                      <small className="text-muted">
                        Government / Private and district help the model segment
                        context.
                      </small>

                      <Form.Group className="mb-3 mt-2">
                        <Form.Label>District</Form.Label>
                        <Form.Control
                          value={form.district}
                          onChange={(e) => update("district", e.target.value)}
                        />
                      </Form.Group>

                      {["school_type_10", "school_type_11", "school_type_12"].map(
                        (k) => (
                          <Form.Group className="mb-3" key={k}>
                            <Form.Label>
                              {k.replace(/_/g, " ").toUpperCase()}
                            </Form.Label>
                            <Form.Select
                              value={form[k]}
                              onChange={(e) => update(k, e.target.value)}
                            >
                              <option>Government</option>
                              <option>Private</option>
                            </Form.Select>
                          </Form.Group>
                        )
                      )}

                      <Form.Group className="mb-3">
                        <Form.Label>Overall School Type (6–12)</Form.Label>
                        <Form.Select
                          value={form.private_or_govt_school}
                          onChange={(e) =>
                            update("private_or_govt_school", e.target.value)
                          }
                        >
                          <option>Government</option>
                          <option>Private</option>
                        </Form.Select>
                      </Form.Group>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card
                      className="p-3 mb-3 shadow-sm border-0"
                      style={{ borderRadius: 18 }}
                    >
                      <h5>Behaviour & Support</h5>
                      <small className="text-muted">
                        These qualitative fields strongly impact deservingness.
                      </small>

                      <Form.Group className="mb-3 mt-2">
                        <Form.Label>Family Support</Form.Label>
                        <Form.Select
                          value={form.family_support}
                          onChange={(e) =>
                            update("family_support", e.target.value)
                          }
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Communication Frequency</Form.Label>
                        <Form.Select
                          value={form.communication_frequency}
                          onChange={(e) =>
                            update("communication_frequency", e.target.value)
                          }
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Interest Level</Form.Label>
                        <Form.Select
                          value={form.interest_level}
                          onChange={(e) =>
                            update("interest_level", e.target.value)
                          }
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Extra-curricular</Form.Label>
                        <Form.Select
                          value={form.extra_curricular}
                          onChange={(e) =>
                            update("extra_curricular", e.target.value)
                          }
                        >
                          <option>No</option>
                          <option>Yes</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Attitude</Form.Label>
                        <Form.Control
                          value={form.attitude}
                          onChange={(e) =>
                            update("attitude", e.target.value)
                          }
                        />
                      </Form.Group>
                    </Card>
                  </Col>
                </Row>

                {/* HOUSING / SCHOLARSHIP */}
                <Row>
                  <Col md={6}>
                    <Card
                      className="p-3 mb-3 shadow-sm border-0"
                      style={{ borderRadius: 18 }}
                    >
                      <h5>Housing & Assets</h5>
                      <Form.Group className="mb-3 mt-2">
                        <Form.Label>Rent or Own</Form.Label>
                        <Form.Select
                          value={form.rent_or_own}
                          onChange={(e) =>
                            update("rent_or_own", e.target.value)
                          }
                        >
                          <option>Rent</option>
                          <option>Own</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Property Owned</Form.Label>
                        <Form.Select
                          value={form.property_owned}
                          onChange={(e) =>
                            update("property_owned", e.target.value)
                          }
                        >
                          <option>No</option>
                          <option>Yes</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Parents Occupation</Form.Label>
                        <Form.Control
                          value={form.parents_occupation}
                          onChange={(e) =>
                            update("parents_occupation", e.target.value)
                          }
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Home Address (optional)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={form.home_address}
                          onChange={(e) =>
                            update("home_address", e.target.value)
                          }
                        />
                      </Form.Group>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card
                      className="p-3 mb-3 shadow-sm border-0"
                      style={{ borderRadius: 18 }}
                    >
                      <h5>Scholarship & Eligibility</h5>

                      <Form.Group className="mb-3 mt-2">
                        <Form.Label>Any Scholarship</Form.Label>
                        <Form.Select
                          value={form.any_scholarship}
                          onChange={(e) =>
                            update("any_scholarship", e.target.value)
                          }
                        >
                          <option>No</option>
                          <option>Yes</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>First Graduate</Form.Label>
                        <Form.Select
                          value={form.first_graduate}
                          onChange={(e) =>
                            update("first_graduate", e.target.value)
                          }
                        >
                          <option>Yes</option>
                          <option>No</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Scholarship Eligibility</Form.Label>
                        <Form.Select
                          value={form.scholarship_eligibility}
                          onChange={(e) =>
                            update("scholarship_eligibility", e.target.value)
                          }
                        >
                          <option>Yes</option>
                          <option>No</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Willing for Hostel</Form.Label>
                        <Form.Select
                          value={form.willing_hostel}
                          onChange={(e) =>
                            update("willing_hostel", e.target.value)
                          }
                        >
                          <option>Yes</option>
                          <option>No</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>School Fee (6–12)</Form.Label>
                        <Form.Select
                          value={form.school_fee_6_to_12}
                          onChange={(e) =>
                            update("school_fee_6_to_12", e.target.value)
                          }
                        >
                          <option>0-10k</option>
                          <option>10k-20k</option>
                          <option>20k-40k</option>
                          <option>40k+</option>
                        </Form.Select>
                      </Form.Group>
                    </Card>
                  </Col>
                </Row>

                <Button
                  type="submit"
                  className="mt-2 mb-4"
                  disabled={submitting}
                >
                  {submitting ? "Predicting..." : "Predict"}
                </Button>
              </Col>

              {/* RIGHT panel: summary + result */}
              <Col lg={4}>
                <Card
                  className="p-3 mb-3 shadow-sm border-0"
                  style={{ borderRadius: 18 }}
                >
                  <h5 className="mb-1">Input Summary</h5>
                  <small className="text-muted">
                    Quick glance at what you are about to send to the model.
                  </small>

                  <div className="mt-3">
                    <InfoPill
                      label="Academic"
                      value={form.academic_score}
                      variant="primary"
                    />
                    <InfoPill
                      label="Motivation"
                      value={form.motivation_level}
                      variant="info"
                    />
                    <InfoPill
                      label="Attendance"
                      value={`${form.attendance_rate}%`}
                      variant="success"
                    />
                    <InfoPill
                      label="Family income"
                      value={form.family_income}
                      variant="warning"
                    />
                  </div>

                  <div className="mt-3">
                    <Gauge
                      label="Academic score (approx)"
                      value={form.academic_score}
                      suffix="/100"
                      variant="primary"
                    />
                    <Gauge
                      label="Motivation (scaled)"
                      value={((form.motivation_level || 0) / 5) * 100}
                      suffix="/100"
                      variant="info"
                    />
                    <Gauge
                      label="Attendance rate"
                      value={form.attendance_rate}
                      suffix="%"
                      variant="success"
                    />
                  </div>
                </Card>

                <Card
                  className="p-3 shadow-sm border-0"
                  style={{ borderRadius: 18 }}
                >
                  <h5 className="mb-1">Prediction Result</h5>
                  <small className="text-muted">
                    Results are returned directly from the Flask ML API.
                  </small>

                  {result ? (
                    <div className="mt-3">
                      <p className="mb-1">
                        <strong>Dropout Probability:</strong>{" "}
                        <span style={{ color: "#b91c1c" }}>
                          {dropoutPct}%
                        </span>
                      </p>
                      <p className="mb-1">
                        <strong>Deservingness Score:</strong>{" "}
                        <span style={{ color: "#16a34a" }}>
                          {deservingScore}
                        </span>
                      </p>
                      <p className="mb-2">
                        <strong>Risk Tier:</strong>{" "}
                        <span
                          className={`badge ${
                            result.risk_tier === "HIGH"
                              ? "bg-danger"
                              : result.risk_tier === "MEDIUM"
                              ? "bg-warning text-dark"
                              : "bg-success"
                          }`}
                        >
                          {result.risk_tier}
                        </span>
                      </p>
                      <p className="small text-muted mb-0">
                        Use this prediction as a decision-support tool to
                        identify students needing additional financial and
                        emotional support.
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted mt-3">
                      No result yet. Fill in the form and click{" "}
                      <strong>Predict</strong> to get dropout probability and
                      deservingness score.
                    </p>
                  )}
                </Card>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
    </>
  );
}
