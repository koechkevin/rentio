import { useState } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import {
  useSendPhoneVerificationCodeMutation,
  useVerifyPhoneCodeMutation,
  useResendPhoneVerificationCodeMutation,
} from '../../../../services/api/authApi';

interface PhoneVerificationModalProps {
  show: boolean;
  phoneNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PhoneVerificationModal = ({ show, phoneNumber, onClose, onSuccess }: PhoneVerificationModalProps) => {
  const [method, setMethod] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'method' | 'verify'>('method');

  const [sendCode, { isLoading: sendingCode }] = useSendPhoneVerificationCodeMutation();
  const [verifyCode, { isLoading: verifyingCode }] = useVerifyPhoneCodeMutation();
  const [resendCode, { isLoading: resendingCode }] = useResendPhoneVerificationCodeMutation();

  const loading = sendingCode || verifyingCode || resendingCode;

  const handleSendCode = async () => {
    setError('');
    try {
      const result = await sendCode({ phoneNumber, method }).unwrap();
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
      await verifyCode({ phoneNumber, verificationCode }).unwrap();
      setSuccess('Phone number verified successfully!');
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
      await resendCode({ phoneNumber, method }).unwrap();
      setSuccess(`Verification code resent via ${method.toUpperCase()}`);
    } catch (err: any) {
      setError(err.data?.message || 'Failed to resend code');
    }
  };

  const resetModal = () => {
    setVerificationCode('');
    setError('');
    setSuccess('');
    setStep('method');
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
        <Modal.Title>Verify Phone Number</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {step === 'method' ? (
          <>
            <p className="text-muted mb-3">
              Send verification code to: <strong>{phoneNumber}</strong>
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
                  id="method-whatsapp"
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  label="SMS"
                  value="sms"
                  checked={method === 'sms'}
                  onChange={(e) => setMethod(e.target.value as 'whatsapp' | 'sms')}
                  id="method-sms"
                />
              </div>
            </Form.Group>
          </>
        ) : (
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
              <small className="text-muted d-block mt-2">Enter the 6-digit code sent to your phone</small>
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
        {step === 'method' ? (
          <Button variant="primary" onClick={handleSendCode} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" /> Sending...
              </>
            ) : (
              'Send Code'
            )}
          </Button>
        ) : (
          <Button variant="primary" onClick={handleVerifyCode} disabled={loading || verificationCode.length !== 6}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" /> Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PhoneVerificationModal;
