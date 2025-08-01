import {
  Box,
  Text,
  Avatar,
  Spinner,
  VStack,
  HStack,
  IconButton,
  Button,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Textarea,
  useDisclosure,
  useToast,
  Flex
} from "@chakra-ui/react";
import { FaHeart, FaRegComment, FaRetweet, FaShareAlt } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashBoardLayout from "../../DashboardLayout";
import CreatePost from "../../Components/createPost";
import CommentModal from "../../Components/CommentModal";

const DashboardPage = () => {
  const toast = useToast();
  const { uid } = useParams();

  const [buyer, setBuyer] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Profile edit states
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState("");

  const postModal = useDisclosure();
  const commentModal = useDisclosure();
  const editProfileModal = useDisclosure();
  const avatarModal = useDisclosure();
  const deleteModal = useDisclosure();

  const [postToDelete, setPostToDelete] = useState(null);

  // Fetch buyer profile
  useEffect(() => {
    const fetchBuyer = async () => {
      try {
        const ref = doc(db, "buyers", uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setBuyer(data);
          setEditName(data.fullName);
          setEditBio(data.bio || "");
          setPreviewPhoto(data.profilePhotoUrl || "");
        } else {
          toast({ title: "Profile not found", status: "error" });
        }
      } catch (err) {
        toast({ title: "Error fetching profile", description: err.message, status: "error" });
      }
    };
    fetchBuyer();
  }, [uid]);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "posts"), where("uid", "==", uid), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      toast({ title: "Error fetching posts", description: err.message, status: "error" });
    } finally {
      setLoadingPosts(false);
    }
  };
  useEffect(() => {
    fetchPosts();
  }, [uid]);

  // Like post
  const handleLike = async (post) => {
    const alreadyLiked = post.likes?.includes(uid);
    const updatedLikes = alreadyLiked
      ? post.likes.filter((id) => id !== uid)
      : [...(post.likes || []), uid];
    await updateDoc(doc(db, "posts", post.id), { likes: updatedLikes });
    fetchPosts();
  };

  // Retweet post
  const handleRetweet = async (post) => {
    await addDoc(collection(db, "posts"), {
      content: `RT @${post.userName}: ${post.content}`,
      imageUrl: post.imageUrl || "",
      uid,
      userName: buyer.fullName,
      userPhoto: buyer.profilePhotoUrl,
      createdAt: serverTimestamp(),
      likes: [],
      comments: [],
      retweetOf: post.id
    });
    toast({ title: "Post retweeted", status: "success" });
    fetchPosts();
  };

  // Share post
  const handleShare = (postId) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Post link copied", status: "info" });
  };

  // Delete post
  const confirmDeletePost = async () => {
    await deleteDoc(doc(db, "posts", postToDelete.id));
    toast({ title: "Post deleted", status: "info" });
    deleteModal.onClose();
    fetchPosts();
  };

  // Add comment
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setCommentSubmitting(true);
    const updatedComments = [
      ...(selectedPost.comments || []),
      {
        content: commentText,
        userId: uid,
        userName: buyer.fullName,
        userPhoto: buyer.profilePhotoUrl,
        createdAt: new Date()
      }
    ];
    await updateDoc(doc(db, "posts", selectedPost.id), { comments: updatedComments });
    setCommentText("");
    setCommentSubmitting(false);
    fetchPosts();
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      let photoUrl = previewPhoto;
      if (editPhoto) {
        // Convert to base64 for simplicity or use upload service
        const reader = new FileReader();
        reader.readAsDataURL(editPhoto);
        await new Promise((resolve) => (reader.onload = resolve));
        photoUrl = reader.result;
      }
      await updateDoc(doc(db, "buyers", uid), {
        fullName: editName,
        bio: editBio,
        profilePhotoUrl: photoUrl
      });
      toast({ title: "Profile updated", status: "success" });
      setBuyer({ ...buyer, fullName: editName, bio: editBio, profilePhotoUrl: photoUrl });
      editProfileModal.onClose();
    } catch (err) {
      toast({ title: "Error updating profile", description: err.message, status: "error" });
    }
  };

  if (!buyer)
    return (
      <Box textAlign="center" mt={20}>
        <Spinner size="xl" />
      </Box>
    );

  return (
    <DashBoardLayout active="buyer" role="buyer" showNav>
      <Box p={6} bg="gray.50" minH="100vh">
        {/* Cover + Profile */}
        <Box position="relative" mb={24}>
          <Box
            h="200px"
            bgImage={`url(${buyer.coverPhotoUrl || ""})`}
            bgSize="cover"
            bgPosition="center"
            borderTopRadius="md"
            bg="gray.200"
          />
          <Box position="absolute" top="120px" left="12%" transform="translateX(-50%)">
            <Avatar
              size="2xl"
              src={buyer.profilePhotoUrl}
              name={buyer.fullName}
              border="4px solid white"
              cursor="pointer"
              onClick={avatarModal.onOpen}
            />
            <Text fontWeight="bold" fontSize="xl" mt={2}>
              {buyer.fullName}
            </Text>
            <Text color="gray.600">{buyer.bio || "No bio yet"}</Text>
          </Box>
          <Box position="absolute" top="10px" right="20px">
            <Menu>
              <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" />
              <MenuList>
                <MenuItem onClick={editProfileModal.onOpen}>Edit Profile</MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </Box>

        <Flex justify="center" mt={20} mb={20}>
  <Button colorScheme="green" onClick={postModal.onOpen}>
    Make Post
  </Button>
</Flex>


        {loadingPosts ? (
          <Spinner />
        ) : posts.length === 0 ? (
          <Text color="gray.500">No posts yet.</Text>
        ) : (
          <VStack spacing={4} align="stretch">
            {posts.map((post) => (
              <Box key={post.id} bg="white" p={4} borderRadius="md" boxShadow="sm">
                <HStack align="start" spacing={4}>
                  <Avatar src={post.userPhoto} size="md" />
                  <Box flex="1">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">{post.userName}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {post.createdAt?.toDate
                            ? new Date(post.createdAt.toDate()).toLocaleString()
                            : "Just now"}
                        </Text>
                      </VStack>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" />
                        <MenuList>
                          <MenuItem onClick={() => toast({ title: "Edit coming soon", status: "info" })}>
                            Edit
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              setPostToDelete(post);
                              deleteModal.onOpen();
                            }}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>
                    <Text mt={2}>{post.content}</Text>
                    {post.imageUrl && <Image src={post.imageUrl} mt={2} borderRadius="md" />}
                    <HStack mt={3} spacing={8}>
                      <IconButton
                        size="sm"
                        icon={<FaHeart color={post.likes?.includes(uid) ? "red" : "gray"} />}
                        onClick={() => handleLike(post)}
                      />
                      <IconButton
                        size="sm"
                        icon={<FaRegComment />}
                        onClick={() => {
                          setSelectedPost(post);
                          commentModal.onOpen();
                        }}
                      />
                      <IconButton size="sm" icon={<FaRetweet />} onClick={() => handleRetweet(post)} />
                      <IconButton size="sm" icon={<FaShareAlt />} onClick={() => handleShare(post.id)} />
                    </HStack>
                  </Box>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}

        {/* Create Post Modal */}
        <CreatePost isOpen={postModal.isOpen} onClose={postModal.onClose} fetchPosts={fetchPosts} setPostContent={setPosts} uid={uid} />

        {/* Comment Modal */}
        <CommentModal
          isOpen={commentModal.isOpen}
          onClose={commentModal.onClose}
          selectedPost={selectedPost}
          commentText={commentText}
          setCommentText={setCommentText}
          handleAddComment={handleAddComment}
          commentSubmitting={commentSubmitting}
        />

        {/* View Avatar Modal */}
        <Modal isOpen={avatarModal.isOpen} onClose={avatarModal.onClose} isCentered>
          <ModalOverlay />
          <ModalContent bg="transparent" boxShadow="none">
            <ModalCloseButton color="white" />
            <Image src={buyer.profilePhotoUrl} borderRadius="full" maxH="80vh" objectFit="contain" mx="auto" />
          </ModalContent>
        </Modal>

        {/* Edit Profile Modal */}
        <Modal isOpen={editProfileModal.isOpen} onClose={editProfileModal.onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Profile</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input type="file" accept="image/*" onChange={(e) => setEditPhoto(e.target.files[0])} mb={3} />
              {previewPhoto && <Image src={previewPhoto} borderRadius="full" boxSize="100px" mb={3} />}
              <Input placeholder="Full name" value={editName} onChange={(e) => setEditName(e.target.value)} mb={3} />
              <Textarea placeholder="Bio" value={editBio} onChange={(e) => setEditBio(e.target.value)} />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="green" onClick={handleSaveProfile}>
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Post</ModalHeader>
            <ModalCloseButton />
            <ModalBody>Are you sure you want to delete this post?</ModalBody>
            <ModalFooter>
              <Button colorScheme="red" mr={3} onClick={confirmDeletePost}>
                Delete
              </Button>
              <Button onClick={deleteModal.onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </DashBoardLayout>
  );
};

export default DashboardPage;
