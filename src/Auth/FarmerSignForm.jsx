import React, { useState } from 'react';
import {
  Box, Button, Input, FormControl, FormLabel, Heading, VStack, useToast, Image, Progress, Select, Text
} from '@chakra-ui/react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';

const auth = getAuth(app);
const db = getFirestore(app);

const FarmerSignupForm = () => {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePhotoUrl: '',
    country: '',
    state: '',
    lga: '',
    homeAddress: '',
    farmAddress: '',
    idDocumentUrl: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    bvn: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    const body = new FormData();
    body.set('key', 'YOUR_IMGBB_API_KEY');
    body.append('image', file);

    try {
      const res = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      setFormData(prev => ({ ...prev, [field]: data.data.url }));
    } catch (error) {
      toast({ title: 'Image upload failed', status: 'error', duration: 3000 });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (formData.password !== formData.confirmPassword) {
        toast({ title: 'Passwords do not match', status: 'error', duration: 3000 });
        setLoading(false);
        return;
      }

      const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await setDoc(doc(db, 'farmers', userCred.user.uid), {
        ...formData,
        createdAt: new Date().toISOString(),
      });
      toast({ title: 'Signup successful', status: 'success', duration: 3000 });
    } catch (error) {
      toast({ title: error.message, status: 'error', duration: 3000 });
    }
    setLoading(false);
  };

  return (
    <Box maxW="lg" mx="auto" mt={10} p={6} boxShadow="2xl" borderRadius="xl" bg="white">
      <Heading mb={6} size="lg" textAlign="center">👤 Farmer Signup</Heading>
      <Progress value={(step / 3) * 100} mb={6} />

      {step === 1 && (
        <VStack spacing={4} align="stretch">
          <Text fontWeight="bold">Personal Information</Text>
          <FormControl isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input name="fullName" value={formData.fullName} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Date of Birth</FormLabel>
            <Input type="date" name="dob" value={formData.dob} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Gender</FormLabel>
            <Select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Phone Number</FormLabel>
            <Input name="phone" value={formData.phone} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email Address</FormLabel>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type="password" name="password" value={formData.password} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Upload Profile Photo (Optional)</FormLabel>
            <Input type="file" onChange={(e) => handleImageUpload(e, 'profilePhotoUrl')} />
            {formData.profilePhotoUrl && <Image src={formData.profilePhotoUrl} boxSize="100px" borderRadius="full" />}
          </FormControl>
          <Button onClick={() => setStep(2)} colorScheme="teal">Next</Button>
        </VStack>
      )}

      {step === 2 && (
        <VStack spacing={4} align="stretch">
          <Text fontWeight="bold">📍 Location Details</Text>
          <FormControl isRequired>
            <FormLabel>Country</FormLabel>
            <Input name="country" value={formData.country} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>State/Province</FormLabel>
            <Input name="state" value={formData.state} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>LGA or District</FormLabel>
            <Input name="lga" value={formData.lga} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Home Address</FormLabel>
            <Input name="homeAddress" value={formData.homeAddress} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Farm Address (if different)</FormLabel>
            <Input name="farmAddress" value={formData.farmAddress} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Upload Government-issued ID</FormLabel>
            <Input type="file" onChange={(e) => handleImageUpload(e, 'idDocumentUrl')} />
            {formData.idDocumentUrl && <Image src={formData.idDocumentUrl} boxSize="100px" />}
          </FormControl>
          <Button onClick={() => setStep(3)} colorScheme="teal">Next</Button>
          <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
        </VStack>
      )}

      {step === 3 && (
        <VStack spacing={4} align="stretch">
          <Text fontWeight="bold">💳 Bank/Payment Details (Optional)</Text>
          <FormControl>
            <FormLabel>Bank Name</FormLabel>
            <Input name="bankName" value={formData.bankName} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Account Number</FormLabel>
            <Input name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Account Name</FormLabel>
            <Input name="accountName" value={formData.accountName} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>BVN (if required)</FormLabel>
            <Input name="bvn" value={formData.bvn} onChange={handleChange} />
          </FormControl>
          <Button colorScheme="teal" isLoading={loading} onClick={handleSubmit}>Submit</Button>
          <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
        </VStack>
      )}
    </Box>
  );
};

export default FarmerSignupForm;