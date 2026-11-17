import React from 'react';
import { View, TextInput, StyleSheet, Dimensions } from 'react-native';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function CustomInput({ icon: Icon, placeholder, secureTextEntry, value, onChangeText, keyboardType }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {Icon && <Icon size={20} color={Colors.placeholder} />}
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.placeholder}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 55,
    width: width * 0.85,
    alignSelf: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: Colors.text,
  },
});
