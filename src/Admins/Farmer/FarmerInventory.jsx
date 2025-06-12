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

const FarmerInventory = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const [inventory, setInventory] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    name: '',
    quantity: '',
    unit: '',
    price: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [user, setUser] = useState(null);

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

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
    const q = query(collection(db, 'farmerInventory'), where('uid', '==', uid));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setInventory(items);
  };

  const uploadImageToImgBB = async file => {
    const apiKey = 'bc6aa3a9cee7036d9b191018c92c893a';
    const formData = new FormData();
    formData.append('image', file);
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      formData
    );
    return response.data.data.url;
  };

  const handleSubmit = async () => {
    try {
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
        uid: user.uid, // Attach the user's ID
      };

      if (isEdit) {
        const itemRef = doc(db, 'farmerInventory', currentItem.id);
        await updateDoc(itemRef, data);
      } else {
        await addDoc(collection(db, 'farmerInventory'), data);
      }

      fetchInventory(user.uid);
      onFormClose();
      setCurrentItem({ name: '', quantity: '', unit: '', price: '', image: '' });
      setImageFile(null);
      setIsEdit(false);
    } catch (error) {
      alert('Error saving item: ' + error.message);
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
      await deleteDoc(doc(db, 'farmerInventory', deleteId));
      fetchInventory(user.uid);
      onDeleteClose();
    } catch (error) {
      alert('Error deleting item: ' + error.message);
    }
  };

  return (
    <DashBoardLayout>
      <Box bg={bg} p={6} borderRadius="md" boxShadow="md">
        <Stack
          direction={{ base: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Heading size="md">My Inventory</Heading>
          <Button background="#39996B" color="white" onClick={() => {
            setCurrentItem({ name: '', quantity: '', unit: '', price: '', image: '' });
            setIsEdit(false);
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
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={currentItem.name}
                    onChange={e =>
                      setCurrentItem({ ...currentItem, name: e.target.value })
                    }
                    placeholder="e.g. Tomatoes"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Quantity</FormLabel>
                  <Input
                    value={currentItem.quantity}
                    onChange={e =>
                      setCurrentItem({ ...currentItem, quantity: e.target.value })
                    }
                    placeholder="e.g. 100"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Unit</FormLabel>
                  <Input
                    value={currentItem.unit}
                    onChange={e =>
                      setCurrentItem({ ...currentItem, unit: e.target.value })
                    }
                    placeholder="e.g. kg, bags"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Price (₦)</FormLabel>
                  <Input
                    value={currentItem.price}
                    onChange={e =>
                      setCurrentItem({ ...currentItem, price: e.target.value })
                    }
                    placeholder="e.g. 500"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Image</FormLabel>
                  <Input type="file" onChange={e => setImageFile(e.target.files[0])} />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button
                background="#39996B"
                color="white"
                mr={3}
                onClick={handleSubmit}
              >
                {isEdit ? 'Update' : 'Add'}
              </Button>
              <Button onClick={onFormClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirm Delete</ModalHeader>
            <ModalCloseButton />
            <ModalBody>Are you sure you want to delete this item?</ModalBody>
            <ModalFooter>
              <Button colorScheme="red" mr={3} onClick={handleDelete}>
                Delete
              </Button>
              <Button onClick={onDeleteClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Inventory Display */}
        {inventory.length === 0 ? (
          <Stack mt={10} align="center" spacing={3}>
            <Icon as={DeleteIcon} w={8} h={8} color="gray.400" />
            <Text color="gray.500">No items in inventory.</Text>
          </Stack>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6} mt={4}>
            {inventory.map(item => (
              <Box
                key={item.id}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  objectFit="cover"
                  width="100%"
                  height="150px"
                />
                <Box p={4}>
                  <Heading size="sm" mb={2}>
                    {item.name}
                  </Heading>
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
                    >
                      Delete
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
