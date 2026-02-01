import { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert, Spinner, InputGroup, ListGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGetPropertyQuery, useUpdatePropertyMutation } from '../../services/api/propertyApi';
import L from 'leaflet';
import ImageUploader from '../../components/ImageUploader';
import { Card as BCard, Table, Badge as BBadge } from 'react-bootstrap';
import { useGetUnitsQuery } from '../../services/api/unitApi';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: import('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: import('leaflet/dist/images/marker-icon.png'),
  shadowUrl: import('leaflet/dist/images/marker-shadow.png'),
});

interface FormData {
  name: string;
  slug: string;
  county: string;
  town: string;
  gpsLatitude: number;
  gpsLongitude: number;
  ownerProvidedIdentifier: string;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const MapClickHandler = ({ onLocationSelect }: MapClickHandlerProps) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const EditProperty = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const { data: propertyData, isLoading: isLoadingProperty } = useGetPropertyQuery(propertyId!, { skip: !propertyId });
  const [updateProperty, { isLoading, isSuccess, error }] = useUpdatePropertyMutation();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    county: '',
    town: '',
    gpsLatitude: -1.286389,
    gpsLongitude: 36.817223,
    ownerProvidedIdentifier: '',
  });

  const [markerPosition, setMarkerPosition] = useState<LatLng | null>(null);
  const [validated, setValidated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-1.286389, 36.817223]);

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Load property data
  useEffect(() => {
    if (propertyData?.data) {
      const property = propertyData.data;
      setFormData({
        name: property.name,
        slug: property.slug,
        county: property.county,
        town: property.town,
        gpsLatitude: property.gpsLatitude,
        gpsLongitude: property.gpsLongitude,
        ownerProvidedIdentifier: property.ownerProvidedIdentifier || '',
      });
      setMarkerPosition(new LatLng(property.gpsLatitude, property.gpsLongitude));
      setMapCenter([property.gpsLatitude, property.gpsLongitude]);
    }
  }, [propertyData]);

  useEffect(() => {
    if (formData.name) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.name),
      }));
    }
  }, [formData.name]);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/properties');
      }, 2000);
    }
  }, [isSuccess, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      gpsLatitude: lat,
      gpsLongitude: lng,
    }));
    setMarkerPosition(new LatLng(lat, lng));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      await updateProperty({
        id: propertyId!,
        data: {
          name: formData.name,
          slug: formData.slug,
          county: formData.county,
          town: formData.town,
          gpsLatitude: formData.gpsLatitude,
          gpsLongitude: formData.gpsLongitude,
          ownerProvidedIdentifier: formData.ownerProvidedIdentifier || undefined,
        },
      }).unwrap();
    } catch (err) {
      console.error('Failed to update property:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    handleLocationSelect(lat, lng);
    setMapCenter([lat, lng]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const { data: unitsData, isLoading: isLoadingUnits } = useGetUnitsQuery(propertyId!, { skip: !propertyId });
  const units = unitsData?.data || [];

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

  if (isLoadingProperty) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }
  return (
    <div>
      <Row>
        <Col xs={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Edit Property</h4>
            <Button variant="secondary" onClick={() => navigate('/properties')}>
              Back to Properties
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              <Card.Title className="mb-4">Property Details</Card.Title>

              {showSuccess && (
                <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
                  Property updated successfully! Redirecting...
                </Alert>
              )}

              {error && <Alert variant="danger">Failed to update property. Please try again.</Alert>}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Property Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter property name"
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please provide a property name.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Slug</Form.Label>
                      <Form.Control
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="auto-generated-from-name"
                        readOnly
                      />
                      <Form.Text className="text-muted">Auto-generated from property name</Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>County *</Form.Label>
                      <Form.Control
                        type="text"
                        name="county"
                        value={formData.county}
                        onChange={handleInputChange}
                        placeholder="Enter county"
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please provide a county.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Town *</Form.Label>
                      <Form.Control
                        type="text"
                        name="town"
                        value={formData.town}
                        onChange={handleInputChange}
                        placeholder="Enter town"
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please provide a town.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Owner Provided Identifier</Form.Label>
                  <Form.Control
                    type="text"
                    name="ownerProvidedIdentifier"
                    value={formData.ownerProvidedIdentifier}
                    onChange={handleInputChange}
                    placeholder="Enter custom identifier (optional)"
                  />
                  <Form.Text className="text-muted">Optional custom reference number or code</Form.Text>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Latitude *</Form.Label>
                      <Form.Control
                        type="number"
                        name="gpsLatitude"
                        value={formData.gpsLatitude}
                        onChange={handleInputChange}
                        step="any"
                        required
                        readOnly
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Longitude *</Form.Label>
                      <Form.Control
                        type="number"
                        name="gpsLongitude"
                        value={formData.gpsLongitude}
                        onChange={handleInputChange}
                        step="any"
                        required
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {propertyId && (
                  <div className="mb-3">
                    <Form.Label>Property Images</Form.Label>
                    <ImageUploader entityType="PROPERTY" entityId={propertyId} maxFiles={15} />
                  </div>
                )}

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button variant="secondary" onClick={() => navigate('/properties')} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Updating...
                      </>
                    ) : (
                      'Update Property'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Body>
              <Card.Title className="mb-3">Select Location</Card.Title>
              <Form.Group className="mb-3">
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                  />
                  <Button variant="primary" onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? <Spinner animation="border" size="sm" /> : 'Search'}
                  </Button>
                </InputGroup>
              </Form.Group>

              {searchResults.length > 0 && (
                <ListGroup className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {searchResults.map((result) => (
                    <ListGroup.Item
                      key={result.place_id}
                      action
                      onClick={() => handleSelectSearchResult(result)}
                      style={{ cursor: 'pointer' }}
                    >
                      <small>{result.display_name}</small>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}

              <p className="text-muted small mb-3">Search or click on the map to update the property location</p>
              <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  key={mapCenter.join(',')}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapClickHandler onLocationSelect={handleLocationSelect} />
                  {markerPosition && <Marker position={markerPosition} />}
                </MapContainer>
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  <strong>Current Location:</strong>
                  <br />
                  Lat: {formData.gpsLatitude.toFixed(6)}
                  <br />
                  Lng: {formData.gpsLongitude.toFixed(6)}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Units Section */}
      {propertyId && (
        <Row className="mt-4">
          <Col xs={12}>
            <BCard>
              <BCard.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="mb-1">Property Units</h5>
                    <p className="text-muted mb-0 small">Manage units for this property</p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => navigate(`/properties/${propertyId}/units/add`)}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Unit
                  </Button>
                </div>

                {isLoadingUnits ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                    <p className="text-muted mt-2 mb-0">Loading units...</p>
                  </div>
                ) : units.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-door-closed" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                    <h6 className="mt-3">No units found</h6>
                    <p className="text-muted mb-3">Get started by adding your first unit to this property</p>
                    <Button variant="primary" size="sm" onClick={() => navigate(`/properties/${propertyId}/units/add`)}>
                      Add Unit
                    </Button>
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
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {units.slice(0, 5).map((unit: any) => (
                            <tr key={unit.id}>
                              <td>
                                <strong>{unit.unitNumber}</strong>
                              </td>
                              <td>
                                <BBadge bg={getUnitTypeBadge(unit.type)}>{formatUnitType(unit.type)}</BBadge>
                              </td>
                              <td>{unit.floor}</td>
                              <td>KES {unit.monthlyRent.toLocaleString()}</td>
                              <td>
                                <BBadge bg={unit.isOccupied ? 'success' : 'secondary'}>
                                  {unit.isOccupied ? 'Occupied' : 'Vacant'}
                                </BBadge>
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
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    {units.length > 5 && (
                      <div className="text-center mt-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/properties/${propertyId}/units`)}
                        >
                          View All Units ({units.length})
                        </Button>
                      </div>
                    )}
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid #dee2e6' }}>
                      <Row>
                        <Col xs={4}>
                          <small className="text-muted">Total Units</small>
                          <h6>{units.length}</h6>
                        </Col>
                        <Col xs={4}>
                          <small className="text-muted">Occupied</small>
                          <h6 className="text-success">{units.filter((u: any) => u.isOccupied).length}</h6>
                        </Col>
                        <Col xs={4}>
                          <small className="text-muted">Vacant</small>
                          <h6 className="text-warning">{units.filter((u: any) => !u.isOccupied).length}</h6>
                        </Col>
                      </Row>
                    </div>
                  </>
                )}
              </BCard.Body>
            </BCard>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default EditProperty;
