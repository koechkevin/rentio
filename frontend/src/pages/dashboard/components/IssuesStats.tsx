import { Card, Row, Col } from 'react-bootstrap';
import { CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { useGetPropertyMetricsQuery } from '../../../services/api/dashboardApi';

interface IssuesStatsProps {
  propertyId: string;
}

const IssuesStats = ({ propertyId }: IssuesStatsProps) => {
  const { data, isLoading } = useGetPropertyMetricsQuery(propertyId);
  const issuesStats = data?.data?.issuesStats;

  if (isLoading) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center">Loading...</div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-baseline mb-2">
          <Card.Title className="mb-0">Issues Status</Card.Title>
        </div>

        <Row>
          <Col xs={12} className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <span className="text-muted">Open Issues</span>
                <h4 className="mb-0">{issuesStats?.open || 0}</h4>
              </div>
              <XCircle className="text-danger" size={32} />
            </div>
          </Col>
          <Col xs={12} className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <span className="text-muted">Resolved</span>
                <h4 className="mb-0">{issuesStats?.closed || 0}</h4>
              </div>
              <CheckCircle className="text-success" size={32} />
            </div>
          </Col>
          <Col xs={12}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted">Resolution Rate</span>
                <h4 className="mb-0">{issuesStats?.percentage?.toFixed(1) || 0}%</h4>
              </div>
              <TrendingUp className="text-primary" size={32} />
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default IssuesStats;
