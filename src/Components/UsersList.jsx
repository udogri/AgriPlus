import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Avatar,
  Text,
  Button,
  Spinner,
  Input, // Added Input for search bar
} from "@chakra-ui/react";
import {
  collection,
  getDocs,
  addDoc, // Added addDoc
  where, // Added where
  deleteDoc, // Added deleteDoc
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // New state for filtered users
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const [followStatuses, setFollowStatuses] = useState({}); // To store follow status for each user
  const navigate = useNavigate();

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all users
  useEffect(() => {
    if (!currentUser) return;

    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const allUsers = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((u) => u.id !== currentUser.uid); // exclude self
        setUsers(allUsers);
        setFilteredUsers(allUsers); // Initialize filtered users with all users
        console.log("Fetched users:", allUsers);

        // Fetch follow statuses for all users
        const statuses = {};
        for (const user of allUsers) {
          const followingQuery = await getDocs(
            collection(db, 'followers'),
            where('followerId', '==', currentUser.uid),
            where('followingId', '==', user.id)
          );
          if (!followingQuery.empty) {
            statuses[user.id] = 'following';
          } else {
            statuses[user.id] = 'none';
          }
        }
        setFollowStatuses(statuses);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    const results = users.filter(user =>
      user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const toggleFollow = async (userId) => {
    if (!currentUser) return;

    try {
      if (followStatuses[userId] === 'following') {
        // Unfollow
        const followingQuery = await getDocs(
          collection(db, 'followers'),
          where('followerId', '==', currentUser.uid),
          where('followingId', '==', userId)
        );
        if (!followingQuery.empty) {
          await deleteDoc(followingQuery.docs[0].ref);
          setFollowStatuses(prev => ({ ...prev, [userId]: 'none' }));
        }
      } else {
        // Follow
        await addDoc(collection(db, 'followers'), {
          followerId: currentUser.uid,
          followingId: userId,
          createdAt: new Date().toISOString(),
        });
        setFollowStatuses(prev => ({ ...prev, [userId]: 'following' }));
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  if (loading) {
    return (
      <Box
        h="calc(100vh - 100px)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner />
      </Box>
    );
  }

  return (
    <Box bg="white" p={4} borderRadius="lg" shadow="sm">
      <Text fontWeight="bold" fontSize="lg" mb={4}>
        Discover People
      </Text>
      <Input
        placeholder="Search users..."
        mb={4}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <VStack spacing={4} align="stretch">
        {filteredUsers.length === 0 && (
          <Text fontSize="sm" color="gray.500">
            No users found
          </Text>
        )}
        {filteredUsers.map((user) => (
          <HStack
            key={user.id}
            justify="space-between"
            p={2}
            _hover={{ bg: "gray.50" }}
            cursor="pointer"
            onClick={() => navigate(`/buyer/profile/${user.id}`)}
          >
            <HStack>
              <Avatar
                size="sm"
                name={user.displayName}
                src={user.profilePhotoUrl}
              />
              <Text>{user.displayName}</Text>
            </HStack>
            {followStatuses[user.id] === 'none' ? (
              <Button
                size="sm"
                colorScheme="green"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFollow(user.id);
                }}
              >
                Follow
              </Button>
            ) : (
              <Button
                size="sm"
                colorScheme="gray"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFollow(user.id);
                }}
              >
                Following
              </Button>
            )}
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
