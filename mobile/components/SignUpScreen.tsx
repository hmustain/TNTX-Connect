import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ImageBackground,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import styles from './styles/SignUpScreen.styles';

const SignUpScreen = () => {
  // Form state for name, email, and password
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Adjust the path to your background image as needed
  const backgroundImage = require('../assets/images/TNTX-Connect-Mobile.jpeg');

  const handleSignUp = () => {
    // Add your sign up logic here
    console.log('Sign Up pressed:', name, email, password);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>Join TNTX Connect Today</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkContainer}>
              <Text style={styles.linkText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SignUpScreen;
