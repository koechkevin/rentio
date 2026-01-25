import { useMenuConfig } from '@/hooks/useMenuConfig';
import { useAppSelector } from '@/store/store';
import { MenuItem } from '@/config/menu.config';

const SidebarItem = ({ item, level = 0 }: { item: MenuItem; level?: number }) => {
  const Icon = item.icon;

  if (item.isTitle) {
    return <div className="px-4 py-3 text-uppercase text-muted fw-bold small">{item.label}</div>;
  }

  if (item.subItems && item.subItems.length > 0) {
    return (
      <div>
        <a
          href={item.link || '#'}
          className="nav-link"
          data-bs-toggle="collapse"
          data-bs-target={`#collapse-${item.label.replace(/\s+/g, '-')}`}
        >
          {Icon && <Icon size={20} className="me-2" />}
          <span>{item.label}</span>
        </a>
        <div id={`collapse-${item.label.replace(/\s+/g, '-')}`} className="collapse">
          {item.subItems.map((subItem, idx) => (
            <SidebarItem key={idx} item={subItem} level={level + 1} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <a href={item.link} className="nav-link ms-3" target={item.isExternalLink ? '_blank' : '_self'}>
      {Icon && <Icon size={20} className="me-2" />}
      <span>{item.label}</span>
    </a>
  );
};

export const Sidebar = () => {
  const menu = useMenuConfig();
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return null;
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <a href="/">RentIO</a>
      </div>
      <div className="sidebar-menu">
        {menu.map((item, idx) => (
          <SidebarItem key={idx} item={item} />
        ))}
      </div>
    </nav>
  );
};
