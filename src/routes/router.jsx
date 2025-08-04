import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import MainPage from './pages/mainPage';
import TransactionsPage from './pages/transactionsPage';
import SettingsPage from './pages/settingsPage';
import ChartsPage from './pages/chartsPage';
import ItemsPage from './pages/itemsPage';
import AccountsPage from './pages/accountsPage';
export default function Router() {
  return (
    <>
      <Routes>
        {/* <Route exact path="/" element={<Navigate to="/transactions" />} /> */}
        <Route exact path="/" element={<MainPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/charts" element={<ChartsPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
      </Routes>
    </>
  );
}
