import React, { useState } from 'react';
import {
  Box, Text, HStack, Button, VStack, Avatar, Divider
} from '@chakra-ui/react';
import CommentBox from './CommentBox';

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(post.comments || []);

  const handleComment = (text) => {
    setComments(prev => [...prev, { user: 'You', text }]);
  };

  return (
    <Box bg="white" p={4} borderRadius="lg" shadow="sm" w="100%">
      <HStack spacing={3}>
        <Avatar name={post.user} />
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold">{post.user}</Text>
          <Text fontSize="sm" color="gray.500">Agriculture Professional</Text>
        </VStack>
      </HStack>
      <Text mt={3}>{post.content}</Text>

      <HStack mt={3}>
        <Button size="sm" onClick={() => setLikes(likes + 1)}>👍 {likes}</Button>
      </HStack>

      <Divider my={3} />
      <VStack spacing={2} align="start">
        {comments.map((c, i) => (
          <Box key={i} fontSize="sm" bg="gray.50" p={2} borderRadius="md" w="100%">
            <Text><strong>{c.user}:</strong> {c.text}</Text>
          </Box>
        ))}
        <CommentBox onSubmit={handleComment} />
      </VStack>
    </Box>
  );
};

export default PostCard;
