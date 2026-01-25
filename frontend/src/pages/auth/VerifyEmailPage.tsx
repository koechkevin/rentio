import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import { useVerifyEmailMutation, useResendVerificationMutation } from '@/services/api/authApi';
import { useAppDispatch } from '@/store/store';
import { setEmailVerified } from '@/store/slices/authSlice';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  const email = location.state?.email || '';
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Resend timer countdown
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0 && !canResend && email) {
      setCanResend(true);
    }
  }, [resendTimer, canResend, email]);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      const result = await verifyEmail({
        email,
        verificationCode,
      }).unwrap();

      setSuccess('Email verified successfully!');
      setIsVerified(true);

      // Store credentials and redirect
      dispatch(
        setEmailVerified({
          user: result.data.user,
          token: result.data.token,
        })
      );

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.message || 'Verification failed. Please try again.';
      setError(errorMessage);
    }
  };

  const handleResend = async () => {
    setError(null);
    setSuccess(null);

    try {
      await resendVerification({ email }).unwrap();
      setSuccess('Verification code sent to your email!');
      setCanResend(false);
      setResendTimer(60); // 60 second cooldown
      setVerificationCode('');
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.message || 'Failed to resend code. Please try again.';
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
          <h5 className="text-secondary fw-normal mb-4">Verify your email address</h5>
          <p className="text-secondary mb-4">
            We've sent a verification code to <strong>{email}</strong>
          </p>
          <Form onSubmit={handleVerify} autoComplete="off">
            {error && (
              <Alert variant="danger">
                <ShieldAlert className="me-2" size={22} />
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success">
                <CheckCircle className="me-2" size={22} />
                {success}
              </Alert>
            )}
            {isVerified && <Alert variant="info">Redirecting you to dashboard...</Alert>}
            <Form.Group className="mb-3" controlId="verificationCode">
              <Form.Label>Verification Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                disabled={isVerifying || isVerified}
                required
                inputMode="numeric"
              />
              <Form.Text className="text-muted">Enter the 6-digit code sent to your email</Form.Text>
            </Form.Group>
            <div>
              <Button
                type="submit"
                variant="primary"
                className="me-2 mb-2 mb-md-0 w-100"
                disabled={isVerifying || isVerified}
              >
                {isVerifying ? (
                  <>
                    <Spinner size="sm" animation="border" /> Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </div>
            <div className="mt-3">
              <p className="text-secondary">
                Didn't receive a code?{' '}
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={handleResend}
                  disabled={!canResend || isResending}
                >
                  {isResending ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Sending...
                    </>
                  ) : canResend ? (
                    'Resend'
                  ) : (
                    `Resend in ${resendTimer}s`
                  )}
                </button>
              </p>
            </div>
            <p className="mt-3 text-secondary">
              <Link to="/auth/login">Back to login</Link>
            </p>
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default VerifyEmailPage;
