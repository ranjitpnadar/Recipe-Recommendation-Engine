import React from 'react';
import SidebarButtons from './SidebarButtons';
import SearchHistory from './SearchHistory';

function Sidebar() {
  return (
    <aside className="sidebar">
      <SidebarButtons />
      <SearchHistory />
    </aside>
  );
}

export default Sidebar;