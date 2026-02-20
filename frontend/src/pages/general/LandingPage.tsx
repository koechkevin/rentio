import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Check, Zap, BarChart3, Lock, Users, FileText, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Container, Row, Col, Button, Nav, Navbar } from 'react-bootstrap';
import './LandingPage.scss';

export default function LandingPage() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const { scrollY } = useScroll();
  const ref = useRef(null);

  // Parallax effects
  const y = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const floatingVariants: any = {
    initial: { y: 0 },
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const features = [
    {
      icon: <BarChart3 size={32} />,
      title: 'Smart Analytics',
      description: 'Real-time insights into your property portfolio performance and tenant data.',
      color: 'primary',
    },
    {
      icon: <FileText size={32} />,
      title: 'Automated Invoicing',
      description: 'Generate and manage invoices effortlessly with smart allocation and tracking.',
      color: 'danger',
    },
    {
      icon: <CreditCard size={32} />,
      title: 'Payment Management',
      description: 'Seamless payment processing with multiple payment options and reconciliation.',
      color: 'warning',
    },
    {
      icon: <Users size={32} />,
      title: 'Tenant Portal',
      description: 'Self-service portal for tenants to view invoices, make payments, and more.',
      color: 'success',
    },
    {
      icon: <Lock size={32} />,
      title: 'Enterprise Security',
      description: 'Bank-level security with role-based access control and data encryption.',
      color: 'info',
    },
    {
      icon: <Zap size={32} />,
      title: 'Lightning Fast',
      description: 'Optimized performance to handle large-scale property portfolios effortlessly.',
      color: 'warning',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Properties Managed' },
    { value: '50M+', label: 'Invoices Processed' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '24/7', label: 'Customer Support' },
  ];

  return (
    <div className="landing-page bg-dark text-white">
      {/* Navigation */}
      <motion.div initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8 }}>
        <Navbar expand="lg" className="navbar-dark bg-dark border-bottom border-secondary sticky-top navbar-backdrop">
          <Container>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Navbar.Brand className="fw-bold fs-4 rentio-brand">Rentio</Navbar.Brand>
            </motion.div>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto align-items-center gap-4">
                <motion.div whileHover={{ color: '#06B6D4' }}>
                  <Nav.Link href="#features" className="text-light">
                    Features
                  </Nav.Link>
                </motion.div>
                <motion.div whileHover={{ color: '#06B6D4' }}>
                  <Nav.Link href="#pricing" className="text-light">
                    Pricing
                  </Nav.Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline-info" onClick={() => navigate('/auth/login')} className="fw-semibold">
                    Login
                  </Button>
                </motion.div>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </motion.div>

      {/* Hero Section */}
      <section className="hero-section py-5">
        <div className="animated-bg-gradient" />
        <Container>
          <motion.div ref={ref} style={{ y, opacity }} className="text-center py-5">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <motion.h1 variants={itemVariants} className="display-3 fw-bold mb-4 lh-1">
                Manage Properties
                <span className="d-block rentio-gradient">Like Never Before</span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="fs-5 text-secondary mb-5 mx-auto"
                style={{ maxWidth: '600px' }}
              >
                Rentio is the all-in-one platform for property management. Handle invoicing, payments, tenants, and
                analytics in one beautiful dashboard.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="d-flex flex-column flex-sm-row gap-3 justify-content-center"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="px-5 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2 rentio-btn-primary"
                    onClick={() => navigate('/auth/register')}
                  >
                    Start Free Trial <ArrowRight size={20} />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline-light" className="px-5 py-3 fw-semibold">
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </Container>

        {/* Floating elements */}
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          className="floating-orb floating-orb-1"
        />
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 2 }}
          className="floating-orb floating-orb-2"
        />
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-dark-gradient">
        <Container>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <Row className="text-center">
              {stats.map((stat, index) => (
                <Col md={3} sm={6} key={index} className="mb-4">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="fs-1 fw-bold rentio-gradient mb-2">{stat.value}</div>
                    <p className="text-secondary">{stat.label}</p>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-5"
          >
            <h2 className="display-4 fw-bold mb-4">Powerful Features</h2>
            <p className="fs-5 text-secondary mx-auto" style={{ maxWidth: '600px' }}>
              Everything you need to manage your properties efficiently and profitably
            </p>
          </motion.div>

          <Row className="g-4">
            {features.map((feature, index) => (
              <Col lg={4} md={6} key={index}>
                <motion.div
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -10 }}
                  className="h-100 p-4 rounded-3 bg-dark border border-secondary feature-card"
                >
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={hoveredFeature === index ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                    className={`mb-4 p-3 rounded-2 w-fit d-inline-block feature-icon bg-${feature.color} text-white`}
                  >
                    {feature.icon}
                  </motion.div>

                  <h3 className="fs-5 fw-bold mb-3">{feature.title}</h3>
                  <p className="text-secondary mb-3">{feature.description}</p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={hoveredFeature === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    className="d-flex align-items-center gap-2 text-info fw-semibold"
                  >
                    Learn More <ArrowRight size={18} />
                  </motion.div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="py-5 bg-dark-gradient">
        <Container>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <Row className="align-items-center g-5">
              <Col lg={6}>
                <h2 className="display-4 fw-bold mb-5">Why Choose Rentio?</h2>
                <motion.div variants={containerVariants} initial="hidden" whileInView="visible">
                  {[
                    'Reduce administrative overhead by up to 80%',
                    'Get paid faster with automated payment processing',
                    'Make data-driven decisions with advanced analytics',
                    'Scale your portfolio effortlessly',
                    'Maintain transparency with tenants',
                    'Integrate with your existing tools',
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="d-flex gap-3 align-items-start mb-4 benefit-item"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        className="p-2 bg-info rounded-circle flex-shrink-0"
                      >
                        <Check size={20} className="text-white" />
                      </motion.div>
                      <p className="fs-6 text-light">{benefit}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </Col>

              <Col lg={6}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="bg-dark border border-info rounded-4 p-5 text-center trusted-box"
                >
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }}>
                    <Zap size={64} className="text-info mb-3 mx-auto d-block" />
                    <p className="fs-5 fw-bold mb-2">Trusted by</p>
                    <p className="display-5 fw-bold rentio-gradient mb-0">1000+</p>
                    <p className="text-secondary">Property Managers</p>
                  </motion.div>
                </motion.div>
              </Col>
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 cta-section">
        <div className="animated-bg-gradient-cta" />
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="display-4 fw-bold mb-4">Ready to Transform Your Business?</h2>
            <p className="fs-5 text-secondary mb-5 mx-auto" style={{ maxWidth: '600px' }}>
              Join hundreds of property managers who are already saving time and money with Rentio.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="px-5 py-3 fw-semibold d-inline-flex align-items-center gap-2 rentio-btn-primary"
                onClick={() => navigate('/auth/register')}
              >
                Get Started Free <ArrowRight size={24} />
              </Button>
            </motion.div>
            <p className="text-secondary mt-4">No credit card required. 14-day free trial.</p>
          </motion.div>
        </Container>
      </section>

      {/* Footer */}
      <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="border-top border-secondary py-5">
        <Container>
          <Row className="mb-5 g-4">
            <Col md={3} className="mb-4">
              <div className="fs-4 fw-bold rentio-brand mb-3">Rentio</div>
              <p className="text-secondary">Smart property management for modern businesses.</p>
            </Col>
            <Col md={3}>
              <h5 className="fw-semibold mb-4">Product</h5>
              <ul className="list-unstyled text-secondary">
                <li>
                  <a href="#" className="text-decoration-none text-secondary footer-link">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-decoration-none text-secondary footer-link">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-decoration-none text-secondary footer-link">
                    Security
                  </a>
                </li>
              </ul>
            </Col>
            <Col md={3}>
              <h5 className="fw-semibold mb-4">Company</h5>
              <ul className="list-unstyled text-secondary">
                <li>
                  <a href="#" className="text-decoration-none text-secondary footer-link">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-decoration-none text-secondary footer-link">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-decoration-none text-secondary footer-link">
                    Contact
                  </a>
                </li>
              </ul>
            </Col>
            <Col md={3}>
              <h5 className="fw-semibold mb-4">Legal</h5>
              <ul className="list-unstyled text-secondary">
                <li>
                  <a href="#" className="text-decoration-none text-secondary footer-link">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-decoration-none text-secondary footer-link">
                    Terms
                  </a>
                </li>
              </ul>
            </Col>
          </Row>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="border-top border-secondary pt-4 text-center text-muted"
          >
            <p>&copy; 2026 Rentio. All rights reserved.</p>
          </motion.div>
        </Container>
      </motion.footer>
    </div>
  );
}
