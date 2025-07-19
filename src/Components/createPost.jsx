import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter,
  Button, Textarea, Input, Image, useToast, VStack
} from '@chakra-ui/react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebaseConfig';

const CreatePostModal = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;

    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to create a post.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (!content.trim() && !imageFile) {
      toast({
        title: 'Post must have content or an image.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';

      if (imageFile) {
        const fileRef = ref(storage, `posts/${Date.now()}-${imageFile.name}`);
        await uploadBytes(fileRef, imageFile);
        imageUrl = await getDownloadURL(fileRef);
      }

      const newPost = {
        content: content.trim(),
        imageUrl,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        likes: [],
        comments: [],
      };

      await addDoc(collection(db, 'posts'), newPost);

      toast({
        title: 'Post created successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset
      setContent('');
      setImageFile(null);
      setImagePreview('');
      onClose();
    } catch (error) {
      toast({
        title: 'Error creating post',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Post</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <Image src={imagePreview} borderRadius="md" maxH="300px" objectFit="cover" />
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost">Cancel</Button>
          <Button colorScheme="green" onClick={handleSubmit} isLoading={loading}>
            Post
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreatePostModal;
