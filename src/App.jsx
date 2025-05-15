// src/App.jsx
import { Box, Heading, Button } from '@chakra-ui/react'
import { FaSeedling } from 'react-icons/fa'

function App() {
  return (
    <Box textAlign="center" mt="10">
      <Heading color="green.500">
        <FaSeedling style={{ display: 'inline', marginRight: '10px' }} />
        AgriPlus
      </Heading>
      <Button colorScheme="green" mt={4}>
        Get Started
      </Button>
    </Box>
  )
}

export default App
