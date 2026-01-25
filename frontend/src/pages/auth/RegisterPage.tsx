import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { ShieldAlert } from 'lucide-react';
import { useRegisterMutation } from '@/services/api/authApi';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!fullName || !phone || !email || !password || !nationalId) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const result = await register({
        fullName,
        phone,
        email,
        password,
        nationalId,
      }).unwrap();

      setSuccess('Registration successful! Please check your email to verify your account.');

      if (remember) {
        localStorage.setItem('remember', 'true');
      } else {
        localStorage.removeItem('remember');
      }

      // Redirect to email verification page after 2 seconds
      setTimeout(() => {
        navigate('/auth/verify-email', {
          state: { email },
          replace: true,
        });
      }, 2000);
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <Row>
      <Col md={12} className="ps-md-0">
        <div className="auth-form-wrapper px-5 py-5">
          <Link to="/" className="nobleui-logo d-block mb-2">
            Rent<span>IO</span>
          </Link>
          <h5 className="text-secondary fw-normal mb-4">Create a free account.</h5>
          <Form onSubmit={handleSubmit} autoComplete="on">
            {error && (
              <Alert variant="danger">
                <ShieldAlert className="me-2" size={22} />
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success">
                <ShieldAlert className="me-2" size={22} />
                {success}
              </Alert>
            )}
            <Form.Group className="mb-3" controlId="registerFullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Full Name"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerPhone">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="+254712345678"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerNationalId">
              <Form.Label>National ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="National ID"
                autoComplete="off"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                disabled={isLoading}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password (min 6 characters)"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </Form.Group>
            <div className="mb-3">
              <Form.Check
                type="checkbox"
                id="authCheck"
                label="Remember me"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Button type="submit" variant="primary" className="me-2 mb-2 mb-md-0 w-100" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner size="sm" animation="border" /> Signing up...
                  </>
                ) : (
                  'Sign up'
                )}
              </Button>
            </div>
            <p className="mt-3 text-secondary">
              Already have an account? <Link to="/auth/login">Sign in</Link>
            </p>
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default RegisterPage;
