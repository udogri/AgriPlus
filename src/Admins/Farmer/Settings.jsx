// src/pages/farmer/SettingsPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useColorModeValue,
  VStack,
  Avatar,
  Flex,
  IconButton,
  Spinner,
  useToast,
  InputGroup,
  InputLeftAddon
} from '@chakra-ui/react';
// import { editIcon } from '@chakra-ui/icons';
import DashBoardLayout from '../../DashboardLayout';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import axios from 'axios';

export default function SettingsPage() {
  const bg = useColorModeValue('white', 'gray.800');
  const toast = useToast();
  const fileRef = useRef();

  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user?.uid;

  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    photoURL: ''
  });
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!uid) return;
      try {
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (err) {
        toast({ title: 'Error loading profile.', status: 'error' });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [uid]);

  const uploadImage = async file => {
    const apiKey = 'bc6aa3a9cee7036d9b191018c92c893a'; // consider hiding via env var
    const formData = new FormData();
    formData.append('image', file);
    const resp = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      formData
    );
    return resp.data.data.url;
  };

  const handleSave = async () => {
    setIsSaving(true);
    let photoURL = profile.photoURL;

    try {
      if (imageFile) {
        photoURL = await uploadImage(imageFile);
      }

      await updateDoc(doc(db, 'users', uid), {
        displayName: profile.displayName,
        email: profile.email, // only if you'd like to allow email changes
        photoURL
      });

      // update Auth profile
      await updateProfile(user, { displayName: profile.displayName, photoURL });

      setProfile({ ...profile, photoURL });
      toast({ title: 'Profile updated', status: 'success' });
    } catch (err) {
      toast({ title: 'Error saving profile', description: err.message, status: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <DashBoardLayout><Spinner align="center" mt={20} /></DashBoardLayout>;
  }

  return (
    <DashBoardLayout active="Settings">
      <Box bg={bg} p={6} borderRadius="md" boxShadow="md" maxW="600px" mx="auto">
        <Heading mb={6}>Account Settings</Heading>

        <Flex direction="column" align="center" mb={6}>
          <Avatar size="xl" src={profile.photoURL} name={profile.displayName} mb={4} />
          <Button
            size="sm"
            onClick={() => fileRef.current.click()}
            leftIcon={<editIcon />}
          >
            Change Photo
          </Button>
          <Input
            type="file"
            ref={fileRef}
            display="none"
            accept="image/*"
            onChange={e => setImageFile(e.target.files[0])}
          />
        </Flex>

        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Full Name</FormLabel>
            <Input
              placeholder="Your name"
              value={profile.displayName}
              onChange={e => setProfile({ ...profile, displayName: e.target.value })}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Email Address</FormLabel>
            <InputGroup>
              <InputLeftAddon children="📧" />
              <Input
                type="email"
                placeholder="Your email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
              />
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel>New Password (optional)</FormLabel>
            <Input
              type="password"
              placeholder="Enter new password"
              disabled
            />
          </FormControl>

          <Button
            background="#39996B"
            color="white"
            alignSelf="flex-start"
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </VStack>
      </Box>
    </DashBoardLayout>
  );
}
