import React, { useState } from 'react';
import {
  Box, Text, HStack, Button, VStack, Avatar, Divider, Image
} from '@chakra-ui/react';
import { FaRegHeart } from "react-icons/fa";
import { MdOutlineModeComment } from "react-icons/md";
import { BiRepost } from "react-icons/bi";
import { LuSend } from "react-icons/lu";

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(post.comments || []);

  const handleComment = (text) => {
    setComments((prev) => [...prev, { user: 'You', text }]);
  };

  return (
    <Box bg="white" p={5} borderRadius="lg" shadow="md" w="100%">
      {/* Post Header */}
      <HStack align="start" spacing={4} mb={3}>
        <Avatar name={post.user} />
        <Box>
          <Text fontWeight="bold">{post.user}</Text>
          <Text fontSize="sm" color="gray.500">Agriculture Professional</Text>
        </Box>
      </HStack>

      {/* Post Image */}
      {post.img && (
        <Image
          src={post.img}
          alt="Post"
          borderRadius="md"
          objectFit="cover"
          w="100%"
          maxH="300px"
          mb={3}
        />
      )}

      {/* Post Content */}
      <Text mb={3}>{post.content}</Text>

      {/* Likes */}
      <Box mb={3} gap={2} display="flex" justifyContent="start" alignItems="center">
      <Button size="sm" width="50px" colorScheme="transparent" color="black" onClick={() => setLikes(likes + 1)}>
      <FaRegHeart fontSize="20px" />{likes}
      </Button>
      <Button size="sm" width="50px" colorScheme="transparent" color="black" onClick={() => setLikes(likes + 1)}>
      <MdOutlineModeComment fontSize="20px" />
      </Button>
      <Button size="sm" width="50px" colorScheme="transparent" color="black" onClick={() => setLikes(likes + 1)}>
      <BiRepost fontSize="20px" />
      </Button>
      <Button size="sm" width="50px" colorScheme="transparent" color="black" onClick={() => setLikes(likes + 1)}>
      <LuSend fontSize="20px" />
      </Button>
      </Box>

      {/* Comments */}
      <Divider my={4} />
      <VStack spacing={3} align="stretch">
        {comments.map((c, i) => (
          <Box
            key={i}
            bg="gray.50"
            p={2}
            borderRadius="md"
            fontSize="sm"
          >
            <Text><strong>{c.user}:</strong> {c.text}</Text>
          </Box>
        ))}

        
      </VStack>
    </Box>
  );
};

export default PostCard;
