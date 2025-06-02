import React, { useState } from 'react';
import { Box, VStack, Text, Input, FormControl, FormLabel, Button, Select, Textarea, Icon, InputGroup } from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';

export default function FarmerSignup() {
  const [payload, setPayload] = useState({
    fullName: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePhoto: '',
    country: '',
    state: '',
    lga: '',
    homeAddress: '',
    farmAddress: '',
    idDocument: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    bvn: ''
  });

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    setPayload({ ...payload, [id]: files ? files[0] : value });
  };

  return (
      <Box px={['3%', '15%']} mt="74px">
        <VStack spacing="50px" align="start">
          <VStack align="start" spacing="22px">
            <Icon as={FaArrowLeft} boxSize={5} />
            <Text fontWeight="700" fontSize="24px" color="#101011" mt="4">
              Complete Your Farmer Profile
            </Text>
            <Text fontSize="sm" color="#6B7280" lineHeight="24px">
              Let’s get to know you and verify your details as a registered farmer.
            </Text>
          </VStack>

          {/* Personal Info */}
          <FormControl isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input id="fullName" placeholder="Enter your full name" onChange={handleChange} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Date of Birth</FormLabel>
            <Input id="dob" type="date" onChange={handleChange} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Gender</FormLabel>
            <Select id="gender" placeholder="Select gender" onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Phone Number</FormLabel>
            <Input id="phone" placeholder="+234" onChange={handleChange} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email Address</FormLabel>
            <Input id="email" type="email" placeholder="Enter your email" onChange={handleChange} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input id="password" type="password" placeholder="Enter password" onChange={handleChange} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <Input id="confirmPassword" type="password" placeholder="Confirm password" onChange={handleChange} />
          </FormControl>

          <FormControl>
            <FormLabel>Upload Profile Photo (optional)</FormLabel>
            <Input id="profilePhoto" type="file" onChange={handleChange} />
          </FormControl>

          {/* Location Info */}
          <FormControl isRequired>
            <FormLabel>Country</FormLabel>
            <Input id="country" placeholder="Enter your country" onChange={handleChange} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>State / Province</FormLabel>
            <Input id="state" placeholder="Enter your state" onChange={handleChange} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Local Government Area (LGA) or District</FormLabel>
            <Input id="lga" placeholder="Enter your LGA or District" onChange={handleChange} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Home Address</FormLabel>
            <Textarea id="homeAddress" placeholder="Enter your home address" onChange={handleChange} />
          </FormControl>

          <FormControl>
            <FormLabel>Farm Address (if different)</FormLabel>
            <Textarea id="farmAddress" placeholder="Enter your farm address" onChange={handleChange} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Upload Government-issued ID</FormLabel>
            <Input id="idDocument" type="file" onChange={handleChange} />
          </FormControl>

          {/* Bank Info (optional) */}
          <FormControl>
            <FormLabel>Bank Name</FormLabel>
            <Input id="bankName" placeholder="Enter your bank name" onChange={handleChange} />
          </FormControl>

          <FormControl>
            <FormLabel>Account Number</FormLabel>
            <Input id="accountNumber" placeholder="Enter your account number" onChange={handleChange} />
          </FormControl>

          <FormControl>
            <FormLabel>Account Name</FormLabel>
            <Input id="accountName" placeholder="Enter your account name" onChange={handleChange} />
          </FormControl>

          <FormControl>
            <FormLabel>BVN (if required)</FormLabel>
            <Input id="bvn" placeholder="Enter your BVN" onChange={handleChange} />
          </FormControl>

          <Button colorScheme="teal" width="100%" size="lg">
            Complete Profile Setup
          </Button>
        </VStack>
      </Box>
  );
}
