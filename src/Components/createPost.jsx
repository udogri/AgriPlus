// src/components/PostModal.jsx
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
  Image
} from "@chakra-ui/react";

const createPost = ({
  isOpen,
  onClose,
  postContent,
  setPostContent,
  handleCreatePost,
  submitting,
  setImageFile,
  imagePreview,
  setImagePreview
}) => {
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
              setImageFile(e.target.files[0]);
              setImagePreview(URL.createObjectURL(e.target.files[0]));
            }}
          />
          {imagePreview && <Image src={imagePreview} mt={3} borderRadius="md" />}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="green" onClick={handleCreatePost} isLoading={submitting}>
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

export default createPost;
