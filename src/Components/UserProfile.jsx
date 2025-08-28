import React, { useEffect, useState } from 'react';
import {
  Box, Text, Image, VStack, HStack, SimpleGrid, Spinner, Button,
  useToast, Avatar, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Input, FormControl, FormLabel, Flex, Icon,
  Divider, IconButton, useDisclosure
} from '@chakra-ui/react';
import { FaHeart, FaRegComment, FaRetweet, FaShareAlt } from "react-icons/fa";
import { doc, getDoc, addDoc, collection, query, where, getDocs, orderBy, serverTimestamp, deleteDoc, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';
import DashBoardLayout from '../DashboardLayout';
import CommentModal from './CommentModal';

const UserProfile = () => {
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', imageFile: null });
  const [submitting, setSubmitting] = useState(false);
  const [currentUserUid, setCurrentUserUid] = useState(null);
  const [followStatus, setFollowStatus] = useState('none'); // 'none', 'following'
  const [selectedImage, setSelectedImage] = useState(null);
  const { isOpen: isImageModalOpen, onOpen: onImageModalOpen, onClose: onImageModalClose } = useDisclosure();
  const [selectedPost, setSelectedPost] = useState(null); // State to hold the post selected for commenting
  const { isOpen: isCommentModalOpen, onOpen: onCommentModalOpen, onClose: onCommentModalClose } = useDisclosure();

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
      if (!currentUserUid || !uid) {
        setLoading(false); // Ensure loading is false if no user/uid to fetch data for
        return;
      }

      setLoading(true); // Set loading to true when starting data fetch
      try {
        const docRef = doc(db, 'buyers', uid);
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

  // Like post
  const handleLike = async (post) => {
    const alreadyLiked = post.likes?.includes(currentUserUid);
    const updatedLikes = alreadyLiked
      ? post.likes.filter((id) => id !== currentUserUid)
      : [...(post.likes || []), currentUserUid];
    await updateDoc(doc(db, "posts", post.id), { likes: updatedLikes });
  };

  // Retweet post
  const handleRetweet = async (post) => {
    await addDoc(collection(db, "posts"), {
      content: `RT @${post.userName}: ${post.content}`,
      imageUrl: post.imageUrl || "",
      uid: currentUserUid,
      userName: buyer.fullName,
      userPhoto: buyer.profilePhotoUrl,
      createdAt: serverTimestamp(),
      likes: [],
      comments: [],
      retweetOf: post.id
    });
    toast({ title: "Post retweeted", status: "success" });
  };

  // Share post
  const handleShare = (postId) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Post link copied", status: "info" });
  };

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
    if (!newPost.content.trim() || !newPost.imageFile) {
      toast({ title: 'All fields are required', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    try {
      setSubmitting(true);
      const imageUrl = await handleImageUpload(newPost.imageFile);
await addDoc(collection(db, 'posts'), {
        uid,
        content: newPost.content,
        imageUrl,
        createdAt: new Date().toISOString()
      });
      toast({ title: 'Post created successfully', status: 'success', duration: 3000, isClosable: true });
      setIsModalOpen(false);
      setNewPost({ content: '', imageFile: null });

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
    <DashBoardLayout active="buyer" role="buyer" showNav>
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
          <Text color="gray.600">{buyer.bio || ""}</Text>
          <Text fontSize="md" color="gray.700">{posts.length} Posts</Text>
        </VStack>
      </HStack>

      <Divider mb={6}  />

      <Text fontWeight="bold" align="center" mb={4} fontSize="lg">Posts</Text>
      {posts.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {posts.map(post => (
            <Box key={post.id} bg="white" p={4} borderRadius="lg" shadow="sm">
              <HStack align="start" spacing={4} mb={2}>
                <Avatar size="md" name={post.userName} src={post.userPhoto} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{post.userName}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {post.createdAt?.toDate
                      ? new Date(post.createdAt.toDate()).toLocaleString()
                      : "Just now"}
                  </Text>
                </VStack>
              </HStack>
              <Text mt={2}>{post.content}</Text>
              {post.imageUrl && (
                <Image
                  src={post.imageUrl}
                  alt={post.content}
                  borderRadius="md"
                  mt={2}
                  cursor="pointer"
                  onClick={() => {
                    setSelectedImage(post.imageUrl);
                    onImageModalOpen();
                  }}
                  maxH="300px"
                  objectFit="contain"
                  mx="auto"
                />
              )}
              <HStack mt={3} spacing={8}>
                <IconButton
                  size="sm"
                  icon={<FaHeart color={post.likes?.includes(currentUserUid) ? "red" : "gray"} />}
                  onClick={() => handleLike(post)}
                  aria-label="Like post"
                />
                <IconButton
                  size="sm"
                  icon={<FaRegComment />}
                  onClick={() => {
                    setSelectedPost(post);
                    onCommentModalOpen();
                  }}
                  aria-label="Comment on post"
                />
                <IconButton
                  size="sm"
                  icon={<FaRetweet />}
                  onClick={() => handleRetweet(post)}
                  aria-label="Retweet post"
                />
                <IconButton
                  size="sm"
                  icon={<FaShareAlt />}
                  onClick={() => handleShare(post.id)}
                  aria-label="Share post"
                />
              </HStack>
            </Box>
          ))}
        </VStack>
      ) : (
        <Box borderColor="gray.300" borderRadius="md" p={12} textAlign="center" color="gray.500">
          <Text color="black" fontWeight="600" fontSize="34px">No posts yet</Text>
        </Box>
      )}

      {/* Image Enlargement Modal */}
      <Modal isOpen={isImageModalOpen} onClose={onImageModalClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" />
          <ModalBody>
            {selectedImage && <Image src={selectedImage} maxH="90vh" objectFit="contain" mx="auto" />}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Content</FormLabel>
              <Input value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} placeholder="Write something..." />
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

      {/* Comment Modal */}
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={onCommentModalClose}
        selectedPost={selectedPost}
        currentUserId={currentUserUid}
      />
    </Box>
    </DashBoardLayout>
  );
};

export default UserProfile;
