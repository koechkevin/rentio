import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Styles for LTR Layout
//
import './styles/styles.scss';

// Styles for RTL Layout.
// NOTE: Replace the above styles.scss with these CSS files to enable RTL mode.
//
// import './styles/rtl-css/styles.rtl.css';
// import './styles/rtl-css/custom.rtl.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
