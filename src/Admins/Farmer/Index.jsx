import React, { useEffect, useState, useRef } from "react";
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { IoIosArrowForward } from "react-icons/io";
import { TbCurrencyNaira } from "react-icons/tb";
import DashBoardLayout from "../../DashboardLayout";
import { MdOutlineShoppingCart } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Adjust the path as needed

export default function FarmerDashboard() {
  const [displayName, setDisplayName] = useState("Farmer");
  const [inventory, setInventory] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.displayName) setDisplayName(data.displayName);
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    // Fetch inventory data
    const fetchInventory = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "farmerInventory"));
        const inv = [];
        querySnapshot.forEach((doc) => {
          inv.push({ id: doc.id, ...doc.data() });
        });
        setInventory(inv);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchUser();
    fetchInventory();
  }, []);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, "inventory", deleteId));
      setInventory((prev) => prev.filter((item) => item.id !== deleteId));
      onClose();
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <DashBoardLayout active="Farmer">
      <Box p={5} bg={useColorModeValue("gray.50", "gray.800")} minH="100vh">
        <Heading mb={6} color="black">
          Welcome back, {displayName}
        </Heading>

        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
          gap={4}
          mb="20px"
        >
          <Stat
            pt="15px"
            paddingBottom="15px"
            pl="23px"
            pr="23px"
            bgGradient="linear(to-r, #20553C, #C4EF4B)"
            borderRadius="md"
            gap={18}
          >
            <StatLabel color="white">Total Income</StatLabel>
            <StatNumber
              display="flex"
              alignItems="center"
              fontSize="40px"
              color="white"
            >
              <TbCurrencyNaira /> 73400
            </StatNumber>
            <Button
              size="sm"
              mt={2}
              w="170px"
              p="10px 24px"
              h="40px"
              fontSize="14px"
              textColor="#39996B"
              onClick={() => navigate("/farmer/transactions")}
            >
              Transaction history{" "}
              <Icon as={IoIosArrowForward} boxSize={5} ml={2} />
            </Button>
          </Stat>

          <VStack
            spacing={2}
            align="stretch"
            w="full"
            border="1px solid #EDEFF2"
            h="181px"
            overflow="hidden"
          >
            <Box
              p={4}
              bg="white"
              borderRadius="md"
              border="1px solid #EDEFF2"
              display="grid"
              h="181px"
              gap={2}
            >
              <Stat p={4} bg="white" borderRadius="md" border="1px solid #EDEFF2" h="73px">
                <Flex direction="row" justify="space-between" align="center">
                  <StatLabel
                    gap="5px"
                    display="flex"
                    alignItems="center"
                    align="center"
                    color="black"
                    fontSize="20px"
                  >
                    <MdOutlineShoppingCart fontSize="20px" />
                    Total Items sold
                  </StatLabel>
                  <StatNumber fontSize="16px">11</StatNumber>
                </Flex>
              </Stat>

              <Stat p={4} bg="white" borderRadius="md" border="1px solid #EDEFF2" h="73px">
                <Flex direction="row" justify="space-between" align="center">
                  <StatLabel
                    gap="5px"
                    display="flex"
                    alignItems="center"
                    align="center"
                    color="black"
                    fontSize="20px"
                  >
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
            <Text onClick={() => navigate("/farmer/inventory")} cursor="pointer">
              View all
            </Text>
          </Flex>
          <SimpleGrid columns={[1, 2, 4]} spacing={4}>
            {inventory.map((item) => (
              <Box
                key={item.id}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                align="center"
                shadow="sm"
                bg="white"
                position="relative"
              >
                <Text fontWeight="bold">{item.name}</Text>
                {/* <Text>{`${item.quantity}`}</Text> */}

                
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Transactions */}
        <Box>
          <Flex justifyContent="space-between">
            <Heading size="md" mb={4}>
              Recent Transactions
            </Heading>
            <Text
              onClick={() => navigate("/farmer/transactions")}
              cursor="pointer"
            >
              View all
            </Text>
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
                {[
                  { name: "John Doe", item: "Tomatoes", amount: "₦120", date: "2025-05-15" },
                  { name: "Jane Smith", item: "Yam", amount: "₦300", date: "2025-05-14" },
                  { name: "Aliyu Musa", item: "Goats", amount: "₦450", date: "2025-05-12" },
                  { name: "Ngozi Uche", item: "Corn", amount: "₦220", date: "2025-05-10" },
                ].map((tx, idx) => (
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

        {/* Delete Confirmation Modal */}
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            onClose();
            setDeleteId(null);
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Item
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete this item? This action cannot be
                undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </DashBoardLayout>
  );
}
