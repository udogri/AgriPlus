import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Input,
    Textarea,
    Button,
    useToast,
    VStack,
    Image,
    Flex,
    Icon,
    Text
  } from "@chakra-ui/react";
  import { useState } from "react";
  import { addDoc, collection, serverTimestamp } from "firebase/firestore";
  import { db } from "../firebaseConfig"; // Adjust the import path as necessary
  import axios from "axios";
  import { AiOutlineCloudUpload } from "react-icons/ai";
  
  const CreatePostModal = ({ isOpen, onClose, uid, fetchPosts }) => {
    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();
  
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    };
  
    const uploadImageToImgBB = async (file) => {
      try {
        const apiKey = "bc6aa3a9cee7036d9b191018c92c893a"; // replace with env variable
        const formData = new FormData();
        formData.append("image", file);
        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData);
        return response.data.data.url;
      } catch (error) {
        console.error("ImgBB upload error:", error);
        throw error; // Re-throw to be caught in handleSubmit
      }
    };
  
    const handleSubmit = async () => {
      if (!content && !imageFile) {
        toast({ title: "Post cannot be empty", status: "warning", duration: 3000 });
        return;
      }
      setLoading(true);
      try {
        let imageUrl = "";
        if (imageFile) {
          try {
            imageUrl = await uploadImageToImgBB(imageFile);
          } catch (uploadError) {
            console.error("Image upload error:", uploadError);
            toast({ title: "Image upload failed", description: uploadError.message, status: "error", duration: 4000 });
            setLoading(false);
            return;
          }
        }
  
        try {
          await addDoc(collection(db, "posts"), {
            uid,
            content,
            imageUrl,
            createdAt: serverTimestamp()
          });
  
          toast({ title: "Post created!", status: "success", duration: 3000 });
          fetchPosts();
          onClose();
          setContent("");
          setImageFile(null);
          setPreview("");
        } catch (firestoreError) {
          console.error("Firestore error:", firestoreError);
          toast({ title: "Error creating post", description: firestoreError.message, status: "error", duration: 4000 });
        }
      } catch (err) {
        console.error("handleSubmit error:", err);
        toast({ title: "Error creating post", description: err.message, status: "error", duration: 4000 });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Textarea
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Flex
                border="2px dashed"
                borderColor="gray.300"
                p={3}
                borderRadius="md"
                align="center"
                justify="center"
                direction="column"
                cursor="pointer"
                onClick={() => document.getElementById("postImageInput").click()}
              >
                <Icon as={AiOutlineCloudUpload} fontSize="20px" color="gray.500" />
                <Text fontSize="sm" color="gray.500">Click to upload an image</Text>
              </Flex>
              <Input
                id="postImageInput"
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
              {preview && <Image src={preview} borderRadius="md" />}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="twitter" onClick={handleSubmit} isLoading={loading}>
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default CreatePostModal;
