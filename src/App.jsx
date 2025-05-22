// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Home from './LandingPage/Home';
import ContactUs from './LandingPage/ContactUs';
import AboutUs from './LandingPage/AboutUs';
import ScrollToTop from './Components/ScrollToTop';
import FarmerDashboard from './Admins/Farmer/Index';
import FarmerInventory from './Admins/Farmer/FarmerInventory';
import FarmerTransactions from './Admins/Farmer/FarmerTransactions';
import SettingsPage from './Admins/Farmer/Settings';

function App() {
  return (
    <Flex direction="column" minHeight="100vh">
      <Box flex="1">
      <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/about-us" element={<AboutUs />} />

          {/* Add more routes as needed */}
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          <Route path="/farmer/inventory" element={<FarmerInventory />} />
          <Route path="/farmer/transactions" element={<FarmerTransactions />} />
          <Route path="/farmer/settings" element={<SettingsPage />} />

          
        </Routes>
      </Box>
    </Flex>
  );
}

export default App;
