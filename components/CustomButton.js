import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { MoveRight } from 'lucide-react-native';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function CustomButton({ title, onPress, icon: Icon = MoveRight }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.text}>{title}</Text>
      {Icon && <Icon size={20} color={Colors.white} style={styles.icon} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginTop: 20,
    minWidth: 160,
    alignSelf: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  text: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    marginRight: 10,
  },
  icon: {
    marginLeft: 5,
  },
});
