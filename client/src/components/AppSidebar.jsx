import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './AppSidebar.css';

const LINKS = [
  { to: '/insights/timeline', label: 'Timeline', group: 'Insights' },
  { to: '/codex/custom-viz', label: 'Custom Viz', group: 'Insights' },
  { to: '/codex/operations', label: 'Operations', group: 'Insights' },
  { to: '/', label: 'Dashboard', group: 'Workspace' },
  { to: '/obituaries', label: 'Obituaries', group: 'Workspace' },
  { to: '/eulogies', label: 'Eulogies', group: 'Workspace' },
  { to: '/memorial-pages', label: 'Memorial Pages', group: 'Workspace' },
  { to: '/estate-items', label: 'Estate Items', group: 'Workspace' },
  { to: '/grief-support', label: 'Grief Support', group: 'Workspace' },
  { to: '/funeral-programs', label: 'Funeral Programs', group: 'Workspace' },
  { to: '/thank-you-cards', label: 'Thank You Cards', group: 'Workspace' },
  { to: '/condolence-letters', label: 'Condolence Letters', group: 'Workspace' },
  { to: '/prayers-readings', label: 'Prayers Readings', group: 'Workspace' },
  { to: '/memorial-donations', label: 'Memorial Donations', group: 'Workspace' },
  { to: '/photo-gallery', label: 'Photo Gallery', group: 'Workspace' },
  { to: '/guest-book', label: 'Guest Book', group: 'Workspace' },
  { to: '/service-checklists', label: 'Service Checklists', group: 'Workspace' },
  { to: '/contacts', label: 'Contacts', group: 'Workspace' },
  { to: '/timeline-events', label: 'Timeline Events', group: 'Workspace' },
  { to: '/budget-tracker', label: 'Budget Tracker', group: 'Workspace' },
  { to: '/venues', label: 'Venues', group: 'Workspace' },
  { to: '/music-playlist', label: 'Music Playlist', group: 'Workspace' },
  { to: '/rsvp', label: 'Rsvp', group: 'Workspace' },
  { to: '/document-vault', label: 'Document Vault', group: 'Workspace' },
  { to: '/flower-gifts', label: 'Flower Gifts', group: 'Workspace' },
  { to: '/announcements', label: 'Announcements', group: 'Workspace' },
  { to: '/travel-accommodations', label: 'Travel Accommodations', group: 'Workspace' },
  { to: '/memorial-videos', label: 'Memorial Videos', group: 'Workspace' },
  { to: '/thank-you-tracker', label: 'Thank You Tracker', group: 'Workspace' },
  { to: '/ai-legacy-tools', label: 'Ai Legacy Tools', group: 'AI tools' },
  { to: '/vendor-probate', label: 'Vendor Probate', group: 'Workspace' },
];

export default function AppSidebar() {
  const [query, setQuery] = useState('');
  const visible = LINKS.filter(link => link.label.toLowerCase().includes(query.toLowerCase().trim()));
  return <aside className="codex-side" aria-label="Application navigation">
    <div className="codex-side-brand"><strong>AIFuneral Memorial Creator</strong><span>Workspace</span></div>
    <label className="codex-side-search-label" htmlFor="codex-side-search">Find a section</label>
    <input id="codex-side-search" className="codex-side-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search navigation" />
    <nav className="codex-side-links" aria-label="Sections">
      {['Workspace', 'AI tools', 'Insights'].map(group => {
        const items = visible.filter(link => link.group === group);
        return items.length ? <div className="codex-side-group" key={group}>
          <span className="codex-side-heading">{group}</span>
          {items.map(link => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `codex-side-link${isActive ? ' active' : ''}`}>{link.label}</NavLink>)}
        </div> : null;
      })}
      {visible.length === 0 && <p className="codex-side-empty">No matching sections</p>}
    </nav>
  </aside>;
}
