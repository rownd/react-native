import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

export default function DarkText({ style, children, ...rest }: TextProps) {
  if (style) {
    (style as TextStyle).color = '#000';
  }

  return (
    <Text style={style} {...rest}>
      {children}
    </Text>
  );
}
