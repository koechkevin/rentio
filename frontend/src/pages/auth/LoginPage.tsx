import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { ShieldAlert } from 'lucide-react';
import { useLoginMutation } from '@/services/api/authApi';
import { useAppDispatch } from '@/store/store';
import { setCredentials } from '@/store/slices/authSlice';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await login({ phone, password }).unwrap();

      dispatch(
        setCredentials({
          user: result.data.user,
          token: result.data.token,
          refreshToken: result.data.refreshToken,
        })
      );

      if (remember) {
        localStorage.setItem('remember', 'true');
      } else {
        localStorage.removeItem('remember');
      }

      navigate('/');
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <Row>
      <Col md={12}>
        <div className="px-5 py-5">
          <Link to="." className="nobleui-logo d-block mb-2">
            Rent<span>IO</span>
          </Link>
          <h5 className="text-secondary fw-normal mb-4">Welcome back! Log in to your account.</h5>
          <Form onSubmit={handleSubmit} autoComplete="on">
            {error && (
              <Alert variant="danger">
                <ShieldAlert className="me-2" size={22} />
                {error}
              </Alert>
            )}
            <Form.Group className="mb-3" controlId="loginPhone">
              <Form.Label>Phone number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Phone"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </Form.Group>
            <div className="d-flex mb-3 align-items-center">
              <Form.Check
                type="checkbox"
                id="authCheck"
                label="Remember me"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={isLoading}
              />
              <Link to="/auth/forgot-password" className="ms-auto">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" variant="primary" className="me-2 mb-2 mb-md-0 w-100" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" animation="border" /> Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
            <p className="mt-3 text-secondary">
              Don't have an account? <Link to="/auth/register">Sign up</Link>
            </p>
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default LoginPage;
