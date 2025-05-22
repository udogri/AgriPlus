// src/pages/farmer/SettingsPage.jsx
import {
    Box,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    useColorModeValue,
    VStack,
  } from '@chakra-ui/react';
import DashBoardLayout from '../../DashboardLayout';
  
  export default function SettingsPage() {
    const bg = useColorModeValue('white', 'gray.800');
  
    return (
      <DashBoardLayout active="Settings">
        <Box bg={bg} p={6} borderRadius="md" boxShadow="md" maxW="600px">
          <Heading size="md" mb={6}>Account Settings</Heading>
  
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Full Name</FormLabel>
              <Input type="text" defaultValue="John Farmer" />
            </FormControl>
  
            <FormControl>
              <FormLabel>Email Address</FormLabel>
              <Input type="email" defaultValue="john@example.com" />
            </FormControl>
  
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input type="password" placeholder="********" />
            </FormControl>
  
            <Button colorScheme="teal" w="fit-content">Update Profile</Button>
          </VStack>
        </Box>
      </DashBoardLayout>
    );
  }
  