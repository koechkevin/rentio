import { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert, Spinner, InputGroup, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCreatePropertyMutation } from '../../services/api/propertyApi';
import L from 'leaflet';

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

const CreateProperty = () => {
  const navigate = useNavigate();
  const [createProperty, { isLoading, isSuccess, error }] = useCreatePropertyMutation();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    county: '',
    town: '',
    gpsLatitude: -1.286389,
    gpsLongitude: 36.817223,
    ownerProvidedIdentifier: '',
  });

  const [markerPosition, setMarkerPosition] = useState<LatLng | null>(new LatLng(-1.286389, 36.817223));
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
      await createProperty({
        name: formData.name,
        slug: formData.slug,
        county: formData.county,
        town: formData.town,
        gpsLatitude: formData.gpsLatitude,
        gpsLongitude: formData.gpsLongitude,
        ownerProvidedIdentifier: formData.ownerProvidedIdentifier || undefined,
      }).unwrap();
    } catch (err) {
      console.error('Failed to create property:', err);
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

  return (
    <div>
      <Row>
        <Col xs={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Add New Property</h4>
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
                  Property created successfully! Redirecting...
                </Alert>
              )}

              {error && <Alert variant="danger">Failed to create property. Please try again.</Alert>}

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
                        Creating...
                      </>
                    ) : (
                      'Create Property'
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
              <p className="text-muted small mb-3">Click on the map to set the property location</p>
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
    </div>
  );
};

export default CreateProperty;
