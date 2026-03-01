import { Link } from 'react-router';
import { Col, Dropdown, Row } from 'react-bootstrap';
import {
  AlertCircle,
  Bell,
  Calendar,
  Download,
  Edit,
  Gift,
  Layers,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Repeat,
  User,
  UserRound,
} from 'lucide-react';
import { getUrl } from '@/utils/getUrl';
import ThemeSwitcher from './ThemeSwitcher';
import { useSettings } from '@/contexts/SettingsContext';
import { useThemeMode } from '@/contexts/ThemeModeContext';
import { useNavigate } from 'react-router';
import { useGetUserProfileQuery } from '@/services/api/userProfileApi';
import { useAppSelector } from '@/store/store';
import PropertySelector from '@/components/PropertySelector';

const Header = () => {
  const navigate = useNavigate();
  const user = useAppSelector((d) => d.auth.user);
  const userId = user?.id;
  const { data: userProfile, isLoading } = useGetUserProfileQuery('', {
    skip: !userId,
  });

  const onLogout = () => {
    localStorage.clear();
    navigate('/auth/login');
  };

  const { themeMode } = useThemeMode();
  const { isSidebarFolded, toggleSidebar, toggleMobileSidebar } = useSettings();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <a className="sidebar-toggler" onClick={toggleSidebar}>
          {isSidebarFolded ? <PanelLeftOpen /> : <PanelLeftClose />}
        </a>

        <div className="logo-mini-wrapper">
          <img
            src={themeMode === 'light' ? getUrl('/images/logo-mini-light.png') : getUrl('/images/logo-mini-dark.png')}
            className="h-25px"
            alt="logo"
          />
        </div>
        <div className="d-none d-md-flex align-items-center ms-3">
          <PropertySelector />
        </div>
        {/* <form className="search-form">
          <div className="input-group">
            <div className="input-group-text">
              <Search />
            </div>
            <Form.Control type="text" className="ps-2" id="navbarForm" placeholder="Search here..." />
          </div>
        </form> */}

        <ul className="navbar-nav">
          <li className="nav-item">
            <ThemeSwitcher />
          </li>

          <li className="nav-item">
            <Dropdown>
              <Dropdown.Toggle className="nav-link">
                {isLoading ? (
                  <div className="spinner-border spinner-border-sm ms-1" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <img
                    className="w-30px h-30px ms-1 rounded-circle"
                    src={userProfile?.displayPicture || getUrl('/images/faces/face.jpg')}
                    alt="profile"
                  />
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu className="px-0">
                {isLoading ? (
                  <div className="d-flex justify-content-center align-items-center p-4">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="d-flex flex-column align-items-center border-bottom px-5 py-3">
                      <div className="mb-3">
                        <img
                          className="w-80px h-80px rounded-circle"
                          src={userProfile?.displayPicture || getUrl('/images/faces/face.jpg')}
                          alt=""
                        />
                      </div>
                      <div className="text-center">
                        <p className="fs-16px fw-bolder">{userProfile?.fullName || 'User'}</p>
                        <p className="fs-12px text-secondary">{userProfile?.email || ''}</p>
                      </div>
                    </div>
                    <ul className="list-unstyled p-1">
                      <li>
                        <Dropdown.Item as={Link} to="/general/profile" className="py-2 d-flex ms-0">
                          <User className="me-2 icon-md" />
                          <span>Profile</span>
                        </Dropdown.Item>
                      </li>
                      <li>
                        <a href="#/" className="dropdown-item py-2 d-flex ms-0">
                          <Edit className="me-2 icon-md" />
                          <span>Edit Profile</span>
                        </a>
                      </li>
                      <li>
                        <a href="#/" className="dropdown-item py-2 d-flex ms-0">
                          <Repeat className="me-2 icon-md" />
                          <span>Switch User</span>
                        </a>
                      </li>
                      <li>
                        <a href="/" onClick={onLogout} className="dropdown-item py-2 d-flex ms-0">
                          <LogOut className="me-2 icon-md" />
                          <span>Log Out</span>
                        </a>
                      </li>
                    </ul>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </li>
        </ul>

        <a className="sidebar-toggler-mobile" onClick={toggleMobileSidebar}>
          <Menu />
        </a>
      </div>
    </nav>
  );
};

export default Header;
