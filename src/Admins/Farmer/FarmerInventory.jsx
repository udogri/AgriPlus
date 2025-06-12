import {
  Box,
  Heading,
  Button,
  Stack,
  useColorModeValue,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  SimpleGrid,
  Image,
  FormControl,
  FormLabel,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import axios from 'axios';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import DashBoardLayout from '../../DashboardLayout';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// ... imports remain unchanged

const FarmerInventory = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const [inventory, setInventory] = useState([]);
  const [currentItem, setCurrentItem] = useState({ name: '', quantity: '', unit: '', price: '', image: '' });
  const [imageFile, setImageFile] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      if (currentUser) {
        setUser(currentUser);
        fetchInventory(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchInventory = async (uid) => {
    try {
      setLoading(true);
      const q = query(collection(db, 'farmerInventory'), where('uid', '==', uid));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventory(items);
    } catch (error) {
      alert('Error fetching inventory: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToImgBB = async (file) => {
    const apiKey = 'bc6aa3a9cee7036d9b191018c92c893a';
    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);
    try {
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData);
      return response.data.data.url;
    } catch (error) {
      alert('Error uploading image.');
      return '';
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      let imageUrl = currentItem.image || '';
      if (imageFile) {
        imageUrl = await uploadImageToImgBB(imageFile);
      }

      const data = {
        name: currentItem.name,
        quantity: currentItem.quantity,
        unit: currentItem.unit,
        price: currentItem.price,
        updatedAt: new Date().toISOString().split('T')[0],
        image: imageUrl,
        uid: user.uid,
      };

      if (isEdit) {
        const itemRef = doc(db, 'farmerInventory', currentItem.id);
        await updateDoc(itemRef, data);
      } else {
        await addDoc(collection(db, 'farmerInventory'), data);
      }

      await fetchInventory(user.uid);
      onFormClose();
      setCurrentItem({ name: '', quantity: '', unit: '', price: '', image: '' });
      setImageFile(null);
      setIsEdit(false);
    } catch (error) {
      alert('Error saving item: ' + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const openEditForm = item => {
    setIsEdit(true);
    setCurrentItem(item);
    onFormOpen();
  };

  const confirmDelete = id => {
    setDeleteId(id);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteDoc(doc(db, 'farmerInventory', deleteId));
      await fetchInventory(user.uid);
      onDeleteClose();
    } catch (error) {
      alert('Error deleting item: ' + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashBoardLayout>
      <Box bg={bg} p={6} borderRadius="md" boxShadow="md">
        <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={4}>
          <Heading size="md">My Inventory</Heading>
          <Button background="#39996B" color="white" onClick={() => {
            setCurrentItem({ name: '', quantity: '', unit: '', price: '', image: '' });
            setIsEdit(false);
            setImageFile(null);
            onFormOpen();
          }}>
            + Add New Item
          </Button>
        </Stack>

        {/* Add/Edit Modal */}
        <Modal isOpen={isFormOpen} onClose={onFormClose} size="lg" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{isEdit ? 'Edit Item' : 'Add Inventory Item'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={3}>
                {['Name', 'Quantity', 'Unit', 'Price (₦)'].map((label, index) => {
                  const key = label.toLowerCase().split(' ')[0];
                  return (
                    <FormControl key={index}>
                      <FormLabel>{label}</FormLabel>
                      <Input
                        value={currentItem[key]}
                        onChange={e => setCurrentItem({ ...currentItem, [key]: e.target.value })}
                        placeholder={`e.g. ${label === 'Price (₦)' ? '500' : label === 'Quantity' ? '100' : label}`}
                      />
                    </FormControl>
                  );
                })}
                <FormControl>
                  <FormLabel>Image</FormLabel>
                  <Input
                    type="file"
                    onChange={e => setImageFile(e.target.files[0])}
                  />
                  {uploadingImage && <Spinner mt={2} size="sm" />}
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button
                background="#39996B"
                color="white"
                mr={3}
                isLoading={submitLoading}
                onClick={handleSubmit}
              >
                {isEdit ? 'Update' : 'Add'}
              </Button>
              <Button onClick={onFormClose} isDisabled={submitLoading}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirm Delete</ModalHeader>
            <ModalCloseButton />
            <ModalBody>Are you sure you want to delete this item?</ModalBody>
            <ModalFooter>
              <Button
                colorScheme="red"
                mr={3}
                onClick={handleDelete}
                isLoading={deleteLoading}
              >
                Delete
              </Button>
              <Button onClick={onDeleteClose} isDisabled={deleteLoading}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Inventory List */}
        {loading ? (
          <Stack mt={10} align="center">
            <Spinner size="xl" />
            <Text>Loading Inventory...</Text>
          </Stack>
        ) : inventory.length === 0 ? (
          <Stack mt={10} align="center" spacing={3}>
            <Icon as={DeleteIcon} w={8} h={8} color="gray.400" />
            <Text color="gray.500">No items in inventory.</Text>
          </Stack>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6} mt={4}>
            {inventory.map(item => (
              <Box key={item.id} borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md">
                <Image src={item.image} alt={item.name} objectFit="cover" width="100%" height="150px" />
                <Box p={4}>
                  <Heading size="sm" mb={2}>{item.name}</Heading>
                  <Text><strong>Quantity:</strong> {item.quantity} {item.unit}</Text>
                  <Text><strong>Price:</strong> ₦{item.price}</Text>
                  <Text><strong>Updated:</strong> {item.updatedAt}</Text>
                  <Stack direction="row" mt={3}>
                    <Button size="sm" onClick={() => openEditForm(item)}>Edit</Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => confirmDelete(item.id)}
                      isDisabled={deleteLoading}
                    >
                      {deleteLoading && deleteId === item.id ? <Spinner size="xs" /> : 'Delete'}
                    </Button>
                  </Stack>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </DashBoardLayout>
  );
};

export default FarmerInventory;
