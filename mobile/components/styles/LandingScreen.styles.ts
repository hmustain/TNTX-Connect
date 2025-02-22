import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#000', // Black header background
    paddingVertical: 15,
    paddingHorizontal: 20, // Adds space on the sides
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'column',  // Change to column for vertical stacking
    alignItems: 'flex-start',  // Align to left
  },
  logo: {
    width: 100,  // Adjust the logo size as needed
    height: 30,
    marginBottom: 4, // Space between logo and title
  },
  headerTitle: {
    fontSize: 14, // Smaller font for the title
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    flex: 0.4, // Ensure this section takes up enough space
    alignItems: 'flex-end',
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  userText: {
    color: '#fff',
    fontSize: 14,
  },
  userSubText: {
    color: '#fff',
    fontSize: 12,
  },
  linkText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentText: {
    fontSize: 16,
  },
});
