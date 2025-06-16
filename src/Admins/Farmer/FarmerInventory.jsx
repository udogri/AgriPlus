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
  Flex,
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
import { useToast } from '@chakra-ui/react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { TiDocument } from 'react-icons/ti';


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
  const toast = useToast();


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
      const { name, quantity, unit, price } = currentItem;
  
      // Basic field validation
      if (!name || !quantity || !unit || !price || (!isEdit && !imageFile)) {
        toast({
          title: 'Missing Fields',
          description: 'Please fill in all required fields including an image.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
  
      setSubmitLoading(true);
  
      let imageUrl = currentItem.image || '';
      if (imageFile) {
        imageUrl = await uploadImageToImgBB(imageFile);
      }
  
      const data = {
        name,
        quantity,
        unit,
        price,
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
  
      toast({
        title: isEdit ? 'Item updated successfully.' : 'Item added successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
  
      await fetchInventory(user.uid);
      onFormClose();
      setCurrentItem({ name: '', quantity: '', unit: '', price: '', image: '' });
      setImageFile(null);
      setIsEdit(false);
    } catch (error) {
      toast({
        title: 'Error saving item.',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setSubmitLoading(false);
    }
  };
  
  
  
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteDoc(doc(db, 'farmerInventory', deleteId));
      toast({
        title: 'Item deleted successfully.',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      await fetchInventory(user.uid);
      onDeleteClose();
    } catch (error) {
      toast({
        title: 'Error deleting item.',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setDeleteLoading(false);
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

  

  return (
    <DashBoardLayout>
      <Box bg={bg} p={6} borderRadius="md" boxShadow="md">
        <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={4}>
          <Heading size="md">My Inventory</Heading>
          <Button
  background="#39996B"
  color="white"
  _hover={{ background: '#2e7a58' }} // darker green on hover
  onClick={() => {
    setCurrentItem({ name: '', quantity: '', unit: '', price: '', image: '' });
    setIsEdit(false);
    setImageFile(null);
    onFormOpen();
  }}
>
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
        {/* Name Field */}
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            type="text"
            value={currentItem.name}
            onChange={e => setCurrentItem({ ...currentItem, name: e.target.value })}
            placeholder="e.g. Maize"
          />
        </FormControl>

        {/* Quantity Field */}
        <FormControl isRequired>
          <FormLabel>Quantity</FormLabel>
          <Input
            type="number"
            min="0"
            value={currentItem.quantity}
            onChange={e => setCurrentItem({ ...currentItem, quantity: e.target.value })}
            placeholder="e.g. 100"
          />
        </FormControl>

        {/* Unit Field */}
        <FormControl isRequired>
          <FormLabel>Unit</FormLabel>
          <Input
            type="text"
            value={currentItem.unit}
            onChange={e => setCurrentItem({ ...currentItem, unit: e.target.value })}
            placeholder="e.g. kg"
          />
        </FormControl>

        {/* Price Field */}
        <FormControl isRequired>
          <FormLabel>Price (₦)</FormLabel>
          <Input
            type="number"
            min="0"
            value={currentItem.price}
            onChange={e => setCurrentItem({ ...currentItem, price: e.target.value })}
            placeholder="e.g. 500"
          />
        </FormControl>

        {/* Image Field */}
        <FormControl isRequired>
  <FormLabel>Image</FormLabel>

  <Box as="label" htmlFor="imageFile" cursor="pointer" width="100%">
    <Flex
      direction="column"
      gap={3}
      border="2px dashed"
      borderColor="gray.300"
      borderRadius="md"
      p={4}
      align="center"
      justify="center"
      textAlign="center"
      _hover={{ borderColor: 'teal.500', bg: 'gray.50' }}
    >
      {imageFile ? (
        <Flex align="center" justifyContent="space-between" w="100%">
          <Flex align="center" gap={2}>
            <Icon as={TiDocument} fontSize="20px" color="teal.500" />
            <Text fontSize="sm" isTruncated maxW="200px">
              {imageFile.name}
            </Text>
          </Flex>
          <Button size="sm" color="green" mt={2} background="transparent">
            Re-upload
          </Button>
        </Flex>
      ) : (
        <Flex align="center" gap={2}>
          <Icon as={AiOutlineCloudUpload} fontSize="20px" color="gray.500" />
          <Text fontSize="sm" color="gray.500">Click to upload product image</Text>
        </Flex>
      )}
    </Flex>
    <Input
      id="imageFile"
      type="file"
      hidden
      accept=".jpg,.jpeg,.png"
      onChange={e => setImageFile(e.target.files[0])}
    />
  </Box>

  {uploadingImage && <Spinner mt={2} size="sm" />}
</FormControl>

      </Stack>
    </ModalBody>
    <ModalFooter>
      <Button
        background="#39996B"
        _hover={{ background: '#2e7a58' }} // darker green on hover

        color="white"
        mr={3}
        isLoading={submitLoading}
        onClick={handleSubmit}
        isDisabled={
          !currentItem.name.trim() ||
          !currentItem.quantity ||
          !currentItem.unit.trim() ||
          !currentItem.price
        }
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
