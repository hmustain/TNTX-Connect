import React from 'react';
import { SafeAreaView, View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import styles from './styles/IntroScreen.styles'

const IntroScreen = () => {
  // Adjust path to your image if it's located elsewhere
  const backgroundImage = require('../assets/images/TNTX-Connect-Mobile.jpeg');

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlay}>
          {/* Title / Subtitle */}
          <Text style={styles.title}>Welcome to TNTX Connect</Text>
          <Text style={styles.subtitle}>We handle all of your breakdown solutions</Text>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.signUpButton}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signInButton}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default IntroScreen;
