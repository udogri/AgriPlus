import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, Button, Avatar, Spinner } from '@chakra-ui/react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { TbUserPlus } from 'react-icons/tb';

export default function RightSidebar() {
  const [userData, setUserData] = useState({
    fullName: '',
    profilePhotoUrl: '',
    bio: '',
    role: '',
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return setLoading(false);

      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (!userSnap.exists()) {
          console.warn('User doc not found in "users" collection');
          return;
        }

        const { adminId: role } = userSnap.data();
        if (!role) {
          console.warn('adminId not set in user doc');
          return;
        }

        const profileSnap = await getDoc(doc(db, `${role}s`, user.uid));
        if (profileSnap.exists()) {
          setUserData({ ...(profileSnap.data()), role });
        } else {
          console.warn(`No ${role} profile at ${role}s/${user.uid}`);
        }
      } catch (e) {
        console.error('Error loading sidebar data', e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const handleClick = () => {
    const { role } = userData;
    if (role === 'buyer') {
      navigate(`/buyer/dashboard/${auth.currentUser.uid}`);
    } else if (role === 'farmer') {
      navigate(`/farmer/dashboard/${auth.currentUser.uid}`);
    }
  };

  if (loading) {
    return (
      <Box h="calc(100vh - 100px)" display="flex" alignItems="center" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  return (
    <Box
      bg="white" p={4} borderRadius="lg" shadow="sm"
      h="calc(100vh - 100px)" overflowY="auto" position="sticky" top="80px"
    >
      <VStack spacing={3} mb={4}>
        <Avatar
          size="xl"
          name={userData.fullName}
          src={userData.profilePhotoUrl}
          cursor="pointer"
          onClick={handleClick}
        />
        <Text fontWeight="bold">{userData.fullName || 'Your Name'}</Text>
        <Text fontSize="sm" color="gray.500">{userData.bio || ''}</Text>
      </VStack>

      <Box display="flex" alignItems="center" gap="5px" mb={3}>
        <Text fontWeight="600">Requests</Text>
        <TbUserPlus fontSize="20px" />
      </Box>

      {/* Keep your static example group items or adjust as needed */}
      <VStack align="start" spacing={3}>
        {[
          { id: 1, name: 'Akarue Maro' },
          { id: 2, name: 'Shaibu Musa' },
        ].map(g => (
          <Box key={g.id}>
            <Avatar size="sm" name={g.name} mr={2} /> <Text inline>{g.name}</Text>
            <Button size="xs" mt={1}>Accept</Button>
          </Box>
        ))}
      </VStack>
      <Text mt={4} fontSize="sm" color="blue.500" cursor="pointer">
        See all requests
      </Text>
    </Box>
  );
}
