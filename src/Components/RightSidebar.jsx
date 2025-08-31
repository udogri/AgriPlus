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
  deleteDoc,
  getDocs,
  addDoc,
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
 const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // New state for filtered users
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const [followStatuses, setFollowStatuses] = useState({}); // To store follow status for each user
  const navigate = useNavigate();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.warn("⚠️ No authenticated user");
        return setLoading(false);
      }

      console.log("✅ Authenticated user:", user.uid);

      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (!userSnap.exists()) {
          console.warn('⚠️ User doc not found in "users" collection');
          return;
        }

        const { adminId: role } = userSnap.data();
        console.log("ℹ️ User role from users collection:", role);

        if (!role) {
          console.warn("⚠️ adminId not set in user doc");
          return;
        }

        const profileSnap = await getDoc(doc(db, `${role}s`, user.uid));
        if (profileSnap.exists()) {
          console.log("✅ Loaded profile data:", profileSnap.data());
          setUserData({ ...(profileSnap.data()), role });
        } else {
          console.warn(`⚠️ No ${role} profile at ${role}s/${user.uid}`);
        }

        // listen for incoming friend requests
        const q = query(
          collection(db, "friendRequests"),
          where("to", "==", user.uid),
          where("status", "==", "pending")
        );
        console.log("👀 Subscribing to friendRequests where to =", user.uid);

        const unsubReq = onSnapshot(q, async (snap) => {
          console.log("📩 Friend request snapshot received:", snap.size);

          const reqs = await Promise.all(
            snap.docs.map(async (d) => {
              const fromUser = await getDoc(doc(db, "users", d.data().from));
              console.log("➡️ Request doc:", d.id, d.data());

              return {
                id: d.id,
                from: d.data().from,
                fullName: fromUser.exists()
                  ? fromUser.data().fullName
                  : "Unknown User",
                profilePhotoUrl: fromUser.exists()
                  ? fromUser.data().profilePhotoUrl
                  : "",
              };
            })
          );

          console.log("✅ Processed requests:", reqs);
          setRequests(reqs);
        });

        return () => unsubReq();
      } catch (e) {
        console.error("❌ Error loading sidebar data", e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const handleClick = () => {
    const { role } = userData;
    console.log("👉 Avatar clicked, navigating to role:", role);

    if (role === "buyer") {
      navigate(`/buyer/dashboard/${auth.currentUser.uid}`);
    } else if (role === "farmer") {
      navigate(`/farmer/dashboard/${auth.currentUser.uid}`);
    }
  };

  const acceptRequest = async (req) => {
    try {
      console.log("✅ Accepting request from:", req.from);

      const pairId = [auth.currentUser.uid, req.from].sort().join("_");
      await setDoc(doc(db, "connections", pairId), {
        a: auth.currentUser.uid,
        b: req.from,
        since: serverTimestamp(),
      });

      await updateDoc(doc(db, "friendRequests", req.id), {
        status: "accepted",
      });

      console.log("🎉 Request accepted and connection created");
    } catch (err) {
      console.error("❌ Error accepting request", err);
    }
  };

  const declineRequest = async (req) => {
    try {
      console.log("⚠️ Declining request from:", req.from);

      await updateDoc(doc(db, "friendRequests", req.id), {
        status: "declined",
      });

      console.log("🚫 Request declined");
    } catch (err) {
      console.error("❌ Error declining request", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all users from buyers and farmers collections
  useEffect(() => {
    if (!currentUser) return;

    const fetchAllUsers = async () => {
      try {
        const [buyersSnapshot, farmersSnapshot] = await Promise.all([
          getDocs(collection(db, "buyers")),
          getDocs(collection(db, "farmers"))
        ]);

        const allBuyers = buyersSnapshot.docs.map((d) => ({ id: d.id, ...d.data(), role: 'buyer' }));
        const allFarmers = farmersSnapshot.docs.map((d) => ({ id: d.id, ...d.data(), role: 'farmer' }));

        const combinedUsers = [...allBuyers, ...allFarmers]
          .filter((u) => u.id !== currentUser.uid); // exclude self

        setUsers(combinedUsers);
        setFilteredUsers(combinedUsers);
        console.log("Fetched users:", combinedUsers);

        // Fetch follow statuses for all users
        const statuses = {};
        for (const user of combinedUsers) {
          const followingQuery = await getDocs(
            query(
              collection(db, 'followers'),
              where('followerId', '==', currentUser.uid),
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
  }, [currentUser]);

  useEffect(() => {
    const results = users.filter(user =>
      user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
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
      <HStack spacing={3} mb={4}>
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
        {/* <Text fontSize={{ base: "12px", md: "16px" }} color="gray.500">
          {userData.bio || ""}
        </Text> */}
      </HStack>

      <HStack display="flex" justifyContent="space-between" alignItems="center" gap="5px" mb={3}>
        <Text fontSize={{ base: "12px", md: "16px" }} fontWeight="600">
          Suggested for you
        </Text>
        <Text
        fontSize={{ base: "12px", md: "16px" }}
        color="green.500"
        cursor="pointer"
        onClick={() => navigate("/userslist")}
      >
        See all 
      </Text>
      </HStack>

      <VStack spacing={4} align="stretch">
              {filteredUsers.length === 0 && (
                <Text fontSize="sm" color="gray.500">
                  No users found
                </Text>
              )}
              {filteredUsers.slice(0, 5).map((user) => (
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
  );
}
