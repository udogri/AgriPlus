import React, { useEffect, useState } from 'react';
import {
  Box, Text, Image, VStack, HStack, SimpleGrid, Spinner, Button, useToast
} from '@chakra-ui/react';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db, auth } from '../../firebaseConfig'; // Adjust the import path as necessary

const FarmerProfile = () => {
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { uid } = useParams(); // Use route like /farmer/profile/:uid

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        const docRef = doc(db, 'buyers', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setBuyer(docSnap.data());
        } else {
          toast({
            title: 'Farmer not found',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        console.error(err);
        toast({
          title: 'Error fetching profile',
          description: err.message,
          status: 'error',
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFarmer();
  }, [uid]);

  if (loading) {
    return (
      <Box mt="50px" textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!buyer) return null;

  return (
    <Box px={4} py={6}>
      {/* Profile Header */}
      <HStack spacing={6} mb={6} alignItems="flex-start">
        <Image
          boxSize="120px"
          borderRadius="full"
          src={buyer.profilePhotoUrl}
          alt={buyer.fullName}
          objectFit="cover"
        />
        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="bold">{buyer.fullName}</Text>
          <Text color="gray.500">{buyer.email}</Text>
          <Text>{buyer.phone}</Text>
          <Text fontSize="sm" color="gray.600">
            {buyer.farmAddress || 'No address provided'}
          </Text>

          {/* Only show if this is current user */}
          {auth.currentUser?.uid === uid && (
            <Button colorScheme="teal" size="sm">Edit Profile</Button>
          )}
        </VStack>
      </HStack>

      {/* Bio Section */}
      <Box mb={6}>
        <Text fontWeight="bold">Bio</Text>
        <Text>Gender: {buyer.gender}</Text>
        <Text>DOB: {buyer.dob}</Text>
        <Text>State: {buyer.state}</Text>
        <Text>LGA: {buyer.lga}</Text>
      </Box>

      {/* "Posts" Section – grid style */}
      <Text fontWeight="bold" mb={3}>Documents</Text>
      <SimpleGrid columns={[2, null, 3]} spacing={4}>
        {buyer.idDocumentUrl ? (
          <Image
            src={buyer.idDocumentUrl}
            borderRadius="md"
            boxSize="100%"
            objectFit="cover"
            alt="ID Document"
          />
        ) : (
          <Text>No document uploaded</Text>
        )}
      </SimpleGrid>
    </Box>
  );
};

export default FarmerProfile;
