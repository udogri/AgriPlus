// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Home from './LandingPage/Home';

function App() {
  return (
    <Flex direction="column" minHeight="100vh">
      <Box flex="1">
        <Routes>
          <Route path="/" element={<Home />} />
          
        </Routes>
      </Box>
    </Flex>
  );
}

export default App;
