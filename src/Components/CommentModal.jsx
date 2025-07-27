import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Textarea,
    Button,
    Avatar,
    HStack,
    Box,
    Text,
    VStack,
    IconButton,
    useToast,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Input
  } from "@chakra-ui/react";
  import { FiMoreVertical } from "react-icons/fi";
  import { doc, updateDoc } from "firebase/firestore";
  import { db } from "../firebaseConfig";
  import { useRef, useState } from "react";
  
  const CommentModal = ({
    isOpen,
    onClose,
    selectedPost,
    commentText,
    setCommentText,
    handleAddComment,
    commentSubmitting,
    currentUserId
  }) => {
    const toast = useToast();
    const cancelRef = useRef();
  
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
  
    // Handle Save after edit
    const handleSaveEdit = async () => {
      if (editingText.trim() === "") return;
      setProcessing(true);
      try {
        const updatedComments = [...selectedPost.comments];
        updatedComments[editingIndex].content = editingText;
        await updateDoc(doc(db, "posts", selectedPost.id), { comments: updatedComments });
        toast({ title: "Comment updated", status: "success" });
        setEditingIndex(null);
        setEditingText("");
      } catch (err) {
        toast({ title: "Error updating comment", description: err.message, status: "error" });
      } finally {
        setProcessing(false);
      }
    };
  
    // Handle Delete
    const handleDeleteComment = async () => {
      setProcessing(true);
      try {
        const updatedComments = selectedPost.comments.filter((_, i) => i !== deleteIndex);
        await updateDoc(doc(db, "posts", selectedPost.id), { comments: updatedComments });
        toast({ title: "Comment deleted", status: "info" });
        setConfirmOpen(false);
      } catch (err) {
        toast({ title: "Error deleting comment", description: err.message, status: "error" });
      } finally {
        setProcessing(false);
      }
    };
  
    if (!selectedPost) return null;
  
    return (
      <>
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Comments</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedPost.comments && selectedPost.comments.length > 0 ? (
                <VStack spacing={4} align="stretch">
                  {selectedPost.comments.map((comment, index) => (
                    <HStack key={index} align="start" justify="space-between">
                      <HStack>
                        <Avatar src={comment.userPhoto} size="sm" />
                        <Box>
                          <Text fontWeight="bold">{comment.userName}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {comment.createdAt?.toDate
                              ? new Date(comment.createdAt.toDate()).toLocaleString()
                              : comment.createdAt instanceof Date
                              ? comment.createdAt.toLocaleString()
                              : "Just now"}
                          </Text>
                          {editingIndex === index ? (
                            <>
                              <Input
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                size="sm"
                                mt={2}
                              />
                              <HStack mt={2}>
                                <Button
                                  colorScheme="green"
                                  size="xs"
                                  onClick={handleSaveEdit}
                                  isLoading={processing}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => setEditingIndex(null)}
                                >
                                  Cancel
                                </Button>
                              </HStack>
                            </>
                          ) : (
                            <Text mt={1}>{comment.content}</Text>
                          )}
                        </Box>
                      </HStack>
  
                      {comment.userId === currentUserId && editingIndex !== index && (
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            size="sm"
                            variant="ghost"
                          />
                          <MenuList>
                            <MenuItem
                              onClick={() => {
                                setEditingIndex(index);
                                setEditingText(comment.content);
                              }}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              color="red"
                              onClick={() => {
                                setDeleteIndex(index);
                                setConfirmOpen(true);
                              }}
                            >
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      )}
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Text color="gray.500">No comments yet.</Text>
              )}
            </ModalBody>
            <ModalFooter>
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                size="sm"
                mr={3}
              />
              <Button colorScheme="green" onClick={handleAddComment} isLoading={commentSubmitting}>
                Comment
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
  
        {/* Confirmation AlertDialog */}
        <AlertDialog
          isOpen={confirmOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setConfirmOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader>Delete Comment</AlertDialogHeader>
              <AlertDialogBody>Are you sure you want to delete this comment?</AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDeleteComment}
                  ml={3}
                  isLoading={processing}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
    );
  };
  
  export default CommentModal;
  