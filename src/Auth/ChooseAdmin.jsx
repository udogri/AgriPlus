import React, { useState } from 'react';
import { Box, Button, Grid, GridItem, Text, VStack, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const ChooseAdmin = () => {
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null); // for tracking which button is loading

  const roles = [
    {
      title: 'Farmer',
      description: 'As a Farmer, you gain access to tools and support systems to enhance your productivity.',
      bg: '#D8FFEC',
      action: 'Join as Farmer',
      adminId: 'farmer',
    },
    {
      title: 'Buyer',
      description: 'As a Buyer, you can easily source and purchase fresh produce directly from trusted farmers.',
      bg: '#FFF7D8',
      action: 'Join as Buyer',
      adminId: 'buyer',
    },
    {
      title: 'Logistics',
      description: 'Join as a Logistics partner to help transport farm produce quickly and efficiently.',
      bg: '#D8E9FF',
      action: 'Join as Logistics',
      adminId: 'logistics',
    },
    {
      title: 'Veterinarian',
      description: 'As a Veterinarian, offer your expertise to farmers and help ensure animal health.',
      bg: '#FFE4D8',
      action: 'Join as Veterinarian',
      adminId: 'veterinarian',
    },
  ];

  const handleCardClick = async (adminId) => {
    const user = auth.currentUser;
    if (user) {
      try {
        setLoadingRole(adminId);
        await updateDoc(doc(db, 'users', user.uid), { adminId });

        switch (adminId) {
          case 'farmer':
            navigate('/farmer-signup');
            break;
          case 'buyer':
            navigate('/buyer-signup');
            break;
          case 'logistics':
            // navigate('/logistics/dashboard');
            break;
          case 'veterinarian':
            // navigate('/veterinarian/dashboard');
            break;
          default:
            navigate('/');
        }
      } catch (err) {
        console.error('Failed to update adminId:', err);
      } finally {
        setLoadingRole(null);
      }
    } else {
      navigate('/');
    }
  };

  return (
    <Box px={['5%', '10%']} py="60px" minH="100vh" bg="#F9F9F9">
      <Text fontSize="36px" fontWeight="bold" textAlign="center" mb={10}>
        Choose Your Role
      </Text>
      <Grid templateColumns={['1fr', null, 'repeat(2, 1fr)', 'repeat(4, 1fr)']} gap={8}>
        {roles.map((role) => (
          <GridItem
            key={role.adminId}
            bg={role.bg}
            p={6}
            borderRadius="md"
            cursor="pointer"
            boxShadow="md"
            _hover={{ transform: 'scale(1.03)', transition: '0.2s' }}
          >
            <VStack align="start" spacing={4}>
              <Text fontSize="24px" fontWeight="bold">{role.title}</Text>
              <Text fontSize="14px" color="gray.600">{role.description}</Text>
              <Button
                colorScheme="teal"
                alignSelf="start"
                onClick={() => handleCardClick(role.adminId)}
                isLoading={loadingRole === role.adminId}
                loadingText="Processing"
              >
                {role.action}
              </Button>
            </VStack>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default ChooseAdmin;
