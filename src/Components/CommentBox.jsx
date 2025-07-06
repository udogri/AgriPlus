import React, { useState } from 'react';
import { Input, Button, HStack } from '@chakra-ui/react';

const CommentBox = ({ onSubmit }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <HStack w="100%">
      <Input size="sm" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment..." />
      <Button size="sm" onClick={handleSend}>Send</Button>
    </HStack>
  );
};

export default CommentBox;
