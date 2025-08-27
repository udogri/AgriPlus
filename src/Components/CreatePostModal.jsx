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
  import CreatePost from "./createPost";
  
  const CreatePostModal = ({ isOpen, onClose, uid, userName, userPhoto, fetchPosts }) => {
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
  
    const handleCreatePost = async ({ postContent, imageFile }) => {
      if (!postContent && !imageFile) {
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
            userName,
            userPhoto,
            content: postContent,
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
      <CreatePost
        isOpen={isOpen}
        onClose={onClose}
        handleCreatePost={handleCreatePost}
        submitting={loading}
      />
    );
  };
  
  export default CreatePostModal;
