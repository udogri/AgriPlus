// FarmerSignup.js
import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  Button,
  Select,
  Textarea,
  Progress,
  useToast,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { AiOutlineCloudUpload } from "react-icons/ai";
import { TiDocument } from "react-icons/ti";
import { db } from '../firebaseConfig'; // Adjust the path as needed
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const FarmerSignup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePhoto: null,
    country: '',
    state: '',
    lga: '',
    homeAddress: '',
    farmAddress: '',
    idDocument: null,
    bankName: '',
    accountNumber: '',
    accountName: '',
    bvn: '',
  });

  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    setFormData({
      ...formData,
      [id]: files ? files[0] : value,
    });
  };

  const handleNext = () => {
    // Add validation logic here
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const uploadImageToImgBB = async (imageFile) => {
    const apiKey = `bc6aa3a9cee7036d9b191018c92c893a`; // Replace with your ImgBB API key
    const form = new FormData();
    form.append('image', imageFile);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: form,
      });
      const data = await response.json();
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      console.error('ImgBB Upload Error:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      // Upload images to ImgBB
      const profilePhotoUrl = formData.profilePhoto
        ? await uploadImageToImgBB(formData.profilePhoto)
        : '';
      const idDocumentUrl = formData.idDocument
        ? await uploadImageToImgBB(formData.idDocument)
        : '';

      // Prepare data for Firestore
      const dataToSubmit = {
        ...formData,
        profilePhoto: profilePhotoUrl,
        idDocument: idDocumentUrl,
      };

      // Remove file objects before submitting
      delete dataToSubmit.profilePhoto;
      delete dataToSubmit.idDocument;

      await addDoc(collection(db, 'farmers'), dataToSubmit);
      toast({
        title: 'Profile Created.',
        description: 'Your farmer profile has been successfully created.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      navigate('/farmer/dashboard'); // Adjust the path as needed
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        title: 'An error occurred.',
        description: 'Unable to create profile.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  return (
    <Box px={['3%', '15%']} my="74px">
      <Progress value={(step / 2) * 100} mb="5%" />
      <VStack spacing="20px" align="start">
        {step === 1 && (
          <>
          <Text fontSize="40px" alignSelf="center" fontWeight="600" >Personal Info</Text>
            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input id="fullName" onChange={handleChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Date of Birth</FormLabel>
              <Input id="dob" type="date" onChange={handleChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Gender</FormLabel>
              <Select id="gender" onChange={handleChange}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Phone Number</FormLabel>
              <Input id="phone" onChange={handleChange} />
            </FormControl>
            
            <FormControl isRequired>
  <FormLabel>Profile Photo</FormLabel>

  <Box as="label" htmlFor="profilePhoto" cursor="pointer" width="100%">
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
      {formData.profilePhoto ? (
        <>
          <Flex align="center" justifyContent="space-between" w="100%" >
          <Flex align="center" gap={2}>
            <Icon as={TiDocument} fontSize="20px" color="teal.500" />
            <Text fontSize="sm" isTruncated maxW="200px">
              {formData.profilePhoto.name}
            </Text>
            </Flex>
          
          <Button size="sm" color="green" mt={2} background="transparent">
            Re-upload
          </Button>
          </Flex>
        </>
      ) : (
        <Flex align="center" gap={2}>
          <Icon as={AiOutlineCloudUpload} fontSize="20px" color="gray.500" />
          <Text fontSize="sm" color="gray.500">Click to upload your Photo</Text>
        </Flex>
      )}
    </Flex>
    <Input
      id="profilePhoto"
      type="file"
      hidden
      accept=".pdf,.jpg,.jpeg,.png"
      onChange={handleChange}
    />
  </Box>
</FormControl>
            <FormControl isRequired>
              <FormLabel>Country</FormLabel>
              <Input id="country" onChange={handleChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>State / Province</FormLabel>
              <Input id="state" onChange={handleChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>LGA / District</FormLabel>
              <Input id="lga" onChange={handleChange} />
            </FormControl>
            
            <FormControl>
              <FormLabel>Farm Address</FormLabel>
              <Textarea id="farmAddress" onChange={handleChange} />
            </FormControl>
          </>
        )}
        {step === 2 && (
          <>
          <Text fontSize="40px" alignSelf="center" fontWeight="600" >Documents and Bank Info</Text>
          

<FormControl isRequired>
  <FormLabel>Government-issued ID</FormLabel>

  <Box as="label" htmlFor="idDocument" cursor="pointer" width="100%">
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
      {formData.idDocument ? (
        <>
          <Flex align="center" justifyContent="space-between" w="100%" >
          <Flex align="center" gap={2}>
            <Icon as={TiDocument} fontSize="20px" color="teal.500" />
            <Text fontSize="sm" isTruncated maxW="200px">
              {formData.idDocument.name}
            </Text>
            </Flex>
          
          <Button size="sm" color="green" mt={2} background="transparent">
            Re-upload
          </Button>
          </Flex>
        </>
      ) : (
        <Flex align="center" gap={2}>
          <Icon as={AiOutlineCloudUpload} fontSize="20px" color="gray.500" />
          <Text fontSize="sm" color="gray.500">Click to upload your ID</Text>
        </Flex>
      )}
    </Flex>
    <Input
      id="idDocument"
      type="file"
      hidden
      accept=".pdf,.jpg,.jpeg,.png"
      onChange={handleChange}
    />
  </Box>
</FormControl>

            <FormControl>
              <FormLabel>Bank Name</FormLabel>
              <Input id="bankName" onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Account Number</FormLabel>
              <Input id="accountNumber" onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Account Name</FormLabel>
              <Input id="accountName" onChange={handleChange} />
            </FormControl>
            
          </>
        )}
        <Box width="100%" display="flex" justifyContent="space-between">
          {step > 1 && (
            <Button onClick={handleBack} colorScheme="gray">
              Previous
            </Button>
          )}
          {step < 2 && (
            <Button onClick={handleNext} colorScheme="teal">
              Next
            </Button>
          )}
          {step === 2 && (
            <Button onClick={handleSubmit} colorScheme="teal">
              Submit
            </Button>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default FarmerSignup;
