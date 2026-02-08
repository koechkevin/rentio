import { Form } from 'react-bootstrap';
import { useGetPropertiesQuery } from '../services/api/propertyApi';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setCurrentProperty } from '../store/slices/propertySlice';
import { Building2 } from 'lucide-react';
import { useThemeMode } from '../contexts/ThemeModeContext';
import { useEffect } from 'react';

const PropertySelector = () => {
  const dispatch = useAppDispatch();
  const { themeMode } = useThemeMode();
  const currentPropertyId = useAppSelector((state) => state.property.currentPropertyId);
  const { data: propertiesData, isLoading } = useGetPropertiesQuery();
  const properties = propertiesData?.data || [];

  // Set first property as default if none selected
  useEffect(() => {
    if (!isLoading && properties.length > 0 && !currentPropertyId) {
      dispatch(setCurrentProperty(properties[0].id));
    }
  }, [isLoading, properties, currentPropertyId, dispatch]);

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setCurrentProperty(e.target.value));
  };

  if (isLoading) {
    return (
      <div className="d-flex align-items-center">
        <div className="spinner-border spinner-border-sm me-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="text-muted">Loading properties...</span>
      </div>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  if (properties.length === 1) {
    return (
      <div className={`d-flex align-items-center px-3 py-2 rounded ${themeMode === 'dark' ? 'bg-dark' : 'bg-light'}`}>
        <Building2 size={18} className="me-2 text-primary" />
        <span className="fw-bold">{properties[0].name}</span>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center">
      <Building2 size={18} className="me-2 text-primary" />
      <Form.Select
        value={currentPropertyId || ''}
        onChange={handlePropertyChange}
        className="form-select-sm"
        style={{ minWidth: '200px', maxWidth: '300px' }}
      >
        {properties.map((property) => (
          <option key={property.id} value={property.id}>
            {property.name}
          </option>
        ))}
      </Form.Select>
    </div>
  );
};

export default PropertySelector;
