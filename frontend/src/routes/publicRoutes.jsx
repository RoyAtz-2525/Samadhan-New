import React from 'react';
import { Route } from 'react-router-dom';
import Home from '../pages/public/Home/Home';
import About from '../pages/public/About/About';
import HowItWorks from '../pages/public/HowItWorks/HowItWorks';
import CivicConnect from '../pages/public/CivicConnect/CivicConnect';

export const PublicRoutes = [
  <Route key="home" path="/" element={<Home />} />,
  <Route key="about" path="/about" element={<About />} />,
  <Route key="how-it-works" path="/how-it-works" element={<HowItWorks />} />,
  <Route key="civic-connect" path="/civic-connect" element={<CivicConnect />} />
];
