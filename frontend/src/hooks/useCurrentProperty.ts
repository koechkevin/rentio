import { useAppSelector } from '../store/store';
import { useGetPropertiesQuery } from '../services/api/propertyApi';

export const useCurrentProperty = () => {
  const currentPropertyId = useAppSelector((state) => state.property.currentPropertyId);
  const { data: propertiesData, isLoading } = useGetPropertiesQuery();
  const properties = propertiesData?.data || [];

  const currentProperty = properties.find((p) => p.id === currentPropertyId);

  return {
    currentPropertyId,
    currentProperty,
    properties,
    isLoading,
    hasProperties: properties.length > 0,
  };
};
