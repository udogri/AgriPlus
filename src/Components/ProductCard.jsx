// src/components/ProductCard.jsx
import {
    Box,
    Image,
    Text,
    Button,
    Stack,
    Heading,
  } from "@chakra-ui/react";
  
  const ProductCard = ({ item }) => {
    return (
      <Box bg="white" borderRadius="xl" shadow="md" overflow="hidden" p={4}>
        <Image
          src={item.image || "/placeholder.jpg"}
          alt={item.title}
          borderRadius="md"
          objectFit="cover"
          h="180px"
          w="100%"
          mb={4}
        />
        <Stack spacing={2}>
          <Heading size="sm" noOfLines={1}>
            {item.title}
          </Heading>
          <Text fontSize="sm" color="gray.600" noOfLines={2}>
            {item.description}
          </Text>
          <Text fontWeight="bold" color="green.600">
            ₦{item.price}
          </Text>
          <Button size="sm" colorScheme="blue" mt={2}>
            View Details
          </Button>
        </Stack>
      </Box>
    );
  };
  
  export default ProductCard;
  