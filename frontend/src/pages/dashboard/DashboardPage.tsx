import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button, Row, Card, Col, ButtonGroup } from 'react-bootstrap';
import CustomersChart from './components/CustomersChart';
import OrdersChart from './components/OrdersChart';
import GrowthChart from './components/GrowthChart';
import CardActionsDropdown from './components/CardActionsDropdown';
import RevenueChart from './components/RevenueChart';
import SalesChart from './components/SalesChart';
import IssuesStats from './components/IssuesStats';
import RecentUnitActivity from './components/RecentUnitActivity';
import RecentIssuesTable from './components/RecentIssuesTable';
import { useGetPropertiesQuery } from '../../services/api/propertyApi';
import OnboardingBanner from '../../components/OnboardingBanner';
import TenantDashboardBanner from '../../components/TenantDashboardBanner';
import PropertySelector from '../../components/PropertySelector';
import { useAppSelector } from '../../store/store';
import PropertyStats from './components/PropertyStats';

const DashboardPage = () => {
  const { data: propertiesData, isLoading: isLoadingProperties } = useGetPropertiesQuery();
  const properties = propertiesData?.data || [];
  const hasNoProperties = !isLoadingProperties && properties.length === 0;
  const currentPropertyId = useAppSelector((state) => state.property.currentPropertyId);

  return (
    <>
      {hasNoProperties && (
        <>
          <OnboardingBanner />
          <TenantDashboardBanner />
        </>
      )}

      {!hasNoProperties && (
        <>
          <Row className="mb-4">
            <Col xs={12}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-1">Dashboard</h4>
                  <p className="text-muted mb-0">Welcome back! Here's what's happening with your properties.</p>
                </div>
                <PropertySelector />
              </div>
            </Col>
          </Row>

          {currentPropertyId && <PropertyStats />}

          <Row>
            <Col lg={7} xl={8} className="grid-margin stretch-card">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-baseline mb-3">
                    <Card.Title className="mb-0">Monthly Payments</Card.Title>
                    <CardActionsDropdown />
                  </div>
                  <p className="text-secondary">Cumulative payments received per month for the current year.</p>
                  <SalesChart />
                </Card.Body>
              </Card>
            </Col>

            <Col lg={5} xl={4} className="grid-margin stretch-card">
              {currentPropertyId && <IssuesStats propertyId={currentPropertyId} />}
            </Col>
          </Row>

          <Row>
            <Col lg={5} xl={4} className="grid-margin grid-margin-lg-0 stretch-card">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-baseline mb-3">
                    <Card.Title className="mb-0">Recent Unit Activity</Card.Title>
                    <CardActionsDropdown />
                  </div>
                  {currentPropertyId && <RecentUnitActivity propertyId={currentPropertyId} />}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={7} xl={8} className="stretch-card">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-baseline mb-3">
                    <Card.Title className="mb-0">Recent Issues</Card.Title>
                    <CardActionsDropdown />
                  </div>
                  {currentPropertyId && <RecentIssuesTable propertyId={currentPropertyId} />}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default DashboardPage;
