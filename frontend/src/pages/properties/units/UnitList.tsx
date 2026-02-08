import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router';
import { useGetUnitsQuery, type Unit } from '../../../services/api/unitApi';
import { useDispatch } from 'react-redux';
import { setCurrentProperty } from '../../../store/slices/propertySlice';

const UnitList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { propertyId } = useParams<{ propertyId: string }>();
  const { data, isLoading, error, refetch } = useGetUnitsQuery(propertyId!, { skip: !propertyId });
  const units = data?.data ?? [];

  useEffect(() => {
    if (propertyId) {
      dispatch(setCurrentProperty(propertyId));
    }
  }, [propertyId, dispatch]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUnits = units.filter(
    (unit) =>
      unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUnits = filteredUnits.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getUnitTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      BEDSITTER: 'primary',
      ONE_BEDROOM: 'info',
      TWO_BEDROOM: 'success',
      THREE_BEDROOM: 'warning',
      SHOP: 'secondary',
      OFFICE: 'dark',
      OTHER: 'light',
    };
    return colors[type] || 'secondary';
  };

  const formatUnitType = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  const getActiveLease = (unit: Unit) => {
    return unit.leases?.find((lease) => lease.active);
  };

  const isUnitOccupied = (unit: Unit) => {
    return !!getActiveLease(unit);
  };

  const getCurrentOccupant = (unit: Unit) => {
    const activeLease = getActiveLease(unit);
    return activeLease?.user.fullName || null;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <Button key="first" size="sm" variant="outline-primary" onClick={() => handlePageChange(1)} className="me-1">
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          size="sm"
          variant={i === currentPage ? 'primary' : 'outline-primary'}
          onClick={() => handlePageChange(i)}
          className="me-1"
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2">
            ...
          </span>
        );
      }
      pages.push(
        <Button
          key="last"
          size="sm"
          variant="outline-primary"
          onClick={() => handlePageChange(totalPages)}
          className="me-1"
        >
          {totalPages}
        </Button>
      );
    }

    return <div className="d-flex justify-content-center align-items-center mt-3">{pages}</div>;
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error loading units</Alert.Heading>
        <p>Failed to fetch units. Please try again later.</p>
        <Button variant="outline-danger" onClick={() => refetch()}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div>
      <Row>
        <Col xs={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <Button variant="link" className="p-0 mb-2" onClick={() => navigate('/properties')}>
                <i className="bi bi-arrow-left me-2"></i>Back to Properties
              </Button>
              <h4 className="mb-1">Property Units</h4>
              <p className="text-muted mb-0">Manage units for this property</p>
            </div>
            <Button variant="primary" onClick={() => navigate(`/properties/${propertyId}/units/add`)}>
              <i className="bi bi-plus-circle me-2"></i>
              Add Unit
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search units by number or type..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </InputGroup>
                </Col>
                <Col md={6} className="text-end">
                  <p className="mb-0 text-muted">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredUnits.length)} of {filteredUnits.length}{' '}
                    units
                  </p>
                </Col>
              </Row>

              {currentUnits.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-door-closed" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                  <h5 className="mt-3">No units found</h5>
                  <p className="text-muted">
                    {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first unit'}
                  </p>
                  {!searchTerm && (
                    <Button variant="primary" onClick={() => navigate(`/properties/${propertyId}/units/add`)}>
                      Add Unit
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Unit Number</th>
                          <th>Type</th>
                          <th>Floor</th>
                          <th>Monthly Rent</th>
                          <th>Occupancy Status</th>
                          <th>Current Occupant</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUnits.map((unit: Unit) => {
                          const occupied = isUnitOccupied(unit);
                          const occupant = getCurrentOccupant(unit);

                          return (
                            <tr key={unit.id}>
                              <td>
                                <strong>{unit.unitNumber}</strong>
                              </td>
                              <td>
                                <Badge bg={getUnitTypeBadge(unit.type)}>{formatUnitType(unit.type)}</Badge>
                              </td>
                              <td>{unit.floor}</td>
                              <td>KES {unit.monthlyRent.toLocaleString()}</td>
                              <td>
                                <Badge bg={occupied ? 'success' : 'secondary'}>
                                  {occupied ? 'Occupied' : 'Vacant'}
                                </Badge>
                              </td>
                              <td>
                                {occupant ? (
                                  <span>{occupant}</span>
                                ) : (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0"
                                    onClick={() => navigate(`/properties/${propertyId}/units/${unit.id}/add-tenant`)}
                                  >
                                    <i className="bi bi-person-plus me-1"></i>
                                    Add Tenant
                                  </Button>
                                )}
                              </td>
                              <td>
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => navigate(`/properties/${propertyId}/units/${unit.id}/edit`)}
                                  className="p-0"
                                >
                                  Edit
                                </Button>
                                <Link to={`/finance/invoices/create?unitId=${unit.id}`} className="p-0 ms-2">
                                  Invoice
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                  {renderPagination()}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UnitList;
