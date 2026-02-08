import { useMemo } from 'react';
import { useAppSelector } from '@/store/store';
import { getMenuByRole } from '@/config/menu.config';
import { MenuItem } from '@/config/menu.config';
import { useCurrentProperty } from './useCurrentProperty';

export const useMenuConfig = (): MenuItem[] => {
  const { user } = useAppSelector((state) => state.auth);
  const { currentProperty } = useCurrentProperty();
  const userPropertyRoles = currentProperty?.userPropertyRoles?.map((upr) => upr.role) || ['USER'];
  const filteredMenu = useMemo(() => {
    if (!user) {
      return [];
    }

    // Get user's global role
    const userRoles = [user.globalRole];

    // If user has property-specific roles, add them too
    if (user.userPropertyRoles && user.userPropertyRoles.length > 0) {
      const propertyRoles = user.userPropertyRoles.map((pr) => pr.role);
      userRoles.push(...propertyRoles);
    }

    return getMenuByRole(userPropertyRoles);
  }, [user]);

  return filteredMenu;
};
