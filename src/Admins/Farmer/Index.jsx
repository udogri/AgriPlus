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
} from "@chakra-ui/react";

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
  { name: "John Doe", item: "Tomatoes", amount: "$120", date: "2025-05-15" },
  { name: "Jane Smith", item: "Yam", amount: "$300", date: "2025-05-14" },
  { name: "Aliyu Musa", item: "Goats", amount: "$450", date: "2025-05-12" },
  { name: "Ngozi Uche", item: "Corn", amount: "$220", date: "2025-05-10" },
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
  return (
    <ChakraProvider>
      <Box p={5} bg={useColorModeValue("gray.50", "gray.800")} minH="100vh">
        <Heading mb={6}>Farmer’s Dashboard</Heading>

        {/* Stats */}
        <SimpleGrid columns={[1, null, 3]} spacing={6} mb={8}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </SimpleGrid>

        {/* Inventory */}
        <Box mb={8}>
          <Heading size="md" mb={4}>
            Inventory Overview
          </Heading>
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
          <Heading size="md" mb={4}>
            Recent Transactions
          </Heading>
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
    </ChakraProvider>
  );
}


