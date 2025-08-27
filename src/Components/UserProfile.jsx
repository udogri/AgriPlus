import React, { useEffect, useState } from 'react';
import {
  Box, Text, Image, VStack, HStack, SimpleGrid, Spinner, Button,
  useToast, Avatar, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Input, FormControl, FormLabel, Flex, Icon
} from '@chakra-ui/react';
import { doc, getDoc, addDoc, collection, query, where, getDocs, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';

const UserProfile = () => {
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ caption: '', imageFile: null });
  const [submitting, setSubmitting] = useState(false);
  const [currentUserUid, setCurrentUserUid] = useState(null);
  const [followStatus, setFollowStatus] = useState('none'); // 'none', 'following'

  const toast = useToast();
  const { uid } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Watch authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserUid(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUserUid || !uid) return;

      try {
const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
setBuyer({ id: docSnap.id, ...docSnap.data() });
          console.log("URL UID:", uid, "Auth UID:", currentUserUid);

          // Check follow status
          if (currentUserUid !== uid) {
            // Check if already following
            const followingQuery = query(
              collection(db, 'followers'),
              where('followerId', '==', currentUserUid),
              where('followingId', '==', uid)
            );
            const followingSnap = await getDocs(followingQuery);
            if (!followingSnap.empty) {
              setFollowStatus('following');
            } else {
              setFollowStatus('none');
            }
          }
        } else {
          toast({
            title: 'Profile not found',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }

const q = query(collection(db, 'posts'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
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

  const toggleFollow = async () => {
    if (!currentUserUid || !buyer) return;

    try {
      if (followStatus === 'following') {
        // Unfollow
        const followingQuery = query(
          collection(db, 'followers'),
          where('followerId', '==', currentUserUid),
          where('followingId', '==', uid)
        );
        const followingSnap = await getDocs(followingQuery);
        if (!followingSnap.empty) {
          await deleteDoc(followingSnap.docs[0].ref);
          setFollowStatus('none');
          toast({ title: 'Unfollowed user', status: 'info', duration: 3000, isClosable: true });
        }
      } else {
        // Follow
        await addDoc(collection(db, 'followers'), {
          followerId: currentUserUid,
          followingId: buyer.id,
          createdAt: serverTimestamp(),
        });
        setFollowStatus('following');
        toast({ title: 'Followed user!', status: 'success', duration: 3000, isClosable: true });
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast({ title: 'Error updating follow status', description: error.message, status: 'error', duration: 4000 });
    }
  };

  const startChat = async () => {
    if (!currentUserUid || !buyer) return;

    try {
      // Check if a chat already exists between these two users
      const chatQuery = query(
        collection(db, 'chats'),
        where('users', 'array-contains', currentUserUid)
      );
      const chatSnap = await getDocs(chatQuery);

      let existingChatId = null;
      chatSnap.docs.forEach(doc => {
        const chatUsers = doc.data().users;
        if (chatUsers.includes(uid)) {
          existingChatId = doc.id;
        }
      });

      if (existingChatId) {
        navigate(`/chat/${existingChatId}`);
      } else {
        // Create a new chat
        const newChatRef = await addDoc(collection(db, 'chats'), {
          users: [currentUserUid, uid],
          createdAt: serverTimestamp(),
          lastMessage: null,
        });
        navigate(`/chat/${newChatRef.id}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({ title: 'Error starting chat', description: error.message, status: 'error', duration: 4000 });
    }
  };

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
await addDoc(collection(db, 'posts'), {
        uid,
        caption: newPost.caption,
        imageUrl,
        createdAt: new Date().toISOString()
      });
      toast({ title: 'Post created successfully', status: 'success', duration: 3000, isClosable: true });
      setIsModalOpen(false);
      setNewPost({ caption: '', imageFile: null });

const q = query(collection(db, 'posts'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
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
            {isOwner ? (
              <Button size="sm" colorScheme="teal" onClick={() => setIsModalOpen(true)}>+ New Post</Button>
            ) : (
              <HStack>
                {followStatus === 'none' ? (
                  <Button size="sm" colorScheme="green" onClick={toggleFollow}>Follow</Button>
                ) : (
                  <Button size="sm" colorScheme="gray" onClick={toggleFollow}>Following</Button>
                )}
                <Button size="sm" colorScheme="blue" onClick={startChat}>Message</Button>
              </HStack>
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

export default UserProfile;
