// src/pages/farmer/TransactionHistoryPage.jsx
import {
    Box,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    useColorModeValue,
  } from '@chakra-ui/react';
import DashBoardLayout from '../../DashboardLayout';
  
  const mockTransactions = [
    {
      id: 1,
      item: 'Tomatoes',
      quantity: '100kg',
      amount: '₦50,000',
      buyer: 'AgroMarket Ltd',
      date: '2025-05-10',
    },
    {
      id: 2,
      item: 'Yam',
      quantity: '50 tubers',
      amount: '₦30,000',
      buyer: 'FarmConnect',
      date: '2025-05-15',
    },
  ];
  
  export default function FarmerTransactions() {
    const bg = useColorModeValue('white', 'gray.800');
  
    return (
      <DashBoardLayout active="Transaction History">
        <Box bg={bg} p={6} borderRadius="md" boxShadow="md">
          <Heading size="md" mb={4}>Transaction History</Heading>
  
          {mockTransactions.length === 0 ? (
            <Text color="gray.500">No transactions recorded yet.</Text>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" colorScheme="teal">
                <Thead>
                  <Tr>
                    <Th>Item</Th>
                    <Th>Quantity</Th>
                    <Th>Amount</Th>
                    <Th>Buyer</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mockTransactions.map(tx => (
                    <Tr key={tx.id}>
                      <Td>{tx.item}</Td>
                      <Td>{tx.quantity}</Td>
                      <Td>{tx.amount}</Td>
                      <Td>{tx.buyer}</Td>
                      <Td>{tx.date}</Td>
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
  