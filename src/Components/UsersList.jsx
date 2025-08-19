import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Avatar,
  Text,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { collection, getDocs, doc, addDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const allUsers = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((u) => u.id !== currentUser?.uid); // exclude self
        setUsers(allUsers);
        console.log("Fetched users:", allUsers);

      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);


const sendRequest = async (user) => {
  try {
    await addDoc(collection(db, "friendRequests"), {
      from: currentUser.uid,
      to: user.uid,
      status: "pending",
      createdAt: new Date(),
    });
    console.log("Friend request sent to", user.displayName);
  } catch (error) {
    console.error("Error sending request:", error);
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
      <VStack spacing={4} align="stretch">
        {users.length === 0 && (
          <Text fontSize="sm" color="gray.500">
            No other users found
          </Text>
        )}
        {users.map((user) => (
          <HStack key={user.id} justify="space-between">
            <HStack>
              <Avatar size="sm" name={user.fullName} src={user.profilePhotoUrl} />
              <Text>{user.fullName}</Text>
            </HStack>
            <Button
              size="sm"
              colorScheme="green"
              onClick={() => sendRequest(user)}
            >
              Add Friend
            </Button>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
