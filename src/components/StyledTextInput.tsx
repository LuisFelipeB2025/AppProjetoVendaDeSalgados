// src/components/StyledTextInput.tsx

import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../constants/Colors';

interface StyledTextInputProps extends TextInputProps {
  // O componente TextIput já aceita onChangeText, value, etc.
}

export default function StyledTextInput(props: StyledTextInputProps) {
  return (
    <TextInput
      style={styles.input}
      placeholderTextColor={Colors.placeholder}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 50,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: Colors.placeholder,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: Colors.cardBackground,
    color: Colors.text,
  },
});