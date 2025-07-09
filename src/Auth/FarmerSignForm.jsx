// FarmerSignup.js
import React, { useState } from 'react';
import {
  Box, VStack, Text, Input, FormControl, FormLabel, Button, Select,
  Textarea, Progress, useToast, Flex, Icon
} from '@chakra-ui/react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { TiDocument } from 'react-icons/ti';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const FileUploadInput = ({ id, label, file, handleChange }) => (
  <FormControl isRequired>
    <FormLabel>{label}</FormLabel>
    <Box as="label" htmlFor={id} cursor="pointer" width="100%">
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
        {file ? (
          <Flex align="center" justifyContent="space-between" w="100%">
            <Flex align="center" gap={2}>
              <Icon as={TiDocument} fontSize="20px" color="teal.500" />
              <Text fontSize="sm" isTruncated maxW="200px">
                {file.name}
              </Text>
            </Flex>
            <Button size="sm" color="green" mt={2} background="transparent">
              Re-upload
            </Button>
          </Flex>
        ) : (
          <Flex align="center" gap={2}>
            <Icon as={AiOutlineCloudUpload} fontSize="20px" color="gray.500" />
            <Text fontSize="sm" color="gray.500">Click to upload</Text>
          </Flex>
        )}
      </Flex>
      <Input
        id={id}
        type="file"
        hidden
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleChange}
      />
    </Box>
  </FormControl>
);

const FarmerSignup = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', dob: '', gender: '', phone: '', email: '',
    password: '', confirmPassword: '', profilePhoto: null,
    country: '', state: '', lga: '', farmAddress: '',
    idDocument: null, bankName: '', accountNumber: '', accountName: '', bvn: '',
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

  const validateStepOne = () => {
    const requiredFields = ['fullName', 'dob', 'gender', 'phone', 'country', 'state', 'lga', 'profilePhoto'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        toast({
          title: 'Missing Field',
          description: `Please fill in your ${field.replace(/([A-Z])/g, ' $1')}.`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        return false;
      }
    }
    return true;
  };

  const validateStepTwo = () => {
    if (!formData.idDocument) {
      toast({
        title: 'Missing ID',
        description: 'Please upload a government-issued ID.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return false;
    }
    return true;
  };

  const uploadImageToImgBB = async (file) => {
    const apiKey = 'bc6aa3a9cee7036d9b191018c92c893a';
    const form = new FormData();
    form.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      return data.success ? data.data.url : null;
    } catch (err) {
      console.error('ImgBB upload error:', err);
      return null;
    }
  };

  const handleNext = () => {
    if (step === 1 && validateStepOne()) {
      setStep(2);
    }
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async () => {
    if (!validateStepTwo()) return;

    setLoading(true);
    try {
      const profilePhotoUrl = formData.profilePhoto ? await uploadImageToImgBB(formData.profilePhoto) : '';
      const idDocumentUrl = formData.idDocument ? await uploadImageToImgBB(formData.idDocument) : '';

      const dataToSubmit = {
        ...formData,
        profilePhotoUrl,
        idDocumentUrl,
      };

      delete dataToSubmit.profilePhoto;
      delete dataToSubmit.idDocument;

      await setDoc(doc(db, 'farmers', auth.currentUser.uid), dataToSubmit);
      toast({
        title: 'Success!',
        description: 'Farmer profile created.',
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      navigate('/farmer/dashboard');
    } catch (error) {
      console.error('Submit Error:', error);
      toast({
        title: 'Submission Failed',
        description: 'An error occurred. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box px={['3%', '15%']} my="74px">
      <Progress value={(step / 2) * 100} mb="5%" />
      <VStack spacing="20px" align="start">
        {step === 1 && (
          <>
            <Text fontSize="30px" fontWeight="600" alignSelf="center">Personal Information</Text>
            <FormControl isRequired><FormLabel>Full Name</FormLabel><Input id="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} /></FormControl>
            <FormControl isRequired><FormLabel>Date of Birth</FormLabel><Input id="dob" type="date" value={formData.dob} onChange={handleChange} /></FormControl>
            <FormControl isRequired>
              <FormLabel>Gender</FormLabel>
              <Select id="gender" value={formData.gender} onChange={handleChange} placeholder="Select gender">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Select>
            </FormControl>
            <FormControl isRequired><FormLabel>Phone Number</FormLabel><Input id="phone" placeholder="080xxxxxxxx" value={formData.phone} onChange={handleChange} /></FormControl>
            <FormControl><FormLabel>Email</FormLabel><Input id="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} /></FormControl>
            <FileUploadInput id="profilePhoto" label="Profile Photo" file={formData.profilePhoto} handleChange={handleChange} />
            <FormControl isRequired><FormLabel>Country</FormLabel><Input id="country" placeholder="Enter your country" value={formData.country} onChange={handleChange} /></FormControl>
            <FormControl isRequired><FormLabel>State / Province</FormLabel><Input id="state" placeholder="Enter your state or province" value={formData.state} onChange={handleChange} /></FormControl>
            <FormControl isRequired><FormLabel>LGA / District</FormLabel><Input id="lga" placeholder="Enter your LGA or district" value={formData.lga} onChange={handleChange} /></FormControl>
            <FormControl><FormLabel>Farm/Home Address</FormLabel><Textarea id="farmAddress" placeholder="Enter your farm/home address" value={formData.homeAddress} onChange={handleChange} /></FormControl>
          </>
        )}

        {step === 2 && (
          <>
            <Text fontSize="30px" fontWeight="600" alignSelf="center">Documents and Banking</Text>
            <FileUploadInput id="idDocument" label="Government-issued ID" file={formData.idDocument} handleChange={handleChange} />
            <FormControl><FormLabel>Bank Name</FormLabel><Input id="bankName" placeholder="e.g. Access Bank" value={formData.bankName} onChange={handleChange} /></FormControl>
            <FormControl><FormLabel>Account Number</FormLabel><Input id="accountNumber" placeholder="Enter your account number" value={formData.accountNumber} onChange={handleChange} /></FormControl>
            <FormControl><FormLabel>Account Name</FormLabel><Input id="accountName" placeholder="Enter your account name" value={formData.accountName} onChange={handleChange} /></FormControl>
          </>
        )}

        <Box width="100%" display="flex" justifyContent="space-between">
          {step > 1 && (
            <Button background="#39996B" _hover={{ background: '#2e7a58' }} onClick={handleBack} colorScheme="teal" isDisabled={loading}>Previous</Button>
          )}
          {step < 2 && (
            <Button background="#39996B" _hover={{ background: '#2e7a58' }} onClick={handleNext} colorScheme="teal" isDisabled={loading}>Next</Button>
          )}
          {step === 2 && (
            <Button background="#39996B" _hover={{ background: '#2e7a58' }} onClick={handleSubmit} colorScheme="teal" isLoading={loading}>Submit</Button>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default FarmerSignup;
