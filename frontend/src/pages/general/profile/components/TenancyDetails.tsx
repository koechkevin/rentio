import { Card, Badge } from 'react-bootstrap';
import { useGetTenancyAgreementQuery } from '../../../../services/api/userProfileApi';

interface Props {
  userId: string;
}

const TenancyDetails = ({ userId }: Props) => {
  const { data: tenancy, isLoading } = useGetTenancyAgreementQuery(userId);

  if (isLoading || !tenancy) return null;

  return (
    <Card>
      <Card.Body>
        <Card.Title>
          Tenancy Details
          <Badge bg={tenancy.status === 'active' ? 'success' : 'danger'} className="ms-2">
            {tenancy.status}
          </Badge>
        </Card.Title>
        <div className="mb-3">
          <strong>Rent Amount:</strong> ${tenancy.rentAmount} / {tenancy.rentFrequency}
        </div>
        <div className="mb-3">
          <strong>Start Date:</strong> {new Date(tenancy.startDate).toLocaleDateString()}
        </div>
        <div>
          <strong>End Date:</strong> {new Date(tenancy.endDate).toLocaleDateString()}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TenancyDetails;
