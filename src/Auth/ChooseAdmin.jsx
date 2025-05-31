import { useNavigate } from 'react-router-dom';
import { Box, Button, Heading, VStack } from '@chakra-ui/react';

const ChooseAdmin = () => {
  const navigate = useNavigate();

  const handleAdminSelect = (admin) => {
    navigate(`/admin-form/${admin}`); // pass admin type in URL
  };

  return (
    <Box p={6}>
      <Heading mb={4}>Choose an Admin</Heading>
      <VStack spacing={4}>
        {['AdminA', 'AdminB', 'AdminC', 'AdminD'].map((admin) => (
          <Button key={admin} onClick={() => handleAdminSelect(admin)}>{admin}</Button>
        ))}
      </VStack>
    </Box>
  );
};

export default ChooseAdmin;
