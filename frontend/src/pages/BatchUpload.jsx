// src/pages/BatchUpload.jsx
import React, { useState, useMemo } from "react";
import TopNav from "../components/TopNav";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Badge,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { predictBatch } from "../services/api";
import Papa from "papaparse";
import { toast } from "react-toastify";

const pageBackground =
  "linear-gradient(180deg, #eff6ff 0%, #ffffff 40%, #f9fafb 100%)";
const headerGradient =
  "linear-gradient(135deg, rgba(248,250,252,1) 0%, rgba(239,246,255,1) 40%, rgba(219,234,254,1) 100%)";

// small description box for CSV format
const CsvHint = () => (
  <Card
    className="border-0 shadow-sm mt-3"
    style={{ borderRadius: 14, backgroundColor: "#f9fafb" }}
  >
    <Card.Body className="py-3">
      <h6 className="mb-2">CSV format reminder</h6>
      <p className="small text-muted mb-2">
        Your file should follow the same columns used for model training
        (e.g. <code>academic_score</code>, <code>motivation_level</code>,{" "}
        <code>attendance_rate</code>, family &amp; support fields, etc.).
      </p>
      <ul className="small text-muted mb-0">
        <li>First row must be the header row with column names.</li>
        <li>
          Snake_case headers are recommended, matching the Flask API schema.
        </li>
        <li>
          After upload, you’ll receive a{" "}
          <strong>predictions.csv</strong> which includes ML outputs.
        </li>
      </ul>
    </Card.Body>
  </Card>
);

export default function BatchUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [uploading, setUploading] = useState(false);

  const loadFile = (f) => {
    if (!f) return;
    setFile(f);
    Papa.parse(f, {
      header: true,
      preview: 20,
      skipEmptyLines: true,
      complete: (res) => {
        setHeaders(res.meta.fields || []);
        setPreview(res.data.slice(0, 20));
      },
      error: () => {
        toast.error("Unable to read CSV. Please check the file.");
        setHeaders([]);
        setPreview([]);
      },
    });
  };

  const upload = async () => {
    if (!file) {
      toast.warn("Choose CSV first");
      return;
    }

    try {
      setUploading(true);
      const res = await predictBatch(file);
      // res.data is already blob (from axios)
      const blob =
        res && res.data instanceof Blob
          ? res.data
          : new Blob([res.data || res], { type: "text/csv" });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "predictions.csv";
      a.click();
      toast.success("Batch scored successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Batch prediction failed");
    } finally {
      setUploading(false);
    }
  };

  const stats = useMemo(() => {
    if (!preview.length || !headers.length) {
      return { rows: 0, cols: 0 };
    }
    return { rows: preview.length, cols: headers.length };
  }, [preview, headers]);

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
                      Batch Upload & Scoring
                    </h3>
                    <small className="text-muted">
                      Upload a CSV of students to generate dropout probability,
                      deservingness score and risk tier in bulk.
                    </small>
                  </div>
                  <div className="text-end">
                    <Badge
                      bg={preview.length ? "primary" : "secondary"}
                      pill
                      className="me-2"
                    >
                      Rows previewed: {stats.rows}
                    </Badge>
                    <Badge
                      bg={preview.length ? "info" : "secondary"}
                      pill
                      className="me-2"
                    >
                      Columns: {stats.cols}
                    </Badge>
                    <OverlayTrigger
                      placement="left"
                      overlay={
                        <Tooltip id="batch-tip">
                          The downloaded predictions file will contain all your
                          original columns plus <code>dropout_probability</code>
                          , <code>deservingness_score</code> and{" "}
                          <code>risk_tier</code>.
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
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* MAIN CONTENT */}
          <Row className="g-4">
            {/* LEFT: Upload panel */}
            <Col md={4}>
              <Card
                className="p-3 shadow-sm border-0"
                style={{ borderRadius: 18 }}
              >
                <h5 className="mb-1">Upload CSV</h5>
                <small className="text-muted">
                  Choose a CSV with students you want to score.
                </small>

                <Form.Group className="mt-3 mb-3">
                  <Form.Label className="small text-muted">
                    Select file
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept=".csv"
                    onChange={(e) => loadFile(e.target.files[0])}
                  />
                  {file && (
                    <div className="small text-muted mt-1">
                      Selected: <strong>{file.name}</strong>
                    </div>
                  )}
                </Form.Group>

                <Button
                  onClick={upload}
                  disabled={uploading || !file}
                  className="w-100 mb-2"
                >
                  {uploading ? "Uploading & Scoring…" : "Upload & Score"}
                </Button>

                <div className="small text-muted">
                  After scoring, a new <strong>predictions.csv</strong> will be
                  downloaded automatically. You can also import that file into
                  Excel or Google Sheets for deeper analysis.
                </div>

                <CsvHint />
              </Card>
            </Col>

            {/* RIGHT: preview table */}
            <Col md={8}>
              <Card
                className="p-3 shadow-sm border-0"
                style={{ borderRadius: 18 }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <h5 className="mb-0">CSV Preview</h5>
                    <small className="text-muted">
                      We show up to 20 rows so you can double-check your
                      columns.
                    </small>
                  </div>
                  {preview.length > 0 && (
                    <Badge bg="light" text="secondary" pill>
                      {preview.length} row(s) previewed
                    </Badge>
                  )}
                </div>

                {preview.length === 0 ? (
                  <p className="text-muted mt-3 mb-0">
                    No preview yet. Select a CSV file on the left to see the
                    first few rows here.
                  </p>
                ) : (
                  <div className="table-responsive mt-2">
                    <Table size="sm" responsive hover className="align-middle">
                      <thead>
                        <tr>
                          {headers.map((h) => (
                            <th key={h} className="text-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i}>
                            {headers.map((h) => (
                              <td key={h} className="text-nowrap">
                                {row[h]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}
