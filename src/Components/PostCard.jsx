import React, { useState, useEffect } from 'react';
import {
  Box, Text, HStack, Button, VStack, Avatar, Divider, Image, useToast
} from '@chakra-ui/react';
import { FaRegHeart, FaHeart, FaShareAlt } from "react-icons/fa";
import { MdOutlineModeComment } from "react-icons/md";
import { BiRepost } from "react-icons/bi";
import { db, auth } from '../firebaseConfig';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import CommentModal from './CommentModal';

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState([]);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [reposts, setReposts] = useState(post.reposts || []);
  const currentUser = auth.currentUser;
  const toast = useToast();

  useEffect(() => {
    const postRef = doc(db, 'posts', post.id);
    const unsubscribe = onSnapshot(postRef, (doc) => {
      if (doc.exists()) {
        const postData = doc.data();
        setComments(postData.comments || []);
      }
    });
    return unsubscribe;
  }, [post.id]);

  const handleLike = async () => {
    const postRef = doc(db, 'posts', post.id);
    if (likes.includes(currentUser.uid)) {
      await updateDoc(postRef, {
        likes: arrayRemove(currentUser.uid),
      });
      setLikes(likes.filter((id) => id !== currentUser.uid));
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(currentUser.uid),
      });
      setLikes([...likes, currentUser.uid]);
    }
  };

  const handleRepost = async () => {
    const postRef = doc(db, 'posts', post.id);
    if (reposts.includes(currentUser.uid)) {
      await updateDoc(postRef, {
        reposts: arrayRemove(currentUser.uid),
      });
      setReposts(reposts.filter((id) => id !== currentUser.uid));
    } else {
      await updateDoc(postRef, {
        reposts: arrayUnion(currentUser.uid),
      });
      setReposts([...reposts, currentUser.uid]);
    }
  };

  const openCommentModal = () => {
    setIsCommentModalOpen(true);
  };

  const closeCommentModal = () => {
    setIsCommentModalOpen(false);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Post link copied", status: "info" });
  };

  return (
    <Box bg="white" p={5} borderRadius="lg" shadow="md" w="100%">
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={closeCommentModal}
        selectedPost={post}
        currentUserId={currentUser?.uid}
      />
      {/* Post Header */}
      <HStack align="start" spacing={4} mb={3}>
        <Avatar name={post.userName} src={post.userPhoto} />
        <Box>
          <Text fontWeight="bold">{post.userName}</Text>
          <Text fontSize="sm" color="gray.500">
            {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleString() : 'Just now'}
          </Text>
        </Box>
      </HStack>

      {/* Post Image */}
      {post.imageUrl && (
        <Image
          src={post.imageUrl}
          alt="Post"
          borderRadius="md"
          objectFit="cover"
          w="100%"
          maxH="300px"
          mb={3}
        />
      )}

      {/* Post Content */}
      <Text mb={3}>{post.content}</Text>

      {/* Likes, Comments, Reposts, Share */}
      <HStack spacing={4} mb={3}>
        <Button size="sm" colorScheme="transparent" color="black" onClick={handleLike} leftIcon={likes.includes(currentUser?.uid) ? <FaHeart color="red" /> : <FaRegHeart />}>
          {likes.length}
        </Button>
        <Button size="sm" colorScheme="transparent" color="black" onClick={openCommentModal} leftIcon={<MdOutlineModeComment />}>
          {comments.length}
        </Button>
        <Button size="sm" colorScheme="transparent" color="black" onClick={handleRepost} leftIcon={<BiRepost />}>
          {reposts.length}
        </Button>
        <Button size="sm" colorScheme="transparent" color="black" onClick={handleShare} leftIcon={<FaShareAlt />}>
          Share
        </Button>
      </HStack>
    </Box>
  );
};

export default PostCard;
