import React, { useState, useEffect } from 'react';
import { VStack, Box, Input, Button, Spinner } from '@chakra-ui/react';
import PostCard from './PostCard';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import CreatePostModal from './CreatePostModal';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  

  return (
    <VStack spacing={4} w="100%" maxW="100%" overflowX="hidden">
  {posts.map((post) => (
    <PostCard key={post.id} post={post} />
  ))}
</VStack>

  );
};

export default Feed;
