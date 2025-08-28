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
  deleteDoc,
  doc,
  getDoc, // Added deleteDoc
  query, // Added query
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import DashBoardLayout from "../DashboardLayout";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // New state for filtered users
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const [followStatuses, setFollowStatuses] = useState({}); // To store follow status for each user
  const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

  // Track auth state and fetch users
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = userData.adminId || 'guest';
          setRole(userRole);

          // Fetch full profile based on role (not directly used in this component, but kept for consistency if needed elsewhere)
          // const profileCollection = userRole === 'buyer' ? 'buyers' : 'farmers';
          // const profileDoc = await getDoc(doc(db, profileCollection, user.uid));
          // if (profileDoc.exists()) {
          //   setCurrentUserProfile(profileDoc.data());
          // }
        } else {
          setRole('guest');
        }
      } else {
        setCurrentUserId(null);
        setRole('guest');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchAllUsers = async () => {
      try {
        const [buyersSnapshot, farmersSnapshot] = await Promise.all([
          getDocs(collection(db, "buyers")),
          getDocs(collection(db, "farmers"))
        ]);

        const allBuyers = buyersSnapshot.docs.map((d) => ({ id: d.id, ...d.data(), role: 'buyer' }));
        const allFarmers = farmersSnapshot.docs.map((d) => ({ id: d.id, ...d.data(), role: 'farmer' }));

        const combinedUsers = [...allBuyers, ...allFarmers]
          .filter((u) => u.id !== currentUserId); // exclude self

        setUsers(combinedUsers);
        setFilteredUsers(combinedUsers);
        console.log("Fetched users:", combinedUsers);

        // Fetch follow statuses for all users
        const statuses = {};
        for (const user of combinedUsers) {
          const followingQuery = await getDocs(
            query(
              collection(db, 'followers'),
              where('followerId', '==', currentUserId),
              where('followingId', '==', user.id)
            )
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

    fetchAllUsers();
  }, [currentUserId]);

  useEffect(() => {
    const results = users.filter(user =>
      user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const toggleFollow = async (userId) => {
    if (!currentUserId) return;

    try {
      if (followStatuses[userId] === 'following') {
        // Unfollow
        const followingQuery = await getDocs(
          query(
            collection(db, 'followers'),
            where('followerId', '==', currentUserId),
            where('followingId', '==', userId)
          )
        );
        if (!followingQuery.empty) {
          await deleteDoc(followingQuery.docs[0].ref);
          setFollowStatuses(prev => ({ ...prev, [userId]: 'none' }));
        }
      } else {
        // Follow
        await addDoc(collection(db, 'followers'), {
          followerId: currentUserId,
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
    <DashBoardLayout role={role} active="community">
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
                name={user.fullName}
                src={user.profilePhotoUrl}
              />
              <Text>{user.fullName}</Text>
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
    </DashBoardLayout>
  );
}
