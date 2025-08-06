import React, { useEffect, useState } from 'react';
import {
  Box, Text, Image, VStack, HStack, SimpleGrid, Spinner, Button,
  useToast, Avatar, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Input, FormControl, FormLabel, Flex, Icon
} from '@chakra-ui/react';
import { doc, getDoc, addDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db, auth } from '../../firebaseConfig';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';

const FarmerProfile = () => {
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ caption: '', imageFile: null });
  const [submitting, setSubmitting] = useState(false);
  const [currentUserUid, setCurrentUserUid] = useState(null);

  const toast = useToast();
  const { uid } = useParams();

  useEffect(() => {
    // Watch authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserUid(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'buyers', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBuyer(docSnap.data());
          console.log("URL UID:", uid, "Auth UID:", currentUserUid);
        } else {
          toast({
            title: 'Profile not found',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }

        const q = query(collection(db, 'farmerPosts'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        toast({ title: 'Error fetching profile', description: err.message, status: 'error', duration: 4000 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid, currentUserUid, toast]);

  const handleImageUpload = async (file) => {
    const apiKey = 'bc6aa3a9cee7036d9b191018c92c893a';
    const formData = new FormData();
    formData.append('image', file);
    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData);
    return response.data.data.url;
  };

  const handleSubmitPost = async () => {
    if (!newPost.caption.trim() || !newPost.imageFile) {
      toast({ title: 'All fields are required', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    try {
      setSubmitting(true);
      const imageUrl = await handleImageUpload(newPost.imageFile);
      await addDoc(collection(db, 'farmerPosts'), {
        uid,
        caption: newPost.caption,
        imageUrl,
        createdAt: new Date().toISOString()
      });
      toast({ title: 'Post created successfully', status: 'success', duration: 3000, isClosable: true });
      setIsModalOpen(false);
      setNewPost({ caption: '', imageFile: null });

      const q = query(collection(db, 'farmerPosts'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      toast({ title: 'Error creating post', description: error.message, status: 'error', duration: 4000 });
    } finally {
      setSubmitting(false);
    }
  };

  const isOwner = currentUserUid === uid;

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
      <HStack spacing={[4, 10]} mb={8} align="flex-start">
        <Avatar size="2xl" name={buyer.fullName} src={buyer.profilePhotoUrl} border="2px solid" borderColor="teal.500" />
        <VStack align="start" spacing={2} flex={1}>
          <HStack spacing={4}>
            <Text fontSize="2xl" fontWeight="bold">{buyer.fullName}</Text>
            {isOwner && (
              <Button size="sm" colorScheme="teal" onClick={() => setIsModalOpen(true)}>+ New Post</Button>
            )}
          </HStack>
          <Text color="gray.600">{buyer.email}</Text>
        </VStack>
      </HStack>

      <Text fontWeight="bold" mb={4} fontSize="lg">Posts</Text>
      {posts.length > 0 ? (
        <SimpleGrid columns={[1, 2, 3]} spacing={4}>
          {posts.map(post => (
            <Box key={post.id} borderWidth="1px" borderRadius="lg" overflow="hidden" p={3}>
              <Image src={post.imageUrl} alt={post.caption} borderRadius="md" objectFit="cover" w="100%" h="200px" />
              <Text mt={2} fontSize="sm">{post.caption}</Text>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Box border="2px dashed" borderColor="gray.300" borderRadius="md" p={12} textAlign="center" color="gray.500">
          <Text fontSize="md">No posts yet</Text>
        </Box>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Caption</FormLabel>
              <Input value={newPost.caption} onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })} placeholder="Write something..." />
            </FormControl>

            <FormControl>
              <FormLabel>Upload Image</FormLabel>
              <Flex align="center" justify="center" border="2px dashed" borderColor="gray.300" borderRadius="md" p={4} cursor="pointer" onClick={() => document.getElementById('postImage').click()}>
                <Icon as={AiOutlineCloudUpload} fontSize="24px" color="gray.500" />
                <Text ml={2}>{newPost.imageFile ? newPost.imageFile.name : 'Click to upload image'}</Text>
              </Flex>
              <Input id="postImage" type="file" accept=".jpg,.jpeg,.png" hidden onChange={(e) => setNewPost({ ...newPost, imageFile: e.target.files[0] })} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleSubmitPost} isLoading={submitting}>
              Post
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FarmerProfile;
