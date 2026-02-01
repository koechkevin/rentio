import { AppRoutes } from '@/routes/AppRoutes';
import { GlobalErrorBoundary } from '@/components/error-boundaries';
import { ThemeModeProvider } from '@/contexts/ThemeModeContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { useEffect } from 'react';
import { useGetCurrentUserQuery } from './services/api/authApi';
import { useAppDispatch } from './store/store';
import { setUser } from './store/slices/authSlice';

const App = () => {
  const dispatch = useAppDispatch();
  const token = localStorage.getItem('token');

  const { data: currentUser } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (currentUser?.data) {
      dispatch(
        setUser({
          ...currentUser.data.user,
          userPropertyRoles: currentUser.data.userPropertyRoles,
        })
      );
    }
  }, [currentUser, dispatch]);

  return (
    <GlobalErrorBoundary>
      <ThemeModeProvider>
        <SettingsProvider>
          <AppRoutes />
        </SettingsProvider>
      </ThemeModeProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
