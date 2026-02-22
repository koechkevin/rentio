import { Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useGetCurrentUserQuery, useAcceptTermsMutation } from '@/services/api/authApi';

const TermsAcceptanceBanner = () => {
  const { data: currentUserData } = useGetCurrentUserQuery();
  const [acceptTerms, { isLoading }] = useAcceptTermsMutation();

  const termsAcceptedAt = currentUserData?.data?.user?.termsAcceptedAt;

  if (termsAcceptedAt) {
    return null;
  }

  const handleAccept = async () => {
    await acceptTerms();
  };

  return (
    <Card className="mb-4 border-warning">
      <Card.Body>
        <div className="d-flex align-items-start">
          <div className="me-3">
            <ShieldAlert size={32} className="text-warning" />
          </div>
          <div className="flex-grow-1">
            <h6 className="mb-1">Terms & Conditions Acceptance Required</h6>
            <p className="text-muted mb-3">
              Please review and accept our{' '}
              <Link to="/terms" target="_blank">Terms & Conditions</Link>
              {' '}and{' '}
              <Link to="/tenant-terms" target="_blank">Tenant Terms</Link>
              {' '}to continue using Rentio.
            </p>
            <Button variant="warning" onClick={handleAccept} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Accepting...
                </>
              ) : (
                'Accept Terms'
              )}
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TermsAcceptanceBanner;
