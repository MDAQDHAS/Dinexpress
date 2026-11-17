import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Animated, Pressable } from 'react-native';
import { CheckCircle, XCircle, ShoppingCart, Heart, LogOut, Bell, ArrowRight, Info } from 'lucide-react-native';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const CustomModal = ({ visible, onClose, type, message, primaryBtnText, secondaryBtnText, onPrimaryPress, onSecondaryPress }) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [slideAnim] = React.useState(new Animated.Value(height));

  const isToast = type === 'toast';

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true })
      ]).start();
      
      if (isToast) {
        const timer = setTimeout(() => {
          onClose();
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: height, duration: 200, useNativeDriver: true })
      ]).start();
    }
  }, [visible, isToast]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={48} color="#00A86B" />;
      case 'error': return <XCircle size={48} color="#FF4D4D" />;
      case 'cart': return <ShoppingCart size={40} color={Colors.primary} />;
      case 'favorite': return <Heart size={40} color={Colors.primary} fill={Colors.primary} />;
      case 'logout': return <LogOut size={40} color="#FF4D4D" />;
      case 'info': return <Info size={40} color={Colors.primary} />;
      default: return <Bell size={40} color={Colors.primary} />;
    }
  };

  if (isToast) {
    return (
      <Animated.View style={[styles.toastWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim.interpolate({inputRange: [0, height], outputRange: [0, 50]}) }] }]} pointerEvents="none">
         <View style={styles.toastContainer}>
           <Heart size={18} color={Colors.primary} fill={Colors.primary} />
           <Text style={styles.toastText}>{message}</Text>
         </View>
      </Animated.View>
    );
  }

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.overlayBg, { opacity: fadeAnim }]} />
      </Pressable>
      
      <View style={styles.centeredView}>
        <Animated.View style={[styles.modalView, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.iconWrapper}>
            {getIcon()}
          </View>
          
          <Text style={styles.modalText}>{message}</Text>

          <View style={styles.buttonContainer}>
            {secondaryBtnText && (
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => { onSecondaryPress?.(); onClose(); }}
              >
                <Text style={styles.textStyleSecondary}>{secondaryBtnText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={() => { onPrimaryPress?.(); onClose(); }}
            >
              <Text style={styles.textStylePrimary}>{primaryBtnText}</Text>
              {type === 'checkout' && <ArrowRight size={18} color="#FFF" style={{marginLeft: 8}} />}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    bottom: 110,
    width: '100%',
    alignItems: 'center',
    zIndex: 9999,
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  toastText: {
    color: '#1A1A1A',
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalView: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrapper: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FFF5E5',
    borderRadius: 60,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    backgroundColor: '#F4F5F7',
  },
  textStylePrimary: {
    color: 'white',
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    textAlign: 'center',
  },
  textStyleSecondary: {
    color: '#333',
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#1A1A1A',
    lineHeight: 24,
  },
});

export default CustomModal;
