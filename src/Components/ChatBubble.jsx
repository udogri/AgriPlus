import React, { useEffect, useState } from 'react';
import { IconButton, Tooltip, Badge } from '@chakra-ui/react';
import { FaComments } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const ChatBubble = () => {
  const navigate = useNavigate();
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setUnreadChatsCount(0);
      return;
    }

    const q = query(
      collection(db, 'connections'), // Query the 'connections' collection
      where('users', 'array-contains', currentUserId) // Filter by current user's participation
    );

    const unsubscribeChats = onSnapshot(q, (snapshot) => {
      let unreadCount = 0;
      snapshot.docs.forEach(doc => {
        const connectionData = doc.data();
        // Check if there's a last message and if it's from another user
        if (connectionData.lastMessage && connectionData.lastMessage.senderId !== currentUserId) {
          // Check if the current user has read this last message
          const lastReadTimestamp = connectionData.readStatus?.[currentUserId]?.toDate().getTime();
          const lastMessageTimestamp = connectionData.lastMessage.timestamp?.toDate().getTime();

          if (lastMessageTimestamp && (!lastReadTimestamp || lastReadTimestamp < lastMessageTimestamp)) {
            unreadCount++;
          }
        }
      });
      setUnreadChatsCount(unreadCount);
    }, (error) => {
      console.error("Error fetching chats for unread count:", error);
    });

    return () => unsubscribeChats();
  }, [currentUserId]);

  return (
    <Tooltip label="View Chats" placement="left">
      <IconButton
        icon={
          <>
            <FaComments />
            {unreadChatsCount > 0 && (
              <Badge
                position="absolute"
                top="-2px"
                right="-1px"
                borderRadius="full"
                colorScheme="red"
                fontSize="0.7em"
                px="2"
              >
                {unreadChatsCount}
              </Badge>
            )}
          </>
        }
        colorScheme="green"
        borderRadius="full"
        size="lg"
        shadow="lg"
        position="fixed"
        bottom="50px"
        right="30px"
        onClick={() => navigate('/chats')}
        aria-label="View chats"
      />
    </Tooltip>
  );
};

export default ChatBubble;
