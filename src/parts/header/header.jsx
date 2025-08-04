import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import iconMenuClosed from '../../assets/media/icons/icon-menu.svg';
import iconMenuOpen from '../../assets/media/icons/icon-menu-open.svg';
import iconReload from '../../assets/media/icons/icon-refresh.svg';

import iconHome from '../../assets/media/icons/icon-home.svg';
import iconSettings from '../../assets/media/icons/icon-settings.svg';
import iconChart from '../../assets/media/icons/icon-chart.svg';
import iconItems from '../../assets/media/icons/icon-items.svg';
import iconLogs from '../../assets/media/icons/icon-pages.svg';
import iconAccount from '../../assets/media/icons/icon-accounts2.svg';

import logo from '../../assets/media/logo/logo.png';

import '../../assets/css/parts/header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        event.target.id !== 'menuBarBtn'
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const menuBarItems = [
    { className: 'main', to: '/', linkIcon: iconHome, text: 'Main' },
    { className: 'transactions', to: '/transactions', linkIcon: iconLogs, text: 'Transactions' },
    { className: 'items', to: '/items', linkIcon: iconItems, text: 'Items' },
    { className: 'charts', to: '/charts', linkIcon: iconChart, text: 'Charts' },
    { className: 'accounts', to: '/accounts', linkIcon: iconAccount, text: 'Accounts' },

    { className: 'settings', to: '/settings', linkIcon: iconSettings, text: 'Settings' },
  ];

  const setBackgroundImg = (url) => ({
    backgroundImage: `url('${url}')`,
  });

  const menuBarLink = ({ className, to, linkIcon, text }, key) => (
    <NavLink className={isActive(className)} to={to} key={key} onClick={() => setMenuOpen(false)}>
      <span className="img" style={setBackgroundImg(linkIcon)}></span>
      <span className="text">{text}</span>
    </NavLink>
  );

  const isActive = (page) => {
    return page + (useLocation().pathname.includes(page) ? ' active' : '');
  };
  return (
    <>
      <header>
        <figure>
          <img src={logo} alt="" />
        </figure>
        <input
          id="menuBarBtn"
          type="button"
          style={setBackgroundImg(menuOpen ? iconMenuOpen : iconMenuClosed)}
          onClick={() => setMenuOpen(!menuOpen)}
        />{' '}
      </header>
      <aside id="menuBar">
        <nav ref={menuRef} className={menuOpen ? 'open' : ''}>
          {menuBarItems.map((menuItem, i) => menuBarLink(menuItem, i))}
        </nav>
      </aside>
    </>
  );
}
