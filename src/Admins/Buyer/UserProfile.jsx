import React, { useEffect, useState } from 'react';
import {
  Box, Text, Image, VStack, HStack, SimpleGrid, Spinner, Button, useToast, Avatar
} from '@chakra-ui/react';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db, auth } from '../../firebaseConfig';

const FarmerProfile = () => {
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { uid } = useParams(); // /farmer/profile/:uid

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        const docRef = doc(db, 'buyers', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBuyer(docSnap.data());
        } else {
          toast({
            title: 'Profile not found',
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
      <Box mt="60px" textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!buyer) return null;

  return (
    <Box maxW="900px" mx="auto" px={4} py={8}>
      {/* Profile Header */}
      <HStack spacing={[4, 10]} mb={8} align="flex-start" flexWrap="wrap">
        <Avatar
          size="2xl"
          name={buyer.fullName}
          src={buyer.profilePhotoUrl}
          border="2px solid"
          borderColor="teal.500"
        />
        <VStack align="start" spacing={2} flex={1}>
          <HStack spacing={4}>
            <Text fontSize="2xl" fontWeight="bold">{buyer.fullName}</Text>
            {auth.currentUser?.uid === uid && (
              <Button size="sm" colorScheme="teal">Edit Profile</Button>
            )}
          </HStack>
          <Text color="gray.600">{buyer.email}</Text>
          {/* <Text color="gray.600">{buyer.phone}</Text> */}
          {/* <Text fontSize="sm" color="gray.500">
            {buyer.farmAddress || 'No address provided'}
          </Text> */}
        </VStack>
      </HStack>

      {/* Bio Section */}
      <Box mb={8}>
        <Text fontWeight="semibold" mb={1}>Bio</Text>
      </Box>

      {/* Posts/Document Section */}
      <Text fontWeight="bold" mb={4} fontSize="lg">Posts</Text>
      {buyer.idDocumentUrl ? (
        <SimpleGrid columns={[2, 3]} spacing={4}>
          <Image
            src={buyer.idDocumentUrl}
            borderRadius="md"
            objectFit="cover"
            aspectRatio={1}
            w="100%"
            alt="Uploaded document"
            fallbackSrc="https://via.placeholder.com/300x300?text=Image"
          />
        </SimpleGrid>
      ) : (
        <Box
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="md"
          p={12}
          textAlign="center"
          color="gray.500"
        >
          <Text fontSize="md">No posts yet</Text>
        </Box>
      )}
    </Box>
  );
};

export default FarmerProfile;
