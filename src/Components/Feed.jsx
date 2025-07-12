import React from 'react';
import { VStack, Box, Input, Button } from '@chakra-ui/react';
import PostCard from './PostCard';

const posts = [
    {
      id: 1,
      user: 'Farmer John',
      content: 'What’s the best seed variety for maize?',
      img: 'https://i.ibb.co/yVqVBLz/maize-field.jpg',
      likes: 10,
      comments: []
    },
    {
      id: 2,
      user: 'AgroPro Ltd',
      content: 'Tips for managing farm pests organically.',
      img: 'https://i.ibb.co/gTX3BR0/farm-pests.jpg',
      likes: 4,
      comments: []
    },
    {
      id: 3,
      user: 'GreenHarvest',
      content: 'We just harvested our tomatoes! 🍅 So proud of the team.',
      img: 'https://i.ibb.co/QCYLfhv/tomato-harvest.jpg',
      likes: 25,
      comments: []
    },
    {
      id: 4,
      user: 'Amaka O.',
      content: 'Can anyone recommend a vet in Delta state?',
      img: 'https://i.ibb.co/hRg3crY/vet-help.jpg',
      likes: 7,
      comments: []
    },
    {
      id: 5,
      user: 'Oruaro Farms',
      content: 'Check out our new irrigation setup for the dry season farming.',
      img: 'https://i.ibb.co/wRWMD8B/irrigation.jpg',
      likes: 18,
      comments: []
    }
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
