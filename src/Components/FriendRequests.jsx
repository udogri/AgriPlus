// src/Components/FriendRequests.jsx
import React, { useEffect, useState } from "react";
import { Box, VStack, HStack, Avatar, Text, Button, Spinner } from "@chakra-ui/react";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

export default function FriendRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "friendRequests"),
      where("toId", "==", currentUser.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRequests(reqs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleResponse = async (reqId, accept) => {
    try {
      await updateDoc(doc(db, "friendRequests", reqId), {
        status: accept ? "accepted" : "rejected",
      });
    } catch (err) {
      console.error("Error updating request:", err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="200px">
        <Spinner />
      </Box>
    );
  }

  return (
    <Box bg="white" p={4} borderRadius="lg" shadow="sm">
      <Text fontWeight="bold" fontSize="lg" mb={4}>
        Friend Requests
      </Text>
      <VStack spacing={4} align="stretch">
        {requests.length === 0 && (
          <Text fontSize="sm" color="gray.500">
            No pending requests
          </Text>
        )}
        {requests.map((req) => (
          <HStack key={req.id} justify="space-between">
            <HStack>
              <Avatar size="sm" name={req.fromId} />
              <Text>{req.fromId}</Text> {/* Optionally fetch sender's name from `users` collection */}
            </HStack>
            <HStack>
              <Button size="sm" colorScheme="green" onClick={() => handleResponse(req.id, true)}>
                Accept
              </Button>
              <Button size="sm" colorScheme="red" onClick={() => handleResponse(req.id, false)}>
                Reject
              </Button>
            </HStack>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
