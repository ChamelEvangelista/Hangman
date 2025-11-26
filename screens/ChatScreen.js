// screens/ChatScreen.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { UserContext } from '../contexts/UserContext';
import { ChatService } from '../services/DatabaseService';

const ChatScreen = ({ route, navigation }) => {
  const { chatId, userName, otherUserId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  // Safely get user from context with error handling
  let currentUser = null;
  try {
    const context = useContext(UserContext);
    currentUser = context?.user || null;
  } catch (error) {
    console.warn('UserContext not available:', error);
    currentUser = null;
  }

  useEffect(() => {
    navigation.setOptions({ title: userName });
    loadMessages();
    
    // Mark messages as read when opening chat
    if (currentUser && otherUserId) {
      ChatService.markMessagesAsRead(currentUser.id, otherUserId);
    }
  }, [chatId, userName, navigation, currentUser, otherUserId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      if (currentUser && otherUserId) {
        const chatMessages = await ChatService.getMessages(currentUser.id, otherUserId);
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '' || !currentUser || !otherUserId) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Send message to database
      await ChatService.sendMessage(currentUser.id, otherUserId, messageText);
      
      // Reload messages to get the latest
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message if sending failed
      setNewMessage(messageText);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Now';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === currentUser?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myBubble : styles.otherBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.message}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {formatTime(item.timestamp)}
          {isMyMessage && (item.read ? ' ✓✓' : ' ✓')}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ba8a5c" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {messages.length === 0 ? (
        <View style={styles.emptyChat}>
          <Text style={styles.emptyChatTitle}>Start a conversation</Text>
          <Text style={styles.emptyChatText}>
            Send a message to {userName} to start chatting!
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder={`Message ${userName}...`}
          placeholderTextColor="#cdac81"
          multiline
          maxLength={500}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#340100" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#340100',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#340100',
  },
  loadingText: {
    color: '#cdac81',
    fontSize: 16,
    marginTop: 10,
  },
  messagesList: {
    padding: 15,
    paddingBottom: 10,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyChatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFF4',
    marginBottom: 10,
  },
  emptyChatText: {
    color: '#cdac81',
    fontSize: 16,
    textAlign: 'center',
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 4,
  },
  myBubble: {
    backgroundColor: '#78400f',
    borderBottomRightRadius: 5,
  },
  otherBubble: {
    backgroundColor: '#ba8a5c',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFF4',
  },
  otherMessageText: {
    color: '#340100',
  },
  timestamp: {
    fontSize: 11,
    color: '#cdac81',
    marginHorizontal: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#340100',
    borderTopWidth: 1,
    borderTopColor: '#78400f',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#78400f',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFF4',
    maxHeight: 100,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ba8a5c',
  },
  sendButton: {
    backgroundColor: '#ba8a5c',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#78400f',
  },
  sendButtonText: {
    color: '#340100',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatScreen;