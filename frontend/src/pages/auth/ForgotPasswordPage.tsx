import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useForgotPasswordMutation } from '@/services/api/authApi';

const MySwal = withReactContent(Swal);

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      const result = await forgotPassword({ email }).unwrap();
      await MySwal.fire({
        title: 'Success!',
        text: result.message,
        icon: 'success',
        confirmButtonText: 'OK',
      });
      navigate('/auth/login', { replace: true });
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to send reset email. Please try again.');
    }
  };

  return (
    <Row>
      <Col md={12} className="ps-md-0">
        <div className="px-5 py-5">
          <Link to="/auth/login" className="nobleui-logo d-block mb-2">
            Rent<span>IO</span>
          </Link>
          <h4 className="mb-4">Forgot your password?</h4>
          <p className="mb-4 text-secondary">
            Enter your email address and we'll send you instructions for resetting your password.
          </p>
          <Form onSubmit={handleSubmit} autoComplete="on">
            {error && (
              <Alert variant="danger">
                <ShieldAlert className="me-2" size={22} />
                {error}
              </Alert>
            )}
            <Form.Group className="mb-3" controlId="forgotPasswordEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email address"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </Form.Group>
            <div>
              <Button type="submit" variant="primary" className="me-2 mb-2 mb-md-0" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner size="sm" animation="border" /> Sending...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
              <Link to="/auth/login">
                <Button variant="link">Back to Login</Button>
              </Link>
            </div>
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default ForgotPasswordPage;
