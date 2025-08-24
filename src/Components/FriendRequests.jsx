import React, { useEffect, useState } from "react";
import { Box, VStack, HStack, Avatar, Text, Button, Spinner } from "@chakra-ui/react";
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function FriendRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Track logged in user
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Listen for friend requests
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "friendRequests"),
      where("to", "==", currentUser.uid),
      where("status", "==", "pending")
    );

    const unsubReq = onSnapshot(q, async (snap) => {
      console.log("📩 Friend request snapshot received:", snap.size);

      const reqs = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          console.log("➡️ Request doc:", d.id, data);

          // fetch sender info from "users"
          const fromUserRef = doc(db, "users", data.from);
          const fromUserSnap = await getDoc(fromUserRef);

          return {
            id: d.id,
            from: data.from,
            fullName: fromUserSnap.exists()
              ? fromUserSnap.data().fullName
              : "Unknown User",
            profilePhotoUrl: fromUserSnap.exists()
              ? fromUserSnap.data().profilePhotoUrl
              : "",
          };
        })
      );

      console.log("✅ Processed requests:", reqs);
      setRequests(reqs);
      setLoading(false);
    });

    return () => unsubReq();
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
              <Avatar size="sm" name={req.fullName} src={req.profilePhotoUrl} />
              <Text>{req.fullName}</Text>
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
