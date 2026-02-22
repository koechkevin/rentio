import { Container, Row, Col, Card, Nav, Navbar, Badge, Table } from 'react-bootstrap';
import { Link } from 'react-router';
import { ArrowLeft, Shield, Eye, Lock, UserCheck, FileText, Globe, Clock } from 'lucide-react';

const LAST_UPDATED = 'February 2026';

const sections = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'tenancy-obligations', label: 'Tenancy Obligations' },
  { id: 'payment-terms', label: 'Payment Terms & Arrears' },
  { id: 'data-protection', label: 'Data Protection' },
  { id: 'data-rights', label: 'Your Data Rights' },
  { id: 'data-sharing', label: 'Data Sharing & Transfers' },
  { id: 'cookies', label: 'Cookies & Tracking' },
  { id: 'tenant-rights', label: 'Tenant Rights' },
  { id: 'dispute-resolution', label: 'Dispute Resolution' },
  { id: 'governing-law', label: 'Governing Law' },
];

const TenantTermsPage = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-vh-100 bg-body">
      {/* Top bar */}
      <Navbar bg="body" style={{ left: 0, width: '100%' }} className="border-bottom px-3 py-2">
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

      <Container fluid="xxl" className="py-5 px-3">
        <Row className="g-4">
          {/* Sticky TOC */}
          <Col lg={3} className="d-none d-lg-block">
            <div className="sticky-top" style={{ top: '80px' }}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <p className="fw-semibold text-uppercase text-secondary small mb-3">Contents</p>
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

              <Card className="border-0 shadow-sm mt-3 border-primary border-opacity-25">
                <Card.Body className="small">
                  <p className="fw-semibold text-primary mb-2 d-flex align-items-center gap-1">
                    <Shield size={14} /> Data Controller
                  </p>
                  <p className="mb-1 text-secondary">Rentio Technologies Ltd</p>
                  <p className="mb-1 text-secondary">Nairobi, Kenya</p>
                  <p className="mb-0">
                    <a href="mailto:privacy@rentio.co.ke" className="text-primary">
                      privacy@rentio.co.ke
                    </a>
                  </p>
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* Main content */}
          <Col lg={9}>
            {/* Header */}
            <div className="mb-5 mt-5">
              <Badge bg="primary" className="mb-3">
                Tenant Agreement &amp; Privacy Notice
              </Badge>
              <h1 className="fw-bold mb-2">Tenant Terms &amp; Data Protection</h1>
              <p className="text-secondary">
                Last updated: {LAST_UPDATED} &nbsp;·&nbsp; Effective upon tenancy commencement
              </p>
              <p>
                This document sets out your rights and obligations as a Tenant on the Rentio platform. It also serves as
                our Privacy Notice explaining how we collect, use, and protect your personal data in compliance with the{' '}
                <strong>Kenya Data Protection Act, 2019</strong> and aligned with international best practices including
                the EU General Data Protection Regulation (GDPR).
              </p>
              <hr />
            </div>

            {/* 1. Acceptance */}
            <section id="acceptance" className="mb-5">
              <h3 className="fw-semibold mb-3">1. Acceptance of Terms</h3>
              <p>
                By activating your Tenant account on Rentio — whether by invitation from your Property Owner or by
                self-registration — you agree to these Terms. If you do not agree, you must not use the platform.
              </p>
              <p>
                Where these Terms conflict with your physical lease agreement, the lease agreement shall govern matters
                of tenancy. These Terms govern your use of the Rentio digital platform and the processing of your
                personal data.
              </p>
            </section>

            {/* 2. Tenancy Obligations */}
            <section id="tenancy-obligations" className="mb-5">
              <h3 className="fw-semibold mb-3">2. Tenancy Obligations</h3>
              <p>As a Tenant, you agree to:</p>
              <ul className="list-unstyled d-flex flex-column gap-2">
                {[
                  'Pay rent by the due date specified in your lease agreement and reflected in your Rentio invoice.',
                  'Keep the demised premises clean and in good repair, fair wear and tear excepted.',
                  'Notify your Property Owner through the platform of any maintenance issues within a reasonable time.',
                  'Not sublet, assign, or grant any licence over the premises without the written consent of the Property Owner.',
                  'Comply with all house rules, county regulations, and lawful instructions issued by the Property Owner.',
                  'Not use the premises for any illegal, immoral, or business purpose unless expressly permitted by the lease.',
                ].map((item, i) => (
                  <li key={i} className="d-flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 3. Payment Terms */}
            <section id="payment-terms" className="mb-5">
              <h3 className="fw-semibold mb-3">3. Payment Terms &amp; Consequences of Arrears</h3>
              <p>
                Rentio generates rent invoices automatically based on your lease terms. Payment is due on the date
                specified in each invoice. The following applies to overdue payments:
              </p>

              <div className="d-flex flex-column gap-3">
                {[
                  {
                    day: 'Days 1–7',
                    color: 'info',
                    title: 'Automated Reminders',
                    desc: 'You will receive payment reminders via SMS, WhatsApp, and in-app notification. No penalty applies during this period.',
                  },
                  {
                    day: 'Days 8–14',
                    color: 'warning',
                    title: 'Notice of Default',
                    desc: 'A formal Notice of Default will be issued. Any agreed late penalty charges begin to accrue as specified in your lease agreement.',
                  },
                  {
                    day: 'Days 15–30',
                    color: 'danger',
                    title: 'Restricted Access',
                    desc: 'Access to non-essential common area facilities (gyms, pools, extra parking) may be restricted. Your access to your unit and essential services is protected by law and cannot be removed.',
                  },
                  {
                    day: 'Day 30+',
                    color: 'dark',
                    title: 'Notice to Vacate / Legal Action',
                    desc: "A Notice to Vacate may be served. The Property Owner may pursue recovery of arrears through the Rent Tribunal or Magistrate's Court. Forced eviction without a court order is unlawful.",
                  },
                ].map((stage) => (
                  <Card key={stage.day} className={`border-${stage.color} border-opacity-25`}>
                    <Card.Body className="d-flex gap-3 align-items-start">
                      <Badge bg={stage.color} className="flex-shrink-0 mt-1">
                        {stage.day}
                      </Badge>
                      <div>
                        <p className="fw-semibold mb-1">{stage.title}</p>
                        <p className="text-secondary small mb-0">{stage.desc}</p>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </section>

            {/* 4. Data Protection */}
            <section id="data-protection" className="mb-5">
              <Card className="border-primary border-opacity-25 border-2">
                <Card.Header className="bg-primary bg-opacity-10 border-bottom border-primary border-opacity-25 d-flex align-items-center gap-2">
                  <Shield size={18} className="text-primary" />
                  <h3 className="fw-semibold mb-0 fs-5">4. Data Protection</h3>
                </Card.Header>
                <Card.Body className="p-4">
                  <p>
                    Rentio is committed to protecting your personal data. This section constitutes our Privacy Notice as
                    required by the <strong>Kenya Data Protection Act, 2019 (No. 24 of 2019)</strong> and is aligned
                    with the EU <strong>General Data Protection Regulation (GDPR)</strong> to meet international
                    standards.
                  </p>

                  {/* Data we collect */}
                  <h5 className="fw-semibold mt-4 mb-3 d-flex align-items-center gap-2">
                    <Eye size={16} className="text-primary" /> What Personal Data We Collect
                  </h5>
                  <Table responsive bordered size="sm" className="small">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '30%' }}>Data Category</th>
                        <th style={{ width: '40%' }}>Examples</th>
                        <th style={{ width: '30%' }}>Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          cat: 'Identity Data',
                          ex: 'Full name, National ID number, passport number',
                          purpose: 'Tenant verification and identity confirmation',
                        },
                        {
                          cat: 'Contact Data',
                          ex: 'Phone number, email address, physical address',
                          purpose: 'Communication, invoicing, legal notices',
                        },
                        {
                          cat: 'Financial Data',
                          ex: 'M-Pesa number, bank account details, payment history',
                          purpose: 'Rent collection and payment processing',
                        },
                        {
                          cat: 'Tenancy Data',
                          ex: 'Lease terms, unit occupied, outstanding balance, issue reports',
                          purpose: 'Property management and lease administration',
                        },
                        {
                          cat: 'Technical Data',
                          ex: 'IP address, device type, browser, login timestamps',
                          purpose: 'Platform security and fraud prevention',
                        },
                        {
                          cat: 'Communication Data',
                          ex: 'Maintenance requests, messages sent through the platform',
                          purpose: 'Dispute resolution and service delivery',
                        },
                      ].map((row) => (
                        <tr key={row.cat}>
                          <td className="fw-semibold">{row.cat}</td>
                          <td className="text-secondary">{row.ex}</td>
                          <td className="text-secondary">{row.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Legal basis */}
                  <h5 className="fw-semibold mt-4 mb-3 d-flex align-items-center gap-2">
                    <FileText size={16} className="text-primary" /> Legal Basis for Processing
                  </h5>
                  <p className="text-secondary small mb-2">
                    Under Section 30 of the Kenya Data Protection Act, 2019 and Article 6 of the GDPR, we process your
                    personal data on the following legal bases:
                  </p>
                  <ul className="list-unstyled d-flex flex-column gap-2">
                    {[
                      {
                        basis: 'Contract performance',
                        desc: 'Processing necessary to manage your tenancy, generate invoices, and facilitate rent payments.',
                      },
                      {
                        basis: 'Legal obligation',
                        desc: 'Processing required to comply with Kenyan tax, accounting, and property law obligations.',
                      },
                      {
                        basis: 'Legitimate interests',
                        desc: 'Fraud prevention, platform security, and improvement of our services.',
                      },
                      {
                        basis: 'Consent',
                        desc: 'For marketing communications and optional features. Consent may be withdrawn at any time.',
                      },
                    ].map((item) => (
                      <li key={item.basis} className="d-flex gap-2">
                        <span className="text-primary fw-semibold flex-shrink-0">▸</span>
                        <span>
                          <strong>{item.basis}:</strong> <span className="text-secondary">{item.desc}</span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Retention */}
                  <h5 className="fw-semibold mt-4 mb-3 d-flex align-items-center gap-2">
                    <Clock size={16} className="text-primary" /> Data Retention
                  </h5>
                  <p className="text-secondary small mb-0">
                    Your personal data is retained for as long as your tenancy is active and for a further{' '}
                    <strong>7 years</strong> after tenancy termination, as required by the Kenya Revenue Authority's
                    record-keeping obligations and for the purpose of resolving any post-tenancy disputes. Technical and
                    security logs are retained for 12 months. Where processing was based solely on consent, data is
                    deleted within 30 days of consent withdrawal (subject to legal retention obligations).
                  </p>
                </Card.Body>
              </Card>
            </section>

            {/* 5. Your Data Rights */}
            <section id="data-rights" className="mb-5">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-body-secondary border-bottom d-flex align-items-center gap-2">
                  <UserCheck size={18} className="text-success" />
                  <h3 className="fw-semibold mb-0 fs-5">5. Your Data Rights</h3>
                </Card.Header>
                <Card.Body className="p-4">
                  <p className="text-secondary mb-4">
                    Under the Kenya Data Protection Act, 2019 (Sections 26–34) and in alignment with the GDPR (Articles
                    15–22), you have the following rights regarding your personal data:
                  </p>
                  <Row className="g-3">
                    {[
                      {
                        icon: <Eye size={20} className="text-primary" />,
                        title: 'Right of Access',
                        desc: 'Request a copy of all personal data we hold about you. We will respond within 21 days (KDPA) / 30 days (GDPR).',
                        basis: 'KDPA s.26 / GDPR Art.15',
                      },
                      {
                        icon: <FileText size={20} className="text-info" />,
                        title: 'Right to Rectification',
                        desc: 'Request correction of inaccurate or incomplete personal data at any time through your profile settings or by contacting us.',
                        basis: 'KDPA s.27 / GDPR Art.16',
                      },
                      {
                        icon: <Lock size={20} className="text-warning" />,
                        title: 'Right to Erasure',
                        desc: 'Request deletion of your data where it is no longer necessary, consent has been withdrawn, or processing is unlawful. Subject to legal retention obligations.',
                        basis: 'KDPA s.28 / GDPR Art.17',
                      },
                      {
                        icon: <Shield size={20} className="text-secondary" />,
                        title: 'Right to Restriction',
                        desc: 'Request that we restrict processing of your data while a dispute or complaint is being resolved.',
                        basis: 'KDPA s.29 / GDPR Art.18',
                      },
                      {
                        icon: <Globe size={20} className="text-success" />,
                        title: 'Right to Data Portability',
                        desc: 'Receive your personal data in a structured, machine-readable format (CSV or JSON) to transfer to another service.',
                        basis: 'KDPA s.30 / GDPR Art.20',
                      },
                      {
                        icon: <UserCheck size={20} className="text-danger" />,
                        title: 'Right to Object',
                        desc: 'Object to processing based on legitimate interests or for direct marketing. We will cease processing unless we can demonstrate compelling legitimate grounds.',
                        basis: 'KDPA s.31 / GDPR Art.21',
                      },
                    ].map((right) => (
                      <Col sm={6} key={right.title}>
                        <Card className="h-100 border-0 bg-body-secondary">
                          <Card.Body>
                            <div className="mb-2">{right.icon}</div>
                            <h6 className="fw-semibold mb-1">{right.title}</h6>
                            <p className="text-secondary small mb-2">{right.desc}</p>
                            <Badge bg="light" text="dark" className="small">
                              {right.basis}
                            </Badge>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  <Card className="mt-4 border-primary border-opacity-25 bg-opacity-5">
                    <Card.Body className="small">
                      <p className="fw-semibold mb-1">How to exercise your rights</p>
                      <p className="text-secondary mb-1">
                        Submit a data subject request to{' '}
                        <a href="mailto:privacy@rentio.co.ke" className="text-primary">
                          privacy@rentio.co.ke
                        </a>{' '}
                        or through the Privacy settings in your account. We will verify your identity before processing
                        the request.
                      </p>
                      <p className="text-secondary mb-1">
                        If you are dissatisfied with our response, you have the right to lodge a complaint with the{' '}
                        <strong>Office of the Data Protection Commissioner (ODPC)</strong> of Kenya at{' '}
                        <a
                          href="https://www.odpc.go.ke"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary"
                        >
                          odpc.go.ke
                        </a>
                        .
                      </p>
                      <p className="text-secondary mb-0">
                        EU residents may also lodge complaints with their local Data Protection Authority.
                      </p>
                    </Card.Body>
                  </Card>
                </Card.Body>
              </Card>
            </section>

            {/* 6. Data Sharing */}
            <section id="data-sharing" className="mb-5">
              <h3 className="fw-semibold mb-3">6. Data Sharing &amp; International Transfers</h3>

              <h5 className="fw-semibold mb-3">Who we share your data with</h5>
              <Table responsive bordered size="sm" className="small mb-4">
                <thead className="table-light">
                  <tr>
                    <th>Recipient</th>
                    <th>Purpose</th>
                    <th>Safeguard</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      r: 'Your Property Owner',
                      p: 'Tenancy management, invoicing, maintenance',
                      s: 'Contractual obligation under lease',
                    },
                    {
                      r: 'M-Pesa / Safaricom',
                      p: 'Processing M-Pesa rent payments',
                      s: 'Safaricom privacy policy & CBK regulations',
                    },
                    {
                      r: 'PesaPal',
                      p: 'Card and alternative payment processing',
                      s: 'PCI-DSS compliance, contractual clauses',
                    },
                    {
                      r: 'Cloud infrastructure (AWS/GCP)',
                      p: 'Hosting and data storage',
                      s: 'ISO 27001 certified; data processed in compliant regions',
                    },
                    {
                      r: 'SMS / WhatsApp providers',
                      p: 'Delivery of payment reminders and notices',
                      s: 'Limited to name, phone number, and message content',
                    },
                    {
                      r: 'Kenyan courts / government authorities',
                      p: 'Compliance with lawful orders',
                      s: 'Only upon receipt of a valid court order or statutory demand',
                    },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="fw-semibold">{row.r}</td>
                      <td className="text-secondary">{row.p}</td>
                      <td className="text-secondary">{row.s}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <h5 className="fw-semibold mb-2 d-flex align-items-center gap-2">
                <Globe size={16} className="text-primary" /> International Data Transfers
              </h5>
              <p className="text-secondary">
                Where your data is transferred outside Kenya (e.g., to cloud infrastructure located in the EU or US),
                Rentio ensures adequate protection through:
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2">
                {[
                  'Standard Contractual Clauses (SCCs) as recognised by the ODPC',
                  'Transfer to countries with an adequacy decision',
                  'Binding Corporate Rules where applicable',
                ].map((item, i) => (
                  <li key={i} className="d-flex gap-2">
                    <span className="text-primary mt-1">→</span>
                    <span className="text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-secondary mt-2 small">
                We do not sell your personal data to third parties for marketing purposes.
              </p>
            </section>

            {/* 7. Cookies */}
            <section id="cookies" className="mb-5">
              <h3 className="fw-semibold mb-3">7. Cookies &amp; Tracking</h3>
              <p>Rentio uses the following types of cookies and similar technologies:</p>
              <ul className="list-unstyled d-flex flex-column gap-2">
                {[
                  {
                    type: 'Essential cookies',
                    desc: 'Required for authentication and platform functionality. Cannot be disabled.',
                  },
                  {
                    type: 'Security tokens',
                    desc: 'JWT access tokens and refresh tokens stored in localStorage to maintain your session securely.',
                  },
                  {
                    type: 'Analytics',
                    desc: 'Aggregated, anonymised usage data to improve platform performance. No individual profiling.',
                  },
                ].map((item) => (
                  <li key={item.type} className="d-flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      <strong>{item.type}:</strong> <span className="text-secondary">{item.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-secondary small mt-2">
                You can manage non-essential cookies through your browser settings. Disabling essential cookies will
                affect platform functionality.
              </p>
            </section>

            {/* 8. Tenant Rights */}
            <section id="tenant-rights" className="mb-5">
              <h3 className="fw-semibold mb-3">8. Tenant Rights Under Kenyan Law</h3>
              <p>
                Regardless of what is stated in your lease or these Terms, you retain the following statutory rights as
                a tenant in Kenya:
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2">
                {[
                  'Right to quiet enjoyment of your demised premises without unlawful interference by the landlord.',
                  'Right to receive a receipt for every payment of rent made.',
                  'Right not to be evicted without a valid court order, regardless of rent arrears.',
                  'Right to access essential utilities (water, electricity) unless disconnected by the utility provider directly for non-payment to them.',
                  'Right to have your security deposit returned within 30 days of vacating, with a written account of any deductions.',
                  "Right to refer disputes to the Rent Tribunal for controlled premises or the Magistrate's Court.",
                  'Right to be informed of any rent increase with the legally required advance notice.',
                  'Right to have your personal data processed lawfully, fairly, and transparently.',
                ].map((item, i) => (
                  <li key={i} className="d-flex gap-2">
                    <span className="text-success fw-bold mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 9. Dispute Resolution */}
            <section id="dispute-resolution" className="mb-5">
              <h3 className="fw-semibold mb-3">9. Dispute Resolution</h3>
              <p>
                Disputes between you and your Property Owner should first be raised through the Rentio in-app issue
                reporting system to create a documented record. If unresolved, disputes may be referred to:
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2">
                {[
                  'The Rent Tribunal in your county for matters governed by the Rent Restriction Act (Cap. 296)',
                  "The Magistrate's Court for recovery of deposits or damages",
                  'The Office of the Data Protection Commissioner for data protection complaints',
                  'The Consumer Protection Advisory Committee under the Consumer Protection Act, 2012',
                ].map((item, i) => (
                  <li key={i} className="d-flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Disputes between you and Rentio regarding platform services shall be resolved by mediation under the
                NCIA Mediation Rules, and thereafter by binding arbitration in Nairobi, Kenya.
              </p>
            </section>

            {/* 10. Governing Law */}
            <section id="governing-law" className="mb-5">
              <h3 className="fw-semibold mb-3">10. Governing Law</h3>
              <p>These Terms are governed by the laws of the Republic of Kenya. Key applicable legislation includes:</p>
              <Row className="g-3">
                {[
                  { law: 'Data Protection Act, 2019', scope: 'Personal data rights and obligations' },
                  { law: 'Rent Restriction Act, Cap. 296', scope: 'Tenancy protections and eviction procedure' },
                  { law: 'Consumer Protection Act, 2012', scope: 'Consumer rights in service agreements' },
                  {
                    law: 'Kenya Information & Communications Act, Cap. 411A',
                    scope: 'Electronic communications and data',
                  },
                  { law: 'Law of Contract Act, Cap. 23', scope: 'General contractual obligations' },
                  { law: 'EU GDPR (aligned)', scope: 'International data protection standard' },
                ].map((item) => (
                  <Col sm={6} key={item.law}>
                    <Card className="h-100 border-0 bg-body-secondary">
                      <Card.Body className="py-2 px-3">
                        <p className="fw-semibold small mb-0">{item.law}</p>
                        <p className="text-secondary small mb-0">{item.scope}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </section>

            {/* Footer note */}
            <Card className="border-0 bg-body-secondary">
              <Card.Body className="text-secondary small">
                <p className="mb-1">
                  <strong>Questions about your data?</strong> Contact our Data Protection Officer at{' '}
                  <a href="mailto:privacy@rentio.co.ke" className="text-primary">
                    privacy@rentio.co.ke
                  </a>
                  . We aim to respond to all data subject requests within 21 days.
                </p>
                <p className="mb-0">
                  Also see:{' '}
                  <Link to="/terms" className="text-primary">
                    Property Owner Terms &amp; Conditions
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

export default TenantTermsPage;
