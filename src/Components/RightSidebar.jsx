import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  VStack,
  Button,
  Avatar,
  Spinner,
  HStack,
} from "@chakra-ui/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { TbUserPlus } from "react-icons/tb";

export default function RightSidebar() {
  const [userData, setUserData] = useState({
    fullName: "",
    profilePhotoUrl: "",
    bio: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return setLoading(false);

      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (!userSnap.exists()) {
          console.warn('User doc not found in "users" collection');
          return;
        }

        const { adminId: role } = userSnap.data();
        if (!role) {
          console.warn("adminId not set in user doc");
          return;
        }

        const profileSnap = await getDoc(doc(db, `${role}s`, user.uid));
        if (profileSnap.exists()) {
          setUserData({ ...(profileSnap.data()), role });
        } else {
          console.warn(`No ${role} profile at ${role}s/${user.uid}`);
        }

        // listen for incoming friend requests
        const q = query(
          collection(db, "friendRequests"),
          where("toId", "==", user.uid),
          where("status", "==", "pending")
        );
        const unsubReq = onSnapshot(q, async (snap) => {
          const reqs = await Promise.all(
            snap.docs.map(async (d) => {
              const fromUser = await getDoc(doc(db, "users", d.data().fromId));
              return {
                id: d.id,
                fromId: d.data().fromId,
                fullName: fromUser.exists()
                  ? fromUser.data().fullName
                  : "Unknown User",
                profilePhotoUrl: fromUser.exists()
                  ? fromUser.data().profilePhotoUrl
                  : "",
              };
            })
          );
          setRequests(reqs);
        });

        return () => unsubReq();
      } catch (e) {
        console.error("Error loading sidebar data", e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const handleClick = () => {
    const { role } = userData;
    if (role === "buyer") {
      navigate(`/buyer/dashboard/${auth.currentUser.uid}`);
    } else if (role === "farmer") {
      navigate(`/farmer/dashboard/${auth.currentUser.uid}`);
    }
  };

  const acceptRequest = async (req) => {
    try {
      // create connection doc
      const pairId = [auth.currentUser.uid, req.fromId].sort().join("_");
      await setDoc(doc(db, "connections", pairId), {
        a: auth.currentUser.uid,
        b: req.fromId,
        since: serverTimestamp(),
      });

      // update request status
      await updateDoc(doc(db, "friendRequests", req.id), {
        status: "accepted",
      });
    } catch (err) {
      console.error("Error accepting request", err);
    }
  };

  const declineRequest = async (req) => {
    try {
      await updateDoc(doc(db, "friendRequests", req.id), {
        status: "declined",
      });
    } catch (err) {
      console.error("Error declining request", err);
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
    <Box
      bg="white"
      p={4}
      borderRadius="lg"
      shadow="sm"
      width="100%"
      h="calc(100vh - 100px)"
      overflowY="auto"
      position="sticky"
      top="80px"
    >
      <VStack spacing={3} mb={4}>
        <Avatar
          size={{ base: "md", md: "lg" }}
          name={userData.fullName}
          src={userData.profilePhotoUrl}
          cursor="pointer"
          onClick={handleClick}
        />
        <Text fontWeight="bold" fontSize={{ base: "16px", md: "18px" }}>
          {userData.fullName || "Your Name"}
        </Text>
        <Text fontSize={{ base: "12px", md: "16px" }} color="gray.500">
          {userData.bio || ""}
        </Text>
      </VStack>

      <Box display="flex" alignItems="center" gap="5px" mb={3}>
        <Text fontSize={{ base: "12px", md: "16px" }} fontWeight="600">
          Requests
        </Text>
        <TbUserPlus fontSize="20px" />
      </Box>

      <VStack align="start" spacing={3}>
        {requests.length === 0 && (
          <Text fontSize="sm" color="gray.500">
            No requests yet
          </Text>
        )}
        {requests.map((req) => (
          <Box key={req.id} w="100%">
            <HStack spacing={2}>
              <Avatar size="sm" name={req.fullName} src={req.profilePhotoUrl} />
              <Text fontSize={{ base: "12px", md: "16px" }}>{req.fullName}</Text>
            </HStack>
            <HStack mt={1} spacing={2}>
              <Button
                size="xs"
                color="white"
                bg="green.400"
                onClick={() => acceptRequest(req)}
              >
                Accept
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => declineRequest(req)}
              >
                Decline
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>

      <Text
        mt={4}
        fontSize={{ base: "12px", md: "16px" }}
        color="blue.500"
        cursor="pointer"
        onClick={() => navigate("/requests")}
      >
        See all requests
      </Text>
    </Box>
  );
}
