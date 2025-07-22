// src/pages/DashboardPage.jsx
import {
  Box,
  Text,
  Icon,
  Avatar,
  Spinner,
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
  Image,
  Button
} from "@chakra-ui/react";
import { FiMoreVertical, FiUpload } from "react-icons/fi";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../firebaseConfig";
import { useEffect, useState } from "react";
import DashBoardLayout from "../../DashboardLayout";
import { useParams } from "react-router-dom";
import { IoMdAddCircleOutline } from "react-icons/io";
import CreatePostModal from "../../Components/createPost";

const DashboardPage = () => {
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const { uid } = useParams();
  const toast = useToast();

  // For Edit Profile modal
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose
  } = useDisclosure();

  // For Full Avatar modal
  const {
    isOpen: isAvatarOpen,
    onOpen: onAvatarOpen,
    onClose: onAvatarClose
  } = useDisclosure();

  // For Create Post modal
  const {
    isOpen: isPostOpen,
    onOpen: onPostOpen,
    onClose: onPostClose
  } = useDisclosure();

  const [editData, setEditData] = useState({
    fullName: "",
    bio: "",
    profilePhotoUrl: "",
    coverPhotoUrl: ""
  });

  const [profilePreview, setProfilePreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  useEffect(() => {
    const fetchBuyer = async () => {
      try {
        const ref = doc(db, "buyers", uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setBuyer(data);
          setEditData(data);
          setProfilePreview(data.profilePhotoUrl);
          setCoverPreview(data.coverPhotoUrl);
        } else {
          toast({ title: "Profile not found", status: "error", duration: 3000 });
        }
      } catch (err) {
        toast({
          title: "Error fetching profile",
          description: err.message,
          status: "error",
          duration: 4000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBuyer();
  }, [uid]);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
  
    if (field === "profile") {
      setEditData((prev) => ({ ...prev, profileFile: file }));
      setProfilePreview(URL.createObjectURL(file));
    } else {
      setEditData((prev) => ({ ...prev, coverFile: file }));
      setCoverPreview(URL.createObjectURL(file));
    }
  };
  


const handleSave = async () => {
  try {
    const updates = {
      fullName: editData.fullName,
      bio: editData.bio || "",
    };

    // Upload profile photo if new
    if (editData.profileFile) {
      const profileRef = ref(storage, `profilePhotos/${uid}-${Date.now()}`);
      await uploadBytes(profileRef, editData.profileFile);
      updates.profilePhotoUrl = await getDownloadURL(profileRef);
    }

    // Upload cover photo if new
    if (editData.coverFile) {
      const coverRef = ref(storage, `coverPhotos/${uid}-${Date.now()}`);
      await uploadBytes(coverRef, editData.coverFile);
      updates.coverPhotoUrl = await getDownloadURL(coverRef);
    }

    await updateDoc(doc(db, "buyers", uid), updates);
    setBuyer((prev) => ({ ...prev, ...updates }));
    toast({ title: "Profile updated", status: "success", duration: 3000 });
    onEditClose();
  } catch (err) {
    toast({
      title: "Update failed",
      description: err.message,
      status: "error",
      duration: 4000,
    });
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
        <Box position="relative" mb={24}>
          <Box
            h="200px"
            bgImage={`url(${buyer.coverPhotoUrl || ""})`}
            bgSize="cover"
            bgPosition="center"
            borderTopRadius="md"
            bg="gray.200"
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
              onClick={onAvatarOpen}
            />
            <Text fontWeight="bold" fontSize="xl">
              {buyer.fullName}
            </Text>
            <Text color="gray.600" mb={2}>
              {buyer.bio || "No bio yet"}
            </Text>
          </Box>
          <Box position="absolute" top="10px" right="20px">
            <Menu>
              <MenuButton as={Button} size="sm" colorScheme="gray" variant="ghost">
                <FiMoreVertical />
              </MenuButton>
              <MenuList>
                <MenuItem onClick={onEditOpen}>Edit Profile</MenuItem>
                {/* <MenuItem>View Profile</MenuItem> */}
              </MenuList>
            </Menu>
          </Box>
        </Box>

        <Text mt={150} fontSize="xl" fontWeight="bold">
          Posts
        </Text>
        <Box
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="md"
          p={12}
          mt={6}
          textAlign="center"
          color="gray.500"
        >
          <Text fontSize="md">You haven’t made any posts yet</Text>
          <Icon as={IoMdAddCircleOutline} boxSize={10} mt="50px" />
          {/* <Button onClick={onPostOpen} colorScheme="green" mt={4}>Create Post</Button> */}
          <CreatePostModal isOpen={isPostOpen} onClose={onPostClose} />
        </Box>

        {/* Edit Profile Modal */}
        <Modal isOpen={isEditOpen} onClose={onEditClose}>
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
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "profile")}
                />
                {profilePreview && (
                  <Avatar size="xl" src={profilePreview} name={editData.fullName} />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "cover")}
                />
                {coverPreview && (
                  <Image
                    src={coverPreview}
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

        {/* Full View Avatar Modal */}
        <Modal isOpen={isAvatarOpen} onClose={onAvatarClose} isCentered size="xl">
          <ModalOverlay />
          <ModalContent bg="transparent" boxShadow="none">
            <ModalCloseButton color="white" />
            <Image
              src={buyer.profilePhotoUrl}
              alt="Full Profile"
              borderRadius="full"
              maxH="80vh"
              objectFit="contain"
              mx="auto"
            />
          </ModalContent>
        </Modal>
      </Box>
    </DashBoardLayout>
  );
};

export default DashboardPage;
