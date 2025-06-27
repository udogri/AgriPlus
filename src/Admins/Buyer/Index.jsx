// src/pages/DashboardPage.jsx
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Button,
  Text,
  Flex,
  Icon,
  Link,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { FaShoppingCart, FaTruck, FaWallet, FaUsers } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import DashBoardLayout from "../../DashboardLayout";
import { MdOutlineShoppingCart } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";

const DashboardPage = () => {
  return (
    <DashBoardLayout active="buyer" showNav={true} showSearch={true} role="buyer">
    <Box p={6} bg="gray.50" minH="100vh">
      <Heading mb={6} fontSize={{ base: "2xl", md: "3xl" }}>
        Welcome back to AgriPlus 👋
      </Heading>

      {/* Stat Cards */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <StatCard
          label="Open Orders"
          number="4"
          icon={MdOutlineShoppingCart}
          color="green.500"
        />
        <StatCard
          label="Deliveries in Transit"
          number="2"
          icon={TbTruckDelivery}
          color="orange.500"
        />
        
      </SimpleGrid>

      {/* Main Grid */}
      <SimpleGrid mt={10} columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Left Side: Quick Actions & Orders */}
        <VStack spacing={6} align="stretch">
          <Box bg="white" p={6} rounded="xl" shadow="md">
            <Heading fontSize="lg" mb={4}>
              Quick Actions
            </Heading>
            <Flex gap={4} wrap="wrap">
              <Button colorScheme="green" variant="solid">
                Re-Order
              </Button>
              <Button colorScheme="blue" variant="outline">
                Track Delivery
              </Button>
              
            </Flex>
          </Box>

          <Box bg="white" p={6} rounded="xl" shadow="md">
            <Heading fontSize="lg" mb={4}>
              Recent Orders
            </Heading>
            <VStack align="start" spacing={3}>
              <Text>• 50kg Maize - Delivered</Text>
              <Text>• 30kg Fertilizer - In Transit</Text>
              <Text>• Watering Cans x2 - Pending</Text>
              <Link as={RouterLink} to="/orders" color="blue.500">
                View all orders →
              </Link>
            </VStack>
          </Box>
        </VStack>

        {/* Right Side: Community Box */}
        <Box bg="white" p={6} rounded="xl" shadow="md">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading fontSize="lg">AgriPlus Community</Heading>
            <Link as={RouterLink} to="/community" color="blue.500">
              Visit →
            </Link>
          </Flex>
          <Divider mb={4} />
          <Text fontWeight="medium" mb={2}>
            🌱 “What’s the best pest repellent for tomatoes this rainy season?”
          </Text>
          <Text fontSize="sm" color="gray.600">
            12 answers • Last replied 1h ago by @ChineduAgro
          </Text>

          <Divider my={4} />

          <Text fontWeight="medium" mb={2}>
            🚜 “How to store harvested cassava without spoilage?”
          </Text>
          <Text fontSize="sm" color="gray.600">
            8 answers • Trending • Posted by @MamaNgozi
          </Text>
        </Box>
      </SimpleGrid>
    </Box>
    </DashBoardLayout>
  );
};


const StatCard = ({ label, number, icon, color }) => (
  <Box bg="white" p={6} rounded="xl" shadow="md">
    <Flex align="center" justify="space-between">
      <Box>
        <Stat>
          <StatLabel>{label}</StatLabel>
          <StatNumber fontSize="2xl">{number}</StatNumber>
        </Stat>
      </Box>
      <Icon as={icon} boxSize={10} color={color} />
    </Flex>
  </Box>
  
);


export default DashboardPage;
