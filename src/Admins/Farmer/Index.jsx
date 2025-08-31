import React, { useEffect, useState, useRef } from "react";
import {
  Box, Text, SimpleGrid, Stat, StatLabel, StatNumber, Flex, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Avatar, useColorModeValue, Grid, Button, Icon, VStack, AlertDialog, AlertDialogBody,
  AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, useDisclosure, Spinner
} from "@chakra-ui/react";
import { IoIosArrowForward } from "react-icons/io";
import { TbCurrencyNaira } from "react-icons/tb";
import DashBoardLayout from "../../DashboardLayout";
import { MdOutlineShoppingCart } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function FarmerDashboard() {
  const [userData, setUserData] = useState({
    fullName: "",
    profilePhotoUrl: "",
    bio: "",
    role: "",
    userName: "",
  });
  const [inventory, setInventory] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.warn("⚠️ No authenticated user");
        return setIsLoadingUser(false);
      }

      console.log("✅ Authenticated user:", user.uid);

      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (!userSnap.exists()) {
          console.warn('⚠️ User doc not found in "users" collection');
          return;
        }

        const { adminId: role } = userSnap.data();
        console.log("ℹ️ User role from users collection:", role);

        if (!role) {
          console.warn("⚠️ adminId not set in user doc");
          return;
        }

        const profileSnap = await getDoc(doc(db, `${role}s`, user.uid));
        if (profileSnap.exists()) {
          console.log("✅ Loaded profile data:", profileSnap.data());
          setUserData({ ...(profileSnap.data()), role });
        } else {
          console.warn(`⚠️ No ${role} profile at ${role}s/${user.uid}`);
        }
      } catch (e) {
        console.error("❌ Error loading sidebar data", e);
      } finally {
        setIsLoadingUser(false);
      }
    });

    const fetchInventory = async () => {
      setIsLoadingInventory(true);
      try {
        const invQuery = query(collection(db, "farmerInventory"), where("uid", "==", uid));
        const querySnapshot = await getDocs(invQuery);
        const inv = [];
        querySnapshot.forEach((doc) => {
          inv.push({ id: doc.id, ...doc.data() });
        });
        setInventory(inv);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setIsLoadingInventory(false);
      }
    };

    fetchInventory();
    return () => unsub();
  }, [uid]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "farmerInventory", deleteId));
      setInventory((prev) => prev.filter((item) => item.id !== deleteId));
      onClose();
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashBoardLayout active="Farmer">
      <Box p={5} bg={useColorModeValue("gray.50", "gray.800")} minH="100vh">
        <Flex align="center" mb={6} color="black">
          {isLoadingUser ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Avatar
                size="md"
                name={userData.fullName}
                src={userData.profilePhotoUrl}
                mr={4}
              />
              <Heading>{`Welcome back, ${userData.fullName}`}</Heading>
            </>
          )}
        </Flex>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mb="20px">
          <Stat pt="15px" paddingBottom="15px" pl="23px" pr="23px" bgGradient="linear(to-r, #20553C, #C4EF4B)" borderRadius="md" gap={18}>
            <StatLabel color="white">Total Income</StatLabel>
            <StatNumber display="flex" alignItems="center" fontSize="40px" color="white">
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
              Transaction history <Icon as={IoIosArrowForward} boxSize={5} ml={2} />
            </Button>
          </Stat>

          <VStack spacing={2} align="stretch" w="full" border="1px solid #EDEFF2" h="181px" overflow="hidden">
            <Box p={4} bg="white" borderRadius="md" border="1px solid #EDEFF2" display="grid" h="181px" gap={2}>
              <Stat p={4} bg="white" borderRadius="md" border="1px solid #EDEFF2" h="73px">
                <Flex direction="row" justify="space-between" align="center">
                  <StatLabel display="flex" alignItems="center" color="black" fontSize="20px">
                    <MdOutlineShoppingCart fontSize="20px" /> Total Items sold
                  </StatLabel>
                  <StatNumber fontSize="16px">11</StatNumber>
                </Flex>
              </Stat>

              <Stat p={4} bg="white" borderRadius="md" border="1px solid #EDEFF2" h="73px">
                <Flex direction="row" justify="space-between" align="center">
                  <StatLabel display="flex" alignItems="center" color="black" fontSize="20px">
                    <LuUserRound /> Total Clients
                  </StatLabel>
                  <StatNumber fontSize="20px">7</StatNumber>
                </Flex>
              </Stat>
            </Box>
          </VStack>
        </Grid>

        {/* Inventory Section */}
        <Box mb={8}>
          <Flex justifyContent="space-between">
            <Heading size="md" mb={4}>Inventory Overview</Heading>
            <Text onClick={() => navigate("/farmer/inventory")} cursor="pointer">View all</Text>
          </Flex>

          {isLoadingInventory ? (
            <Flex justify="center" py={10}>
              <Spinner size="lg" thickness="4px" speed="0.65s" color="green.500" />
            </Flex>
          ) : (
            <SimpleGrid columns={[1, 2, 4]} spacing={4}>
              {inventory.length === 0 ? (
                <Text>No items in inventory.</Text>
              ) : (
                inventory.map((item) => (
                  <Box
                    key={item.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    shadow="sm"
                    bg="white"
                    position="relative"
                  >
                    <Text fontWeight="bold">{item.name}</Text>
                  </Box>
                ))
              )}
            </SimpleGrid>
          )}
        </Box>

        {/* Transactions Table */}
        <Box>
          <Flex justifyContent="space-between">
            <Heading size="md" mb={4}>Recent Transactions</Heading>
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
                {[
                  { name: "John Doe", item: "Tomatoes", amount: "₦120", date: "2025-05-15" },
                  { name: "Jane Smith", item: "Yam", amount: "₦300", date: "2025-05-14" },
                  { name: "Aliyu Musa", item: "Goats", amount: "₦450", date: "2025-05-12" },
                  { name: "Ngozi Uche", item: "Corn", amount: "₦220", date: "2025-05-10" },
                ].map((tx, idx) => (
                  <Tr key={idx}>
                    <Td><Flex align="center"><Avatar name={tx.name} size="sm" mr={2} /><Text>{tx.name}</Text></Flex></Td>
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
              <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Item</AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to delete this item? This action cannot be undone.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>Cancel</Button>
                <Button colorScheme="red" onClick={handleDeleteConfirm} isLoading={isDeleting} ml={3}>
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
