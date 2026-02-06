
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedAdminRoute from './pages/ProtectedAdminRoute';

function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  return (
    <>
      <Hero />
      <Gallery />
      <About />
      <Testimonials />
      <Contact />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
