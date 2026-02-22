import { Container, Row, Col, Card, Nav, Navbar, Badge } from 'react-bootstrap';
import { Link } from 'react-router';
import { ArrowLeft, AlertTriangle, Clock, Ban, Gavel, Home } from 'lucide-react';

const LAST_UPDATED = 'February 2026';

const sections = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'platform-use', label: 'Platform Use' },
  { id: 'payment-obligations', label: 'Payment Obligations' },
  { id: 'overdue-measures', label: 'Overdue Payment Measures' },
  { id: 'landlord-obligations', label: 'Landlord Obligations' },
  { id: 'termination', label: 'Termination' },
  { id: 'dispute-resolution', label: 'Dispute Resolution' },
  { id: 'governing-law', label: 'Governing Law' },
];

const PropertyTermsPage = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-vh-100 bg-body">
      {/* Top bar */}
      <Navbar style={{ left: 0, width: '100%' }} bg="body" border-bottom="true" className="border-bottom px-3 py-2">
        <Container fluid="xxl">
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-5">
            Rentio
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="d-flex align-items-center gap-1 text-secondary">
              <ArrowLeft size={15} />
              Back to home
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container fluid="xxl" className="py-5">
        <Row className="g-4">
          {/* Sticky TOC */}
          <Col lg={3} className="d-none d-lg-block">
            <div className="sticky-top" style={{ top: '80px' }}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <p className="fw-semibold text-uppercase text-secondary small mb-3 letter-spacing-1">Contents</p>
                  <Nav className="flex-column gap-1">
                    {sections.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        className="btn btn-link text-start text-decoration-none text-secondary py-1 px-0 small"
                      >
                        {s.label}
                      </button>
                    ))}
                  </Nav>
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* Main content */}
          <Col lg={9}>
            {/* Header */}
            <div className="mb-5 mt-5">
              <Badge bg="warning" text="dark" className="mb-3">
                Property Owner Agreement
              </Badge>
              <h1 className="fw-bold mb-2">Terms &amp; Conditions</h1>
              <p className="text-secondary">
                Last updated: {LAST_UPDATED} &nbsp;·&nbsp; Effective immediately upon account activation
              </p>
              <hr />
            </div>

            {/* 1. Acceptance */}
            <section id="acceptance" className="mb-5">
              <h3 className="fw-semibold mb-3">1. Acceptance of Terms</h3>
              <p>
                By registering an account and listing a property on Rentio, you ("Property Owner", "Landlord", or
                "Manager") agree to be bound by these Terms and Conditions. If you do not agree, you must not use the
                platform.
              </p>
              <p>
                These terms govern the relationship between Rentio and Property Owners. Separate terms apply to Tenants.
                Where both sets of terms conflict, Rentio's determination shall be final.
              </p>
            </section>

            {/* 2. Platform Use */}
            <section id="platform-use" className="mb-5">
              <h3 className="fw-semibold mb-3">2. Platform Use</h3>
              <ul className="list-unstyled d-flex flex-column gap-2">
                {[
                  'You must provide accurate property information at all times.',
                  'You are responsible for verifying tenant identities before granting tenancy.',
                  'You may not use Rentio to list properties for which you do not hold legal authority (ownership, management mandate, or lease assignment rights).',
                  'Multiple properties may be managed under a single account. Each property constitutes a separate tenancy context.',
                  'You must not use the platform to facilitate fraudulent, illegal, or discriminatory rental practices.',
                ].map((item, i) => (
                  <li key={i} className="d-flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 3. Payment Obligations */}
            <section id="payment-obligations" className="mb-5">
              <h3 className="fw-semibold mb-3">3. Payment Obligations</h3>
              <p>
                Rentio facilitates rent collection on behalf of Property Owners. By enabling invoice generation and
                payment collection you agree that:
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2">
                {[
                  'Rent amounts, due dates, and payment methods must be accurately reflected in the lease agreement recorded on the platform.',
                  'Rentio will remit collected payments to your registered bank account or M-Pesa wallet within 2 working days of receipt, less applicable platform fees.',
                  'You are solely responsible for informing tenants of payment obligations in advance of the due date.',
                  'Platform fees are non-refundable once a payment has been processed.',
                  'Disputed transactions must be raised with Rentio within 7 days of the transaction date.',
                ].map((item, i) => (
                  <li key={i} className="d-flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 4. Overdue Payment Measures */}
            <section id="overdue-measures" className="mb-5">
              <Card className="border-warning border-2">
                <Card.Header className="bg-warning bg-opacity-10 border-bottom border-warning border-opacity-25 d-flex align-items-center gap-2">
                  <AlertTriangle size={18} className="text-warning" />
                  <h3 className="fw-semibold mb-0 fs-5">4. Overdue Payment Measures</h3>
                </Card.Header>
                <Card.Body className="p-4">
                  <p className="text-secondary mb-4">
                    The following escalation process applies when a tenant's rent invoice remains unpaid beyond the due
                    date. Property Owners must follow this process in sequence and maintain records of all notices
                    issued. Actions taken outside this framework may expose you to legal liability under Kenyan law.
                  </p>

                  {/* Stage 1 */}
                  <div className="d-flex gap-3 mb-4">
                    <div
                      className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 40, height: 40 }}
                    >
                      <Clock size={18} className="text-info" />
                    </div>
                    <div>
                      <h5 className="fw-semibold mb-1">
                        Stage 1 — Automated Reminder{' '}
                        <Badge bg="info" className="ms-1 fw-normal fs-xs">
                          Days 1–7
                        </Badge>
                      </h5>
                      <p className="text-secondary mb-1">
                        Rentio automatically sends payment reminder notifications to the tenant via SMS, WhatsApp, and
                        in-app notification on the due date and again on days 3 and 7 of non-payment.
                      </p>
                      <p className="text-secondary small mb-0">No penalty fees apply during this period.</p>
                    </div>
                  </div>

                  {/* Stage 2 */}
                  <div className="d-flex gap-3 mb-4">
                    <div
                      className="rounded-circle bg-warning bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 40, height: 40 }}
                    >
                      <AlertTriangle size={18} className="text-warning" />
                    </div>
                    <div>
                      <h5 className="fw-semibold mb-1">
                        Stage 2 — Formal Notice of Default{' '}
                        <Badge bg="warning" text="dark" className="ms-1 fw-normal">
                          Days 8–14
                        </Badge>
                      </h5>
                      <p className="text-secondary mb-1">
                        A formal written Notice of Default is issued through the platform. The notice specifies the
                        outstanding amount, accrued late payment penalties (where applicable under the lease), and a
                        deadline to cure the default.
                      </p>
                      <ul className="text-secondary small mb-0">
                        <li>Notice must be delivered via recorded channel (platform notification + email/SMS).</li>
                        <li>Late penalty charges, if any, must be pre-agreed in the lease agreement.</li>
                        <li>
                          This notice constitutes the first formal step required before any access restrictions under
                          the <em>Distress for Rent Act (Cap. 293)</em> can be considered.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Stage 3 */}
                  <div className="d-flex gap-3 mb-4">
                    <div
                      className="rounded-circle bg-orange bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 40, height: 40, background: 'rgba(255,120,0,0.1)' }}
                    >
                      <Ban size={18} style={{ color: '#ff7800' }} />
                    </div>
                    <div>
                      <h5 className="fw-semibold mb-1">
                        Stage 3 — Restriction of Access to Non-Essential Common Areas{' '}
                        <Badge bg="danger" className="ms-1 fw-normal">
                          Days 15–30
                        </Badge>
                      </h5>
                      <p className="text-secondary mb-2">
                        Where rent remains unpaid for more than 14 days after the Notice of Default and in accordance
                        with the terms of the lease, the Property Owner may restrict the tenant's access to{' '}
                        <strong>non-essential common areas</strong> only. This includes, but is not limited to:
                      </p>
                      <ul className="text-secondary mb-2">
                        <li>Recreational facilities (gyms, swimming pools, common lounges)</li>
                        <li>Dedicated parking bays beyond minimum statutory entitlements</li>
                        <li>Storage units or additional amenities not forming part of the core unit</li>
                      </ul>
                      <Card className="border-danger border-opacity-25 bg-opacity-5 mb-2">
                        <Card.Body className="py-2 px-3">
                          <p className="text-danger small mb-0 fw-semibold">
                            ⚠ Prohibited Actions — Denial of access to the following is unlawful and will result in
                            immediate account suspension:
                          </p>
                          <ul className="text-danger small mb-0 mt-1">
                            <li>The demised premises (the tenant's unit)</li>
                            <li>Essential utilities (water, electricity) where landlord is the supplier</li>
                            <li>Emergency exits or fire escape routes</li>
                            <li>Essential sanitation facilities</li>
                          </ul>
                        </Card.Body>
                      </Card>
                      <p className="text-secondary small mb-0">
                        Any restriction must be preceded by 48 hours written notice to the tenant via the platform.
                        Unlawful exclusion from the dwelling constitutes an offence under the{' '}
                        <em>Rent Restriction Act (Cap. 296, Laws of Kenya)</em>.
                      </p>
                    </div>
                  </div>

                  {/* Stage 4 */}
                  <div className="d-flex gap-3 mb-4">
                    <div
                      className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 40, height: 40 }}
                    >
                      <Home size={18} className="text-danger" />
                    </div>
                    <div>
                      <h5 className="fw-semibold mb-1">
                        Stage 4 — Notice to Vacate{' '}
                        <Badge bg="danger" className="ms-1 fw-normal">
                          Day 30+
                        </Badge>
                      </h5>
                      <p className="text-secondary mb-2">
                        Where rent arrears exceed 30 days from the original due date, the Property Owner may serve a
                        formal Notice to Vacate via the platform. The notice period is governed by the lease agreement,
                        subject to the following statutory minimums under Kenyan law:
                      </p>
                      <div className="table-responsive mb-2">
                        <table className="table table-sm table-bordered mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Tenancy Type</th>
                              <th>Minimum Notice Period</th>
                              <th>Authority</th>
                            </tr>
                          </thead>
                          <tbody className="small">
                            <tr>
                              <td>Monthly tenancy</td>
                              <td>1 calendar month</td>
                              <td>Rent Restriction Act, Cap. 296</td>
                            </tr>
                            <tr>
                              <td>Annual tenancy</td>
                              <td>6 months</td>
                              <td>Rent Restriction Act, Cap. 296</td>
                            </tr>
                            <tr>
                              <td>Fixed-term lease</td>
                              <td>As per lease terms</td>
                              <td>Contract law / Lease agreement</td>
                            </tr>
                            <tr>
                              <td>Controlled tenancy</td>
                              <td>As directed by Rent Tribunal</td>
                              <td>Rent Restriction Act, Cap. 296</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-secondary small mb-0">
                        All notices must be recorded and served through the Rentio platform to maintain an auditable
                        trail. Self-help evictions (forceful removal of tenant or belongings without a court order) are
                        strictly prohibited and constitute an offence.
                      </p>
                    </div>
                  </div>

                  {/* Stage 5 */}
                  <div className="d-flex gap-3">
                    <div
                      className="rounded-circle bg-dark bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 40, height: 40 }}
                    >
                      <Gavel size={18} className="text-dark" />
                    </div>
                    <div>
                      <h5 className="fw-semibold mb-1">
                        Stage 5 — Legal Recovery{' '}
                        <Badge bg="secondary" className="ms-1 fw-normal">
                          After Notice to Vacate
                        </Badge>
                      </h5>
                      <p className="text-secondary mb-2">
                        If the tenant fails to vacate after the notice period, the Property Owner must obtain a court
                        order before proceeding. Available legal remedies include:
                      </p>
                      <ul className="text-secondary mb-2">
                        <li>
                          <strong>Rent Tribunal:</strong> Application under the Rent Restriction Act for controlled
                          premises. Hearings are held at the county Rent Tribunal.
                        </li>
                        <li>
                          <strong>Magistrate's Court:</strong> Recovery of unpaid rent as a civil debt (any amount) or
                          possession proceedings.
                        </li>
                        <li>
                          <strong>Distress for Rent:</strong> Recovery of outstanding rent arrears by levying distress
                          on tenant's goods, subject to <em>Distress for Rent Act (Cap. 293)</em>. Must be executed by a
                          licensed auctioneer.
                        </li>
                      </ul>
                      <p className="text-secondary small mb-0">
                        Rentio will provide exportable records of all notices, invoices, and payment history as
                        supporting documentation for court proceedings.
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </section>

            {/* 5. Landlord Obligations */}
            <section id="landlord-obligations" className="mb-5">
              <h3 className="fw-semibold mb-3">5. Landlord Obligations</h3>
              <p>As a Property Owner on Rentio, you undertake to:</p>
              <ul className="list-unstyled d-flex flex-column gap-2">
                {[
                  'Maintain the demised premises in a habitable condition throughout the tenancy.',
                  'Provide a receipt for every payment received, whether processed through Rentio or otherwise.',
                  'Not increase rent more frequently than once every 12 months, and only with the required notice period.',
                  'Return the security deposit within 30 days of lease termination, less any documented deductions.',
                  'Keep all tenant personal data collected through the platform confidential and not share it with unauthorised third parties.',
                  'Comply with all applicable Kenyan laws, including the Rent Restriction Act (Cap. 296), the Landlord and Tenant (Shops, Hotels and Catering Establishments) Act (Cap. 301), and any county government by-laws.',
                ].map((item, i) => (
                  <li key={i} className="d-flex gap-2">
                    <span className="text-success mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 6. Termination */}
            <section id="termination" className="mb-5">
              <h3 className="fw-semibold mb-3">6. Termination of Account</h3>
              <p>Rentio reserves the right to suspend or terminate a Property Owner's account without notice if:</p>
              <ul className="list-unstyled d-flex flex-column gap-2">
                {[
                  'You engage in an unlawful eviction or self-help remedy against a tenant.',
                  'You provide false or misleading property or tenancy information.',
                  'You use the platform to facilitate fraud, money laundering, or any illegal activity.',
                  'You violate any provision of these Terms and fail to remedy the breach within 7 days of notice.',
                ].map((item, i) => (
                  <li key={i} className="d-flex gap-2">
                    <span className="text-danger mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Upon termination, active tenant data and records will be retained for 7 years as required by the Kenya
                Revenue Authority and applicable accounting regulations.
              </p>
            </section>

            {/* 7. Dispute Resolution */}
            <section id="dispute-resolution" className="mb-5">
              <h3 className="fw-semibold mb-3">7. Dispute Resolution</h3>
              <p>
                In the event of a dispute between a Property Owner and Rentio, the parties shall first attempt to
                resolve the matter amicably within 30 days of written notice of the dispute. If unresolved, the dispute
                shall be referred to mediation under the Nairobi Centre for International Arbitration (NCIA) Mediation
                Rules. If mediation fails, the matter shall be submitted to binding arbitration in Nairobi, Kenya,
                conducted in English.
              </p>
              <p>
                Disputes between Property Owners and Tenants are subject to the jurisdiction of the relevant Rent
                Tribunal or Magistrate's Court in the county where the property is situated. Rentio is not a party to
                such disputes but will cooperate with lawful court orders for the disclosure of platform records.
              </p>
            </section>

            {/* 8. Governing Law */}
            <section id="governing-law" className="mb-5">
              <h3 className="fw-semibold mb-3">8. Governing Law</h3>
              <p>
                These Terms and Conditions are governed by and construed in accordance with the laws of the Republic of
                Kenya. Key applicable statutes include:
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2">
                {[
                  'Rent Restriction Act, Cap. 296 — tenant protection and eviction procedure',
                  'Distress for Rent Act, Cap. 293 — recovery of rent arrears by distress',
                  'Landlord and Tenant (Shops, Hotels and Catering Establishments) Act, Cap. 301',
                  'Law of Contract Act, Cap. 23 — general contractual obligations',
                  'Data Protection Act, 2019 — personal data processing obligations',
                  'Consumer Protection Act, 2012 — consumer rights in service agreements',
                ].map((item, i) => (
                  <li key={i} className="d-flex gap-2 align-items-center">
                    <span className="text-secondary">§</span>
                    <span className="text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Footer note */}
            <Card className="border-0 bg-body-secondary">
              <Card.Body className="text-secondary small">
                <p className="mb-1">
                  <strong>Need clarification?</strong> Contact Rentio support for guidance on applying these terms to
                  your specific situation.
                </p>
                <p className="mb-0">
                  Also see:{' '}
                  <Link to="/tenant-terms" className="text-primary">
                    Tenant Terms &amp; Data Protection
                  </Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="border-top py-4 mt-4">
        <Container fluid="xxl">
          <Row className="align-items-center">
            <Col className="text-secondary small">© {new Date().getFullYear()} Rentio. All rights reserved.</Col>
            <Col xs="auto" className="d-flex gap-3">
              <Link to="/tenant-terms" className="text-secondary small text-decoration-none">
                Tenant Terms
              </Link>
              <Link to="/terms" className="text-secondary small text-decoration-none">
                Property Terms
              </Link>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default PropertyTermsPage;
