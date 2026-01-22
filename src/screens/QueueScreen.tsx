import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const QueueScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Up Next</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QueueScreen;