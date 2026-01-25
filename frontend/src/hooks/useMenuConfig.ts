import { useMemo } from 'react';
import { useAppSelector } from '@/store/store';
import { getMenuByRole } from '@/config/menu.config';
import { MenuItem } from '@/config/menu.config';

export const useMenuConfig = (): MenuItem[] => {
  const { user } = useAppSelector((state) => state.auth);

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

    return getMenuByRole(userRoles);
  }, [user]);

  return filteredMenu;
};
