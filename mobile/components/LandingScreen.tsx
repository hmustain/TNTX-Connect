import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import styles from './styles/LandingScreen.styles';

const LandingScreen = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const user = {
    firstName: 'Hunter',
  };

  // Adjust the path to your background image as needed.
  const backgroundImage = require('../assets/images/TNTX-Connect-Mobile.jpeg');

  const tabs = [
    { label: 'Live Tickets', icon: 'construct-outline' },
    { label: 'Past Tickets', icon: 'documents-outline' },
    { label: 'Home', icon: 'home-outline' },
    { label: 'New Ticket', icon: 'add-circle-outline' },
    { label: 'View Profile', icon: 'person-outline' },
  ];
  

  const renderContent = () => {
    switch (activeTab) {
      case 'Live Tickets':
        return <Text style={styles.contentText}>Active Tickets content goes here.</Text>;
      case 'Past Tickets':
        return <Text style={styles.contentText}>Past Tickets content goes here.</Text>;
      case 'New Ticket':
        return <Text style={styles.contentText}>New Ticket content goes here.</Text>;
      case 'View Profile':
        return <Text style={styles.contentText}>User Profile content goes here.</Text>;
      case 'Home':
      default:
        return (
          <View style={styles.homeContent}>
            <Text style={styles.welcomeText}>Welcome, {user.firstName}!</Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Start New Ticket</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            {renderContent()}
          </View>

          {/* Updated Bottom Navigation with Icons */}
          <View style={styles.bottomNav}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.label}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.label)}
              >
                <Ionicons
                  name={tab.icon as any}  // Cast to any to bypass union type check
                  size={24}
                  color={activeTab === tab.label ? '#000' : '#555'}
                />
                <Text style={[styles.tabText, activeTab === tab.label && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default LandingScreen;
