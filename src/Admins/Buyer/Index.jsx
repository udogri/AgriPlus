import {
  Box,
  Text,
  Avatar,
  Spinner,
  VStack,
  HStack,
  IconButton,
  Button,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Textarea,
  useDisclosure,
  useToast,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import { collection, getDoc, doc, onSnapshot, query, where, orderBy, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashBoardLayout from "../../DashboardLayout";
import { useAuth } from "../../AuthContext";

const DashboardPage = () => {
  const toast = useToast();
  const { uid: paramUid } = useParams();
  const { currentUser } = useAuth();
  const uid = currentUser?.uid || paramUid;

  const [buyer, setBuyer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const editProfileModal = useDisclosure();
  const avatarModal = useDisclosure();

  // Profile edit states
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState("");

  // Fetch buyer profile
  useEffect(() => {
    const fetchBuyer = async () => {
      setLoadingProfile(true);
      try {
        const ref = doc(db, "buyers", uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setBuyer(data);
          setEditName(data.fullName);
          setEditBio(data.bio || "");
          setPreviewPhoto(data.profilePhotoUrl || "");
        } else {
          toast({ title: "Profile not found", status: "error" });
        }
      } catch (err) {
        toast({
          title: "Error fetching profile",
          description: err.message,
          status: "error",
        });
      } finally {
        setLoadingProfile(false);
      }
    };
    if (uid) fetchBuyer();
  }, [uid, toast]);

  const handleSaveProfile = async () => {
    try {
      let photoUrl = previewPhoto;
      if (editPhoto) {
        const reader = new FileReader();
        reader.readAsDataURL(editPhoto);
        await new Promise((resolve) => (reader.onload = resolve));
        photoUrl = reader.result;
      }
      await updateDoc(doc(db, "buyers", uid), {
        fullName: editName,
        bio: editBio,
        profilePhotoUrl: photoUrl
      });
      toast({ title: "Profile updated", status: "success" });
      setBuyer({ ...buyer, fullName: editName, bio: editBio, profilePhotoUrl: photoUrl });
      editProfileModal.onClose();
    } catch (err) {
      toast({ title: "Error updating profile", description: err.message, status: "error" });
    }
  };


  // Fetch buyer orders
  useEffect(() => {
    if (!uid) {
      setLoadingOrders(false);
      return;
    }

    const ordersQuery = query(
      collection(db, "orders"),
      where("buyerId", "==", uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
        setLoadingOrders(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        toast({ title: "Error loading orders", status: "error" });
        setLoadingOrders(false);
      }
    );

    return () => unsubscribe();
  }, [uid, toast]);

  // Calculate Stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const pendingOrders = orders.filter((order) => order.status === "Pending").length;
  const completedOrders = orders.filter((order) => order.status === "Completed").length;

  if (loadingProfile || !buyer)
    return (
      <Box textAlign="center" mt={20}>
        <Spinner size="xl" />
      </Box>
    );

  return (
    <DashBoardLayout active="buyer" role="buyer" showNav>
      <Box w="100%" overflowX="hidden">
        <Flex direction="column" alignItems="center" w="100%">
          {/* Cover + Profile */}
          <Box position="relative" mb={24} w="100%">
            <Box
              h="200px"
              bgImage={`url(${buyer.coverPhotoUrl || ""})`}
              bgSize="cover"
              bgPosition="center"
              borderTopRadius="md"
              bg="gray.200"
            />
            <Box position="absolute" top="120px" left="20px">
              <VStack align="flex-start" spacing={2}>
                <Avatar
                  size="2xl"
                  src={buyer.profilePhotoUrl}
                  name={buyer.fullName}
                  border="4px solid white"
                  cursor="pointer"
                  onClick={avatarModal.onOpen}
                />
                <Text fontWeight="bold" fontSize="xl">
                  {buyer.fullName}
                </Text>
                <Text color="gray.600">{buyer.bio || ""}</Text>
              </VStack>
            </Box>

            {/* Menu button stays top-right */}
            <Box position="absolute" top="10px" right="20px">
              <Menu>
                <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" />
                <MenuList>
                  <MenuItem onClick={editProfileModal.onOpen}>Edit Profile</MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </Box>

          <Modal isOpen={editProfileModal.isOpen} onClose={editProfileModal.onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit Profile</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setEditPhoto(e.target.files[0]);
                    setPreviewPhoto(URL.createObjectURL(e.target.files[0]));
                  }}
                  mb={3}
                />
                
                {previewPhoto && <Image src={previewPhoto} borderRadius="full" boxSize="100px" mb={3} />}
                <Input placeholder="Full name" value={editName} onChange={(e) => setEditName(e.target.value)} mb={3} />
                <Textarea placeholder="Bio" value={editBio} onChange={(e) => setEditBio(e.target.value)} />
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="green" onClick={handleSaveProfile}>
                  Save
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Stats Section */}
          <Box w="90%" mt="100px" mb={10}>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
              <Stat p={4} borderWidth="1px" borderRadius="md" boxShadow="sm" bg="white">
                <StatLabel>Total Orders</StatLabel>
                <StatNumber>{totalOrders}</StatNumber>
              </Stat>
              <Stat p={4} borderWidth="1px" borderRadius="md" boxShadow="sm" bg="white">
                <StatLabel>Total Spent</StatLabel>
                <StatNumber>₦{totalSpent.toLocaleString()}</StatNumber>
              </Stat>
              <Stat p={4} borderWidth="1px" borderRadius="md" boxShadow="sm" bg="white">
                <StatLabel>Pending Orders</StatLabel>
                <StatNumber>{pendingOrders}</StatNumber>
              </Stat>
              <Stat p={4} borderWidth="1px" borderRadius="md" boxShadow="sm" bg="white">
                <StatLabel>Completed Orders</StatLabel>
                <StatNumber>{completedOrders}</StatNumber>
              </Stat>
            </SimpleGrid>
          </Box>

          {/* Recent Orders */}
          <Box w="90%" bg="white" p={4} borderRadius="md" boxShadow="sm">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Recent Orders
            </Text>
            {loadingOrders ? (
              <Spinner />
            ) : orders.length === 0 ? (
              <Text color="gray.500">No orders found.</Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {orders.slice(0, 5).map((order) => (
                  <Box
                    key={order.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    boxShadow="sm"
                  >
                    <HStack justify="space-between">
                      <Text fontWeight="bold">{order.productName}</Text>
                      <Text color="gray.500" fontSize="sm">
                        {new Date(order.createdAt.toDate()).toLocaleDateString()}
                      </Text>
                    </HStack>
                    <HStack justify="space-between" mt={2}>
                      <Text>Amount: ₦{order.totalAmount.toLocaleString()}</Text>
                      <Text
                        color={
                          order.status === "Completed"
                            ? "green.500"
                            : order.status === "Pending"
                            ? "orange.500"
                            : "red.500"
                        }
                        fontWeight="bold"
                      >
                        {order.status}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
            {orders.length > 5 && (
              <Button mt={4} colorScheme="green" w="full">
                View All Orders
              </Button>
            )}
          </Box>
        </Flex>
      </Box>
    </DashBoardLayout>
  );
};

export default DashboardPage;
