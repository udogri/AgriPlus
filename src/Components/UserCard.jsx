import React from 'react';
import { Box, Text, Button } from '@chakra-ui/react';

const UserCard = ({ user }) => (
  <Box borderWidth="1px" p={4} borderRadius="lg" mb={4}>
    <Text fontWeight="bold">{user.name}</Text>
    <Text>{user.expertise}</Text>
    <Button size="sm" mt={2} colorScheme="blue">Follow</Button>
  </Box>
);

export default UserCard;
