import React from "react";
import {
  ChakraProvider,
  Box,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  useColorModeValue,
  Grid,
  Button,
  Icon,
  VStack,
} from "@chakra-ui/react";
import { IoIosArrowForward } from "react-icons/io";
import { PiStudent } from "react-icons/pi";
import { TbCurrencyNaira } from "react-icons/tb";
import DashBoardLayout from "../../DashboardLayout";
import { MdOutlineShoppingCart } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    label: "Total Income",
    value: "$12,450",
    helpText: "This Month",
  },
  {
    label: "Items Sold",
    value: "340",
    helpText: "Up by 10%",
  },
  {
    label: "Clients",
    value: "86",
    helpText: "Active Clients",
  },
];

const inventory = [
  { name: "Tomatoes", stock: 45, unit: "kg" },
  { name: "Yam", stock: 120, unit: "tubers" },
  { name: "Corn", stock: 70, unit: "bags" },
  { name: "Goats", stock: 15, unit: "heads" },
];

const transactions = [
  { name: "John Doe", item: "Tomatoes", amount: "₦120", date: "2025-05-15" },
  { name: "Jane Smith", item: "Yam", amount: "₦300", date: "2025-05-14" },
  { name: "Aliyu Musa", item: "Goats", amount: "₦450", date: "2025-05-12" },
  { name: "Ngozi Uche", item: "Corn", amount: "₦220", date: "2025-05-10" },
];

function StatCard({ label, value, helpText }) {
  return (
    <Stat p={4} shadow="md" borderWidth="1px" borderRadius="lg">
      <StatLabel>{label}</StatLabel>
      <StatNumber>{value}</StatNumber>
      <StatHelpText>{helpText}</StatHelpText>
    </Stat>
  );
}

export default function FarmerDashboard() {

    const navigate = useNavigate();

  return (
    <DashBoardLayout active="Farmer">
      <Box p={5} bg={useColorModeValue("gray.50", "gray.800")} minH="100vh">
        <Heading mb={6} color="black">Welcome back, Oruaro</Heading>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mb="20px">
          <Stat pt="15px" paddingBottom="15px" pl="23px" pr="23px" bgGradient="linear(to-r, #20553C, #C4EF4B)" borderRadius="md" gap={18}>
            <StatLabel color="white">Total Income</StatLabel>
            <StatNumber display="flex" alignItems="center" fontSize="40px" color="white"><TbCurrencyNaira  /> 73400</StatNumber>
            <Button size="sm" mt={2} w="170px" p="10px 24px" h="40px" fontSize="14px" textColor="#39996B" onClick={() => navigate("/farmer/transactions")}  >Transaction history <Icon as={IoIosArrowForward} boxSize={5} ml={2} /></Button>
          </Stat>

          <VStack spacing={2} align="stretch" w="full" border="1px solid #EDEFF2" h="181px" overflow="hidden">
            <Box p={4} bg="white" borderRadius="md" border="1px solid #EDEFF2" display="grid" h="181px" gap={2}>

              {/* Total Students Funded */}
              <Stat p={4} bg="white" borderRadius="md" border="1px solid #EDEFF2" h="73px">
                <Flex direction="row" justify="space-between" align="center">
                  <StatLabel gap="5px" display="flex" alignItems="center" align="center" color="black" fontSize="20px">
                  <MdOutlineShoppingCart fontSize="20px" />
                    Total Items sold
                  </StatLabel>
                  <StatNumber fontSize="16px">11</StatNumber>
                </Flex>
              </Stat>

              {/* Total Disbursements */}
              <Stat p={4} bg="white" borderRadius="md" border="1px solid #EDEFF2" h="73px">
                <Flex direction="row" justify="space-between" align="center">
                  <StatLabel gap="5px" display="flex" alignItems="center" align="center" color="black" fontSize="20px">
                  <LuUserRound />
                    Total Clients
                  </StatLabel>
                  <StatNumber fontSize="20px">7</StatNumber>
                </Flex>
              </Stat>

            </Box>
          </VStack>
        </Grid>
        

        {/* Inventory */}
        <Box mb={8}>
        <Flex justifyContent="space-between">
          <Heading size="md" mb={4}>
            Inventory Overview
          </Heading>
          <Text onClick={() => navigate("/farmer/inventory")} cursor="pointer">View all</Text>
          </Flex>
          <SimpleGrid columns={[1, 2, 4]} spacing={4}>
            {inventory.map((item, i) => (
              <Box
                key={i}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                shadow="sm"
                bg="white"
              >
                <Text fontWeight="bold">{item.name}</Text>
                <Text>{`${item.stock} ${item.unit}`}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Transactions */}
        <Box>
          
          <Flex justifyContent="space-between">
          <Heading size="md" mb={4}>
          Recent Transactions          </Heading>
          <Text onClick={() => navigate("/farmer/transactions")} cursor="pointer">View all</Text>
          </Flex>
          <Box overflowX="auto">
            <Table variant="simple" bg="white" borderRadius="md" shadow="sm">
              <Thead bg="gray.100">
                <Tr>
                  <Th>Client</Th>
                  <Th>Item</Th>
                  <Th>Amount</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {transactions.map((tx, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <Flex align="center">
                        <Avatar name={tx.name} size="sm" mr={2} />
                        <Text>{tx.name}</Text>
                      </Flex>
                    </Td>
                    <Td>{tx.item}</Td>
                    <Td>{tx.amount}</Td>
                    <Td>{tx.date}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Box>
    </DashBoardLayout>
  );
}


