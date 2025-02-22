import React from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './styles/LandingScreen.styles';

const LandingScreen = () => {
  // Simulate authentication status and user data
  const isAuthenticated = true; // Change to true for logged-in state
  const user = {
    name: 'Hunter',
    company: 'TNTX Solutions.',
  };

  // Import your logo image from your assets folder (adjust the path if needed)
  const logo = require('../assets/images/TNTX-SOLUTIONS-LOGO.png');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Left side: Logo and Portal Title arranged in a column */}
        <View style={styles.headerLeft}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.headerTitle}>Customer Portal</Text>
        </View>
        {/* Right side: User Info or Login/Register */}
        <View style={styles.headerRight}>
          {isAuthenticated ? (
            <View style={styles.userInfo}>
              <Text style={styles.userText}>Hello, {user.name}</Text>
              <Text style={styles.userSubText}>{user.company}</Text>
              <TouchableOpacity>
                <Text style={styles.linkText}>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.linkText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Login / Register</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.contentText}>Welcome to the Landing Screen for TNTX Mobile</Text>
      </View>
    </SafeAreaView>
  );
};

export default LandingScreen;
