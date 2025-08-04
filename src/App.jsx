import React from 'react';
import Router from './routes/router';
import Header from './parts/header/header';
import './assets/css/style.css';

export default function App() {
  return (
    <>
      <Header />
      <Router />
    </>
  );
}
