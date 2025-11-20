// src/pages/Students.jsx
import React, { useEffect, useMemo, useState } from 'react';
import TopNav from '../components/TopNav';
import {
  Container,
  Card,
  Table,
  Row,
  Col,
  Form,
  Badge,
  InputGroup,
  Button,
} from 'react-bootstrap';
import { getStudents } from '../services/api';
import { useNavigate } from 'react-router-dom';

const SummaryPill = ({ label, value, variant }) => (
  <Badge
    bg={variant}
    pill
    className="me-2 mb-2"
    style={{ fontSize: '0.70rem', fontWeight: 600 }}
  >
    {label}: {value}
  </Badge>
);

const headerBackground =
  'linear-gradient(135deg, rgba(248,250,252,1) 0%, rgba(239,246,255,1) 35%, rgba(221,239,253,1) 100%)';

export default function Students() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const nav = useNavigate();

  useEffect(() => {
    getStudents()
      .then((d) => setList(Array.isArray(d) ? d : []))
      .catch(() => setList([]));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let rows = [...list];

    if (q) {
      rows = rows.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.district?.toLowerCase().includes(q)
      );
    }

    if (schoolFilter !== 'ALL') {
      rows = rows.filter(
        (s) =>
          (s.private_or_govt_school || s.privateOrGovtSchool || '')
            .toLowerCase()
            .includes(schoolFilter.toLowerCase())
      );
    }

    const getValue = (s) => {
      switch (sortKey) {
        case 'academic':
          return Number(s.academic_score ?? s.academicScore ?? 0);
        case 'attendance':
          return Number(s.attendance_rate ?? s.attendanceRate ?? 0);
        case 'motivation':
          return Number(s.motivation_level ?? s.motivationLevel ?? 0);
        case 'name':
        default:
          return String(s.name || '').toLowerCase();
      }
    };

    rows.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return rows;
  }, [list, search, schoolFilter, sortKey, sortDir]);

  // small derived stats for header pills
  const summary = useMemo(() => {
    if (!list.length) {
      return {
        govt: 0,
        private: 0,
        scholarship: 0,
        highAttendance: 0,
      };
    }

    const govt = list.filter(
      (s) =>
        String(s.private_or_govt_school || '').toLowerCase().includes('govt') ||
        String(s.privateOrGovtSchool || '').toLowerCase().includes('govt')
    ).length;

    const priv = list.filter(
      (s) =>
        String(s.private_or_govt_school || '')
          .toLowerCase()
          .includes('private') ||
        String(s.privateOrGovtSchool || '').toLowerCase().includes('private')
    ).length;

    const scholarship = list.filter(
      (s) => String(s.any_scholarship || '').toLowerCase() === 'yes'
    ).length;

    const highAttendance = list.filter(
      (s) => Number(s.attendance_rate ?? s.attendanceRate ?? 0) >= 80
    ).length;

    return { govt, private: priv, scholarship, highAttendance };
  }, [list]);

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortIcon = (key) => {
    if (key !== sortKey) return '↕';
    return sortDir === 'asc' ? '↑' : '↓';
  };

  return (
    <>
      <TopNav />
      <div
        style={{
          minHeight: '100vh',
          background:
            'linear-gradient(180deg, #eff6ff 0%, #ffffff 40%, #f9fafb 100%)',
          fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont',
        }}
      >
        <Container className="py-4">
          {/* Header strip */}
          <Row className="mb-3">
            <Col>
              <Card
                className="border-0 shadow-sm"
                style={{ borderRadius: 18, background: headerBackground }}
              >
                <Card.Body>
                  <Row className="align-items-center g-3">
                    <Col md={6}>
                      <h3
                        className="mb-1"
                        style={{ color: '#111827', fontWeight: 700 }}
                      >
                        Students Registry
                      </h3>
                      <small className="text-muted">
                        {list.length} record(s) synced from DeserveIQ batch
                        uploads.
                      </small>
                      <div className="mt-3">
                        <SummaryPill
                          label="Govt"
                          value={summary.govt}
                          variant="primary"
                        />
                        <SummaryPill
                          label="Private"
                          value={summary.private}
                          variant="info"
                        />
                        <SummaryPill
                          label="Scholarship"
                          value={summary.scholarship}
                          variant="success"
                        />
                        <SummaryPill
                          label="≥80% Attendance"
                          value={summary.highAttendance}
                          variant="warning"
                        />
                      </div>
                    </Col>
                    <Col md={6}>
                      <Row className="g-2">
                        <Col md={7}>
                          <InputGroup>
                            <Form.Control
                              placeholder="Search by name or district…"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                            />
                          </InputGroup>
                        </Col>
                        <Col md={5}>
                          <Form.Select
                            value={schoolFilter}
                            onChange={(e) => setSchoolFilter(e.target.value)}
                          >
                            <option value="ALL">All school types</option>
                            <option value="govt">Govt schools only</option>
                            <option value="private">Private schools only</option>
                          </Form.Select>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Main table card */}
          <Card className="shadow-sm border-0" style={{ borderRadius: 18 }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                <div className="mb-2 mb-md-0">
                  <Card.Title className="mb-0">All Students</Card.Title>
                  <small className="text-muted">
                    Click “View” to see full profile and live risk insights.
                  </small>
                </div>
                <div className="d-flex align-items-center">
                  <span className="small text-muted me-2">
                    Sort by:{' '}
                    <strong
                      style={{ textTransform: 'capitalize', color: '#111827' }}
                    >
                      {sortKey}
                    </strong>{' '}
                    ({sortDir})
                  </span>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => {
                      setSortKey('name');
                      setSortDir('asc');
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>#</th>
                      <th
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleSort('name')}
                      >
                        Name <span className="small text-muted">{sortIcon('name')}</span>
                      </th>
                      <th>District</th>
                      <th>School</th>
                      <th
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleSort('academic')}
                      >
                        Academic{' '}
                        <span className="small text-muted">
                          {sortIcon('academic')}
                        </span>
                      </th>
                      <th
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleSort('motivation')}
                      >
                        Motivation{' '}
                        <span className="small text-muted">
                          {sortIcon('motivation')}
                        </span>
                      </th>
                      <th
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleSort('attendance')}
                      >
                        Attendance{' '}
                        <span className="small text-muted">
                          {sortIcon('attendance')}
                        </span>
                      </th>
                      <th style={{ width: 120 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center text-muted py-4">
                          No students found. Upload a CSV from{' '}
                          <strong>Batch Upload</strong> to start tracking.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((s, i) => {
                        const academic =
                          s.academic_score ?? s.academicScore ?? null;
                        const motivation =
                          s.motivation_level ?? s.motivationLevel ?? null;
                        const attendance =
                          s.attendance_rate ?? s.attendanceRate ?? null;

                        const school =
                          s.private_or_govt_school || s.privateOrGovtSchool || '';

                        return (
                          <tr key={s.id ?? i}>
                            <td>{i + 1}</td>
                            <td>
                              <div style={{ fontWeight: 600 }}>
                                {s.name || 'Unnamed'}
                              </div>
                              <div className="small text-muted">
                                {s.girl_child === 'Yes' ? 'Girl child' : ''}
                                {s.orphan === 'Yes'
                                  ? ' • Orphan'
                                  : s.single_parent === 'Yes'
                                  ? ' • Single parent'
                                  : ''}
                              </div>
                            </td>
                            <td>{s.district || '-'}</td>
                            <td>
                              <span className="small">
                                {school || 'Not specified'}
                              </span>
                            </td>
                            <td>
                              {academic !== null ? (
                                <span>
                                  {academic}{' '}
                                  <span className="small text-muted">/ 100</span>
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              {motivation !== null ? (
                                <span>
                                  {motivation}{' '}
                                  <span className="small text-muted">/ 5</span>
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              {attendance !== null ? (
                                <span>
                                  {attendance}
                                  <span className="small text-muted">%</span>
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => nav(`/students/${s.id}`)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
}
