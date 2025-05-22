// src/pages/farmer/InventoryPage.jsx
import {
    Box,
    Heading,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Stack,
    useColorModeValue,
    Text,
  } from '@chakra-ui/react';
  import DashBoardLayout from '../../DashboardLayout';

  const mockInventory = [
    {
      id: 1,
      name: 'Tomatoes',
      quantity: 150,
      unit: 'kg',
      price: '₦500',
      updatedAt: '2025-05-20',
    },
    {
      id: 2,
      name: 'Yam',
      quantity: 80,
      unit: 'tubers',
      price: '₦1000',
      updatedAt: '2025-05-18',
    },
    {
      id: 3,
      name: 'Maize',
      quantity: 300,
      unit: 'kg',
      price: '₦350',
      updatedAt: '2025-05-19',
    },
  ];
  
  export default function FarmerInventory() {
    const bg = useColorModeValue('white', 'gray.800');
  
    return (
      <DashBoardLayout active="Inventory">
        <Box bg={bg} p={6} borderRadius="md" boxShadow="md">
          <Stack
            direction={{ base: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Heading size="md">My Inventory</Heading>
            <Button colorScheme="teal">+ Add New Item</Button>
          </Stack>
  
          {mockInventory.length === 0 ? (
            <Text color="gray.500" mt={4}>No items in inventory.</Text>
          ) : (
            <Box overflowX="auto">
              <Table variant="striped" colorScheme="teal">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Quantity</Th>
                    <Th>Price</Th>
                    <Th>Last Updated</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mockInventory.map((item) => (
                    <Tr key={item.id}>
                      <Td>{item.name}</Td>
                      <Td>{item.quantity} {item.unit}</Td>
                      <Td>{item.price}</Td>
                      <Td>{item.updatedAt}</Td>
                      <Td>
                        <Button size="sm" variant="outline" mr={2}>Edit</Button>
                        <Button size="sm" colorScheme="red" variant="outline">Delete</Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </DashBoardLayout>
    );
  }
  