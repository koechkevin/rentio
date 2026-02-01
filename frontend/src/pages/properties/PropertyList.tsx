import { useState } from 'react';
import { Row, Col, Card, Table, Badge, Button, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useGetPropertiesQuery, type Property } from '../../services/api/propertyApi';

const PropertyList = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetPropertiesQuery();
  const properties = data?.data ?? [];
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter properties based on search term
  const filteredProperties =
    properties?.filter(
      (property) =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.town.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.ownerProvidedIdentifier?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Calculate pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
        <Alert.Heading>Error loading properties</Alert.Heading>
        <p>Failed to fetch properties. Please try again later.</p>
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
              <h4 className="mb-1">Properties</h4>
              <p className="text-muted mb-0">Manage all your properties</p>
            </div>
            <Button variant="primary" onClick={() => navigate('/properties/add')}>
              <i className="bi bi-plus-circle me-2"></i>
              Add Property
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
                      placeholder="Search properties by name, town, county, or identifier..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </InputGroup>
                </Col>
                <Col md={6} className="text-end">
                  <p className="mb-0 text-muted">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredProperties.length)} of{' '}
                    {filteredProperties.length} properties
                  </p>
                </Col>
              </Row>

              {currentProperties.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-building" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                  <h5 className="mt-3">No properties found</h5>
                  <p className="text-muted">
                    {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first property'}
                  </p>
                  {!searchTerm && (
                    <Button variant="primary" onClick={() => navigate('/properties/add')}>
                      Add Property
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Property Name</th>
                          <th>Identifier</th>
                          <th>Location</th>
                          <th>Currency</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProperties.map((property: Property) => (
                          <tr key={property.id}>
                            <td>
                              <div>
                                <strong>{property.name}</strong>
                                <br />
                                <small className="text-muted">{property.slug}</small>
                              </div>
                            </td>
                            <td>{property.ownerProvidedIdentifier || '-'}</td>
                            <td>
                              {property.town}, {property.county}
                              <br />
                              <small className="text-muted">
                                {property.gpsLatitude.toFixed(4)}, {property.gpsLongitude.toFixed(4)}
                              </small>
                            </td>
                            <td>
                              <Badge bg="secondary">{property.baseCurrency}</Badge>
                            </td>
                            <td>
                              <Badge bg={property.isMarketable ? 'success' : 'warning'}>
                                {property.isMarketable ? 'Marketable' : 'Not Marketable'}
                              </Badge>
                            </td>
                            <td>{formatDate(property.createdAt)}</td>
                            <td>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => navigate(`/properties/${property.id}/edit`)}
                                className="p-0 me-2"
                              >
                                View
                              </Button>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => navigate(`/properties/${property.id}/units`)}
                                className="p-0 me-2"
                              >
                                Units
                              </Button>
                            </td>
                          </tr>
                        ))}
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

export default PropertyList;
