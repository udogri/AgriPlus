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
  Avatar,
  Spinner,
  HStack,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  ModalCloseButton,
  Center,
  Image,
} from "@chakra-ui/react";
import { MdOutlineShoppingCart } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { FiMoreVertical, FiUpload } from "react-icons/fi";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useEffect, useState } from "react";
import DashBoardLayout from "../../DashboardLayout";
import { useParams } from "react-router-dom";

const DashboardPage = () => {
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { uid } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editData, setEditData] = useState({
    fullName: "",
    bio: "",
    profilePhotoUrl: "",
    coverPhotoUrl: ""
  });

  useEffect(() => {
    const fetchBuyer = async () => {
      try {
        const docRef = doc(db, "buyers", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBuyer(docSnap.data());
          setEditData(docSnap.data());
        } else {
          toast({
            title: "Profile not found",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        toast({
          title: "Error fetching profile",
          description: err.message,
          status: "error",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBuyer();
  }, [uid]);

  const handleSave = async () => {
    try {
      const ref = doc(db, "buyers", uid);
      await updateDoc(ref, {
        fullName: editData.fullName,
        bio: editData.bio,
        profilePhotoUrl: editData.profilePhotoUrl,
        coverPhotoUrl: editData.coverPhotoUrl,
      });
      setBuyer({ ...buyer, ...editData });
      toast({ title: "Profile updated", status: "success", duration: 3000 });
      onClose();
    } catch (err) {
      toast({ title: "Error updating profile", description: err.message, status: "error" });
    }
  };

  if (loading) {
    return (
      <Box mt="60px" textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!buyer) return null;

  return (
    <DashBoardLayout active="buyer" role="buyer" showNav>
      <Box p={6} bg="gray.50" minH="100vh">
        {/* Cover Image Header */}
        <Box position="relative" mb={24}>
          <Box
            h="200px"
            bg="gray"
            bgSize="cover"
            bgPosition="center"
            borderTopRadius="md"
          />
          <Box
            position="absolute"
            top="120px"
            left="12%"
            transform="translateX(-50%)"
            textAlign="left"
          >
            <Avatar
              size="2xl"
              name={buyer.fullName}
              src={buyer.profilePhotoUrl}
              border="4px solid white"
              mb={2}
              cursor="pointer"
              onClick={onOpen}
            />
            <Text fontWeight="bold" fontSize="xl">{buyer.fullName}</Text>
            <Text color="gray.600" mb={2}>{buyer.bio || "No bio yet"}</Text>
            
          </Box>
          <Box position="absolute" top="10px" right="20px">
          <Menu>
              <MenuButton as={Button} size="sm" color="white" variant="none">
                <FiMoreVertical />
              </MenuButton>
              <MenuList>
                <MenuItem onClick={onOpen}>Edit Profile</MenuItem>
                <MenuItem>View Profile</MenuItem>
              </MenuList>
            </Menu>
            </Box>
        </Box>

        {/* Stat Cards */}
        {/* <SimpleGrid  columns={{ base: 1, md: 2 }} spacing={6}>
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
        </SimpleGrid> */}

        {/* Posts Placeholder */}
        <Text mt={150} fontSize="xl" fontWeight="bold">Posts</Text>
        <Box
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="md"
          p={12}
          mt={6}
          textAlign="center"
          color="gray.500"
        >
          <Icon as={FiUpload} boxSize={10} mb={2} />
          <Text fontSize="md">You haven’t made any posts yet</Text>
          <Button mt={4} size="sm" colorScheme="teal">
            Create Post
          </Button>
        </Box>

        {/* Edit Profile Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Profile</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Input
                  placeholder="Full Name"
                  value={editData.fullName}
                  onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                />
                <Input
                  placeholder="Bio"
                  value={editData.bio || ""}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                />
                <Input
                  placeholder="Profile Photo URL"
                  value={editData.profilePhotoUrl}
                  onChange={(e) => setEditData({ ...editData, profilePhotoUrl: e.target.value })}
                />
                {editData.profilePhotoUrl && (
                  <Center w="full">
                    <Avatar size="xl" src={editData.profilePhotoUrl} name={editData.fullName} />
                  </Center>
                )}
                <Input
                  placeholder="Cover Photo URL"
                  value={editData.coverPhotoUrl || ""}
                  onChange={(e) => setEditData({ ...editData, coverPhotoUrl: e.target.value })}
                />
                {editData.coverPhotoUrl && (
                  <Image
                    src={editData.coverPhotoUrl}
                    alt="Cover"
                    objectFit="cover"
                    width="100%"
                    height="120px"
                    borderRadius="md"
                  />
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" onClick={handleSave}>
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
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
