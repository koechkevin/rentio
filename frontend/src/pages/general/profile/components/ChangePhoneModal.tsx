import { useState } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import {
  useSendPhoneVerificationCodeMutation,
  useVerifyPhoneCodeMutation,
  useResendPhoneVerificationCodeMutation,
} from '../../../../services/api/authApi';

interface ChangePhoneModalProps {
  show: boolean;
  currentPhoneNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangePhoneModal = ({ show, currentPhoneNumber, onClose, onSuccess }: ChangePhoneModalProps) => {
  const [step, setStep] = useState<'phone' | 'method' | 'verify'>('phone');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [method, setMethod] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [sendCode, { isLoading: sendingCode }] = useSendPhoneVerificationCodeMutation();
  const [verifyCode, { isLoading: verifyingCode }] = useVerifyPhoneCodeMutation();
  const [resendCode, { isLoading: resendingCode }] = useResendPhoneVerificationCodeMutation();

  const loading = sendingCode || verifyingCode || resendingCode;

  const handlePhoneSubmit = () => {
    setError('');
    if (!newPhoneNumber || newPhoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    if (newPhoneNumber === currentPhoneNumber) {
      setError('New phone number must be different from current one');
      return;
    }
    setStep('method');
  };

  const handleSendCode = async () => {
    setError('');
    try {
      await sendCode({ phoneNumber: newPhoneNumber, method }).unwrap();
      setSuccess(`Verification code sent via ${method.toUpperCase()}`);
      setStep('verify');
    } catch (err: any) {
      setError(err.data?.message || 'Failed to send verification code');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setError('');
    try {
      await verifyCode({ phoneNumber: newPhoneNumber, verificationCode }).unwrap();
      setSuccess('Phone number changed and verified successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
        resetModal();
      }, 1500);
    } catch (err: any) {
      setError(err.data?.message || 'Invalid verification code');
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await resendCode({ phoneNumber: newPhoneNumber, method }).unwrap();
      setSuccess(`Verification code resent via ${method.toUpperCase()}`);
    } catch (err: any) {
      setError(err.data?.message || 'Failed to resend code');
    }
  };

  const resetModal = () => {
    setNewPhoneNumber('');
    setVerificationCode('');
    setError('');
    setSuccess('');
    setStep('phone');
    setMethod('whatsapp');
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        onClose();
        resetModal();
      }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Change Phone Number</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {step === 'phone' && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Current Phone Number</Form.Label>
              <Form.Control type="text" value={currentPhoneNumber} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="+254712345678"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                disabled={loading}
              />
              <small className="text-muted">Enter phone number in E.164 format (e.g., +254712345678)</small>
            </Form.Group>
          </>
        )}

        {step === 'method' && (
          <>
            <p className="text-muted mb-3">
              Send verification code to: <strong>{newPhoneNumber}</strong>
            </p>
            <Form.Group className="mb-3">
              <Form.Label>Choose verification method:</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  label="WhatsApp"
                  value="whatsapp"
                  checked={method === 'whatsapp'}
                  onChange={(e) => setMethod(e.target.value as 'whatsapp' | 'sms')}
                  id="change-method-whatsapp"
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  label="SMS"
                  value="sms"
                  checked={method === 'sms'}
                  onChange={(e) => setMethod(e.target.value as 'whatsapp' | 'sms')}
                  id="change-method-sms"
                />
              </div>
            </Form.Group>
          </>
        )}

        {step === 'verify' && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Enter verification code:</Form.Label>
              <Form.Control
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                maxLength={6}
                disabled={loading}
                className="text-center font-weight-bold"
                style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
              />
              <small className="text-muted d-block mt-2">Enter the 6-digit code sent to your new phone number</small>
            </Form.Group>
            <div className="text-center">
              <small className="text-muted">
                Didn't receive the code?{' '}
                <Button variant="link" size="sm" onClick={handleResend} disabled={loading} className="p-0">
                  Resend
                </Button>
              </small>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            onClose();
            resetModal();
          }}
        >
          Cancel
        </Button>

        {step === 'phone' && (
          <Button variant="primary" onClick={handlePhoneSubmit} disabled={loading || !newPhoneNumber}>
            Next
          </Button>
        )}

        {step === 'method' && (
          <>
            <Button variant="outline-secondary" onClick={() => setStep('phone')} disabled={loading}>
              Back
            </Button>
            <Button variant="primary" onClick={handleSendCode} disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" /> Sending...
                </>
              ) : (
                'Send Code'
              )}
            </Button>
          </>
        )}

        {step === 'verify' && (
          <Button variant="primary" onClick={handleVerifyCode} disabled={loading || verificationCode.length !== 6}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" /> Verifying...
              </>
            ) : (
              'Verify & Change'
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ChangePhoneModal;
