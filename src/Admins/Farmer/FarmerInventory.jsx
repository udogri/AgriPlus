import {
    Box,
    Heading,
    Button,
    Stack,
    useColorModeValue,
    Text,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    useDisclosure,
    Image,
    SimpleGrid,
  } from '@chakra-ui/react';
  import { useState } from 'react';
  import DashBoardLayout from '../../DashboardLayout';
  import AddInventoryItem from '../../Components/AddInventoryItem';
  import Yam from '../../assets/Yam.jpeg'; // Adjust the path as necessary
  import Tomatoes from '../../assets/Tomatoes.jpg'; // Adjust the path as necessary
  import onions from '../../assets/onions.webp'; // Adjust the path as necessary
  
  
  const initialInventory = [
    {
      id: 1,
      name: 'Tomatoes',
      quantity: 150,
      unit: 'kg',
      price: '₦500',
      updatedAt: '2025-05-20',
      image: Tomatoes, // Using the imported Tomatoes image
    },
    {
      id: 2,
      name: 'Yam',
      quantity: 80,
      unit: 'tubers',
      price: '₦1000',
      updatedAt: '2025-05-18',
      image: Yam, // Using the imported Yam image
    },
    {
      id: 3,
      name: 'Onions',
      quantity: 300,
      unit: 'kg',
      price: '₦350',
      updatedAt: '2025-05-19',
      image: onions,
    },
  ];
  
  export default function FarmerInventory() {
    const bg = useColorModeValue('white', 'gray.800');
    const [inventory, setInventory] = useState(initialInventory);
    const { isOpen, onOpen, onClose } = useDisclosure();
  
    const handleAddItem = (item) => {
      setInventory((prev) => [item, ...prev]);
      onClose();
    };
  
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
            <Button background="#39996B" color="white" onClick={onOpen}>
              + Add New Item
            </Button>
          </Stack>
  
          <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add Inventory Item</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <AddInventoryItem onAdd={handleAddItem} />
              </ModalBody>
            </ModalContent>
          </Modal>
  
          {inventory.length === 0 ? (
            <Text color="gray.500" mt={4}>
              No items in inventory.
            </Text>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6} mt={4}>
              {inventory.map((item) => (
                <Box
                  key={item.id}
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="md"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    objectFit="cover"
                    width="100%"
                    height="150px"
                  />
                  <Box p={4}>
                    <Heading size="sm" mb={2}>
                      {item.name}
                    </Heading>
                    <Text>
                      <strong>Quantity:</strong> {item.quantity} {item.unit}
                    </Text>
                    <Text>
                      <strong>Price:</strong> {item.price}
                    </Text>
                    <Text>
                      <strong>Updated:</strong> {item.updatedAt}
                    </Text>
                    <Stack direction="row" mt={3}>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" colorScheme="red" variant="outline">
                        Delete
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </DashBoardLayout>
    );
  }
  