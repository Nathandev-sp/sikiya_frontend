import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, useWindowDimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth_Style, authScrreenBackgroundColor, generalTextColor, generalTextFont, generalTitleColor, generalTitleFont, MainBrownSecondaryColor, withdrawnTitleColor, articleTextSize } from "../styles/GeneralAppStyle";

const VIDEO_GROUPS = ['Politics', 'Economy', 'Social', 'Tech', 'Sports', 'Business', 'Entertainment', 'Culture', 'World'];

const VideoGroupPicker = ({
  value,
  onSelect,
  placeholder = "Select video category",
  label = "Video Category",
  error,
  containerStyle,
  inputStyle,
  onOpen,
}) => {
  const { height } = useWindowDimensions();
  const [visible, setVisible] = useState(false);

  const handleCancel = () => {
    setVisible(false);
  };

  const handleOpen = () => {
    if (onOpen) {
      onOpen();
    }
    setVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          auth_Style.authInputContainer,
          containerStyle,
          error && auth_Style.inputErrorCont,
        ]}
        onPress={handleOpen}
        activeOpacity={0.8}
      >
        <Ionicons name="grid-outline" style={auth_Style.authLogo} />
        <Text
          style={[
            auth_Style.input,
            inputStyle,
            { color: value ? generalTextColor : "#aaa" },
            value && { fontSize: articleTextSize },
          ]}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#888" />
      </TouchableOpacity>

      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={handleCancel}
          />
          <View style={[styles.modalContent, { height: height * 0.5 }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{label}</Text>
              <View style={styles.headerButton} />
            </View>

            {/* Category List */}
            <FlatList
              data={VIDEO_GROUPS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  activeOpacity={0.6}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      value === item && styles.selectedCategoryText,
                    ]}
                  >
                    {item}
                  </Text>
                  {value === item && (
                    <Ionicons name="checkmark" size={20} color={MainBrownSecondaryColor} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropTouchable: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: authScrreenBackgroundColor,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D1D1D6",
  },
  headerButton: {
    width: 60,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: generalTitleColor,
    fontFamily: generalTitleFont,
    textAlign: "center",
  },
  cancelText: {
    fontSize: 15,
    color: withdrawnTitleColor,
    fontFamily: generalTextFont,
  },
  listContent: {
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: authScrreenBackgroundColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  categoryText: {
    fontSize: 16,
    fontFamily: generalTextFont,
    color: generalTextColor,
  },
  selectedCategoryText: {
    fontWeight: "600",
    color: MainBrownSecondaryColor,
  },
});

export default VideoGroupPicker;







