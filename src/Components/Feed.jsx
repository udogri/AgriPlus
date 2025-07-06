import React from 'react';
import { VStack, Box, Input, Button } from '@chakra-ui/react';
import PostCard from './PostCard';

const posts = [
  { id: 1, user: 'Farmer John', content: 'What’s the best seed variety for maize?', likes: 10, comments: [] },
  { id: 2, user: 'AgroPro Ltd', content: 'Tips for managing farm pests organically.', likes: 4, comments: [] },
];

const Feed = () => (
  <VStack spacing={4}>
    <Box bg="white" p={4} borderRadius="lg" shadow="sm" width="100%">
      <Input placeholder="Start a post..." mb={2} />
      <Button colorScheme="green" size="sm">Post</Button>
    </Box>

    {posts.map(post => <PostCard key={post.id} post={post} />)}
  </VStack>
);

export default Feed;
