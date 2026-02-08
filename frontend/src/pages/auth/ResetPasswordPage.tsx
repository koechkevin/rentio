import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { ShieldAlert, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useResetPasswordMutation } from '@/services/api/authApi';
import { jwtDecode } from 'jwt-decode';

const MySwal = withReactContent(Swal);

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [token, setToken] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const urlToken = searchParams.get('token');
      const urlCode = searchParams.get('code');

      if (!urlToken || !urlCode) {
        setError('Invalid reset link. Please request a new password reset.');
        setValidating(false);
        return;
      }

      try {
        // Decode JWT to check expiration (client-side validation)
        const decoded: any = jwtDecode(urlToken);
        if (!decoded) {
          setError('Invalid token. Please request a new password reset.');
          setValidating(false);
          return;
        }

        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          setError('Reset link has expired. Please request a new password reset.');
          setValidating(false);
          return;
        }

        // Check token type
        if (decoded.type !== 'password_reset') {
          setError('Invalid token type. Please request a new password reset.');
          setValidating(false);
          return;
        }

        setToken(urlToken);
        setVerificationCode(urlCode);
        setIsValidToken(true);
        setValidating(false);
      } catch (err) {
        setError('Invalid token. Please request a new password reset.');
        setValidating(false);
      }
    };

    validateToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const result = await resetPassword({
        token,
        verificationCode,
        newPassword,
      }).unwrap();

      await MySwal.fire({
        title: 'Success!',
        text: result.message,
        icon: 'success',
        confirmButtonText: 'Go to Login',
      });

      navigate('/auth/login', { replace: true });
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);

      // If token/code is invalid, show option to request new reset
      if (errorMessage.includes('Invalid') || errorMessage.includes('expired')) {
        await MySwal.fire({
          title: 'Reset Link Invalid',
          text: 'Your reset link is invalid or expired. Please request a new one.',
          icon: 'error',
          confirmButtonText: 'Request New Reset',
          showCancelButton: true,
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/auth/forgot-password');
          }
        });
      }
    }
  };

  if (validating) {
    return (
      <Row>
        <Col md={12} className="ps-md-0">
          <div className="px-5 py-5 text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Validating reset link...</p>
          </div>
        </Col>
      </Row>
    );
  }

  if (!isValidToken) {
    return (
      <Row>
        <Col md={12} className="ps-md-0">
          <div className="px-5 py-5">
            <Link to="/auth/login" className="nobleui-logo d-block mb-2">
              Rent<span>IO</span>
            </Link>
            <h4 className="mb-4">Invalid Reset Link</h4>
            <Alert variant="danger">
              <ShieldAlert className="me-2" size={22} />
              {error || 'The password reset link is invalid or has expired.'}
            </Alert>
            <div className="mt-4">
              <Link to="/auth/forgot-password">
                <Button variant="primary">Request New Reset</Button>
              </Link>
              <Link to="/auth/login" className="ms-2">
                <Button variant="link">Back to Login</Button>
              </Link>
            </div>
          </div>
        </Col>
      </Row>
    );
  }

  return (
    <Row>
      <Col md={12} className="ps-md-0">
        <div className="px-5 py-5">
          <Link to="/auth/login" className="nobleui-logo d-block mb-2">
            Rent<span>IO</span>
          </Link>
          <h4 className="mb-2">Reset Your Password</h4>
          <p className="mb-4 text-secondary">Enter your new password below.</p>

          <Form onSubmit={handleSubmit} autoComplete="off">
            {error && (
              <Alert variant="danger">
                <ShieldAlert className="me-2" size={22} />
                {error}
              </Alert>
            )}

            <Form.Group className="mb-3" controlId="verificationCode">
              <Form.Label>Verification Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter 6-digit code from email"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isLoading}
                maxLength={6}
              />
              <Form.Text className="text-muted">Check your email for the verification code</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>New Password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  variant="link"
                  className="position-absolute end-0 top-50 translate-middle-y"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ zIndex: 10 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              <Form.Text className="text-muted">Password must be at least 6 characters</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  variant="link"
                  className="position-absolute end-0 top-50 translate-middle-y"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ zIndex: 10 }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </Form.Group>

            <div>
              <Button type="submit" variant="primary" className="me-2 mb-2 mb-md-0" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner size="sm" animation="border" /> Resetting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} className="me-2" />
                    Reset Password
                  </>
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

export default ResetPasswordPage;
