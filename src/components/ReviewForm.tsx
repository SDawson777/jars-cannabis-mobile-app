import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

export default function ReviewForm({ onSubmit }: { onSubmit: (x: { rating: number; text?: string }) => void }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  return (
    <View accessible accessibilityLabel="Write a review">
      <TextInput
        accessibilityLabel="Rating"
        keyboardType="number-pad"
        value={String(rating)}
        onChangeText={v => setRating(Number(v) || 0)}
      />
      <TextInput
        accessibilityLabel="Review text"
        multiline
        value={text}
        onChangeText={setText}
      />
      <Button title="Submit Review" onPress={() => onSubmit({ rating, text })} />
    </View>
  );
}
