// src/components/AddInventoryItem.jsx
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    Stack,
    useToast,
    Image,
  } from '@chakra-ui/react';
  import { useState } from 'react';
  
  export default function AddInventoryItem({ onAdd }) {
    const [formData, setFormData] = useState({
      name: '',
      quantity: '',
      unit: '',
      price: '',
      image: null,
      preview: '',
    });
  
    const toast = useToast();
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
  
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          image: file,
          preview: URL.createObjectURL(file),
        }));
      }
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.name || !formData.quantity || !formData.unit || !formData.price || !formData.image) {
        toast({
          title: 'All fields are required.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
  
      // You would usually send this to a backend or Firebase
      onAdd({
        ...formData,
        updatedAt: new Date().toISOString().split('T')[0],
        id: Date.now(),
      });
  
      toast({
        title: 'Item added to inventory.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
  
      // Reset form
      setFormData({
        name: '',
        quantity: '',
        unit: '',
        price: '',
        image: null,
        preview: '',
      });
    };
  
    return (
      <Box as="form" onSubmit={handleSubmit} p={4} borderWidth="1px" borderRadius="md" mt={4}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Item Name</FormLabel>
            <Input name="name" value={formData.name} onChange={handleChange} />
          </FormControl>
  
          <FormControl isRequired>
            <FormLabel>Quantity</FormLabel>
            <Input name="quantity" type="number" value={formData.quantity} onChange={handleChange} />
          </FormControl>
  
          <FormControl isRequired>
            <FormLabel>Unit</FormLabel>
            <Select name="unit" value={formData.unit} onChange={handleChange}>
              <option value="">Select unit</option>
              <option value="kg">kg</option>
              <option value="tubers">tubers</option>
              <option value="bags">bags</option>
              <option value="liters">liters</option>
            </Select>
          </FormControl>
  
          <FormControl isRequired>
            <FormLabel>Price (₦)</FormLabel>
            <Input name="price" value={formData.price} onChange={handleChange} />
          </FormControl>
  
          <FormControl isRequired>
            <FormLabel>Image</FormLabel>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
            {formData.preview && (
              <Image src={formData.preview} alt="Preview" mt={2} boxSize="100px" objectFit="cover" />
            )}
          </FormControl>
  
          <Button type="submit" colorScheme="teal">
            Submit
          </Button>
        </Stack>
      </Box>
    );
  }
  