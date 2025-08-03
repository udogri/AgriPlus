// src/components/CreatePost.jsx
import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Input,
  Image,
  useToast
} from "@chakra-ui/react";

const CreatePost = ({ isOpen, onClose, handleCreatePost, submitting }) => {
  const [postContent, setPostContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const toast = useToast();

  const handleSubmit = async () => {
    if (!postContent.trim() && !imageFile) {
      toast({ title: "Post cannot be empty", status: "warning" });
      return;
    }
    await handleCreatePost({ postContent, imageFile });
    setPostContent("");
    setImageFile(null);
    setImagePreview("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Post</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Textarea
            placeholder="What's happening?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            mb={3}
          />
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setImageFile(file);
              if (file) {
                setImagePreview(URL.createObjectURL(file));
              }
            }}
          />
          {imagePreview && <Image src={imagePreview} mt={3} borderRadius="md" />}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="green" onClick={handleSubmit} isLoading={submitting}>
            Post
          </Button>
          <Button variant="ghost" onClick={onClose} ml={3}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreatePost;
