import React, { useState, useEffect } from 'react';
import { VStack, Box, Input, Button, Spinner } from '@chakra-ui/react';
import PostCard from './PostCard';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import CreatePostModal from './CreatePostModal';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box minH="100vh" display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  const openCreatePostModal = () => {
    setIsCreatePostModalOpen(true);
  };

  const closeCreatePostModal = () => {
    setIsCreatePostModalOpen(false);
  };

  return (
    <VStack spacing={4}>
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={closeCreatePostModal}
      />
      <Box bg="white" p={4} borderRadius="lg" shadow="sm" width="100%">
        <Input placeholder="Start a post..." mb={2} />
        <Button colorScheme="green" size="sm" onClick={openCreatePostModal}>
          Post
        </Button>
      </Box>

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </VStack>
  );
};

export default Feed;
