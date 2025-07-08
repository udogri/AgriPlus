import React from 'react';
import { Box, Text, VStack, Button, Avatar } from '@chakra-ui/react';

const groups = [
  { id: 1, name: 'Agri Innovators', members: 400 },
  { id: 2, name: 'Poultry Experts', members: 220 },
];

const RightSidebar = () => (
  <Box bg="white" p={4} borderRadius="lg" shadow="sm">
      <VStack spacing={3}>
        <Avatar size="xl" name="You" />
        <Text fontWeight="bold">Your Name</Text>
        <Text fontSize="sm" color="gray.500">AgriTech Enthusiast</Text>
      </VStack>
    <Text fontWeight="bold" mb={3}>Suggested Groups</Text>
    <VStack align="start" spacing={3}>
      {groups.map(group => (
        <Box key={group.id}>
          <Text>{group.name}</Text>
          <Text fontSize="sm" color="gray.500">{group.members} members</Text>
          <Button size="xs" mt={1} colorScheme="blue">Join</Button>
        </Box>
      ))}
    </VStack>
  </Box>
);

export default RightSidebar;
