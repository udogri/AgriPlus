import React from 'react';
import { Box, Text, Button } from '@chakra-ui/react';

const GroupCard = ({ group }) => (
  <Box borderWidth="1px" p={4} borderRadius="lg" mb={4}>
    <Text fontWeight="bold">{group.name}</Text>
    <Text>{group.members} members</Text>
    <Button size="sm" mt={2} colorScheme="green">Join Group</Button>
  </Box>
);

export default GroupCard;
