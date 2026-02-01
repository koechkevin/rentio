import { Alert, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';

const OnboardingBanner = () => {
  const navigate = useNavigate();

  return (
    <Card className="mb-4 border-primary">
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-start">
            <div className="me-3">
              <Building2 size={48} className="text-primary" />
            </div>
            <div>
              <h5 className="mb-2">Welcome! Get Started with Your First Property</h5>
              <p className="text-muted mb-3">
                Start managing your properties efficiently. Add your first property to begin tracking units, tenants,
                and payments.
              </p>
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={() => navigate('/properties/add')}>
                  <Building2 size={16} className="me-2" />
                  Add Your First Property
                  <ArrowRight size={16} className="ms-2" />
                </Button>
                <Button variant="outline-secondary" onClick={() => navigate('/properties')}>
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default OnboardingBanner;
