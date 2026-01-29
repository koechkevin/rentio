import React from 'react';
import { Columns, UserIcon, Users, ImageIcon, Video } from 'lucide-react';
import { Link } from 'react-router';

const ProfileNav = () => (
  <div className="d-flex justify-content-center p-3 rounded-bottom">
    <ul className="d-flex align-items-center m-0 p-0">
      <li className="d-flex align-items-center active">
        <Columns className="me-1 icon-md text-primary"></Columns>
        <Link className="pt-1px d-none d-md-block text-primary" to=".">
          Timeline
        </Link>
      </li>
    </ul>
  </div>
);

export default React.memo(ProfileNav);
