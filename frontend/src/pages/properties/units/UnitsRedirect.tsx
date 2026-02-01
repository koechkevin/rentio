import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useGetPropertiesQuery } from '../../../services/api/propertyApi';
import { setCurrentProperty } from '../../../store/slices/propertySlice';
import { RootState } from '../../../store/store';

const UnitsRedirect = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentPropertyId = useSelector((state: RootState) => state.property.currentPropertyId);
  const { data, isLoading, error } = useGetPropertiesQuery();

  useEffect(() => {
    if (currentPropertyId) {
      // If there's a current property in store/localStorage, redirect to its units
      navigate(`/properties/${currentPropertyId}/units`, { replace: true });
    } else if (data?.data && data.data.length > 0) {
      // Otherwise, get the first property and set it as current
      const firstPropertyId = data.data[0].id;
      dispatch(setCurrentProperty(firstPropertyId));
      navigate(`/properties/${firstPropertyId}/units`, { replace: true });
    }
  }, [currentPropertyId, data, navigate, dispatch]);

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="text-muted">Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Error loading properties</Alert.Heading>
          <p>Failed to fetch properties. Please try again.</p>
          <Button variant="outline-danger" onClick={() => navigate('/properties')}>
            Go to Properties
          </Button>
        </Alert>
      </div>
    );
  }

  if (data?.data && data.data.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Alert variant="info" className="text-center">
          <Alert.Heading>No Properties Found</Alert.Heading>
          <p>You need to create a property first before managing units.</p>
          <Button variant="primary" onClick={() => navigate('/properties/add')}>
            Create Property
          </Button>
        </Alert>
      </div>
    );
  }

  return null;
};

export default UnitsRedirect;
