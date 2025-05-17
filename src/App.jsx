// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Home from './LandingPage/Home';
import ContactUs from './LandingPage/ContactUs';
import AboutUs from './LandingPage/AboutUs';
import Roles from './LandingPage/Roles';

function App() {
  return (
    <Flex direction="column" minHeight="100vh">
      <Box flex="1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/roles" element={<Roles />} />
          
        </Routes>
      </Box>
    </Flex>
  );
}

export default App;
