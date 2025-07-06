import { Box, Avatar, Text, VStack } from '@chakra-ui/react';

const LeftSidebar = () => (
  <Box bg="white" borderRadius="lg" p={4} shadow="sm">
    <VStack spacing={3}>
      <Avatar size="xl" name="You" />
      <Text fontWeight="bold">Your Name</Text>
      <Text fontSize="sm" color="gray.500">AgriTech Enthusiast</Text>
    </VStack>
  </Box>
);

export default LeftSidebar;
