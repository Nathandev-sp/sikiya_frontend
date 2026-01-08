import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Modal, SectionList, StyleSheet, useWindowDimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppScreenBackgroundColor, { auth_Style, authScrreenBackgroundColor, generalTextColor, generalTextFont, generalTitleColor, generalTitleFont, MainBrownSecondaryColor, withdrawnTitleColor, articleTextSize, generalTextSize, articleTitleSize, generalActiveOpacity } from "../styles/GeneralAppStyle";

const CountryPicker = ({
  value,
  onSelect,
  countryList,
  placeholder = "Select your country",
  label = "Country",
  error,
  containerStyle,
  inputStyle,
  onOpen,
}) => {
  const { height } = useWindowDimensions();
  const [visible, setVisible] = useState(false);

  // Group countries alphabetically
  const sections = useMemo(() => {
    if (!countryList || countryList.length === 0) return [];
    
    const sorted = [...countryList].sort((a, b) => a.localeCompare(b));
    const grouped = {};
    
    sorted.forEach((country) => {
      const letter = country.charAt(0).toUpperCase();
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(country);
    });

    return Object.keys(grouped)
      .sort()
      .map((letter) => ({
        title: letter,
        data: grouped[letter],
      }));
  }, [countryList]);

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          auth_Style.authInputContainer,
          containerStyle,
          error && auth_Style.inputErrorCont,
        ]}
        onPress={() => {
          if (onOpen) onOpen();
          setVisible(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="flag-outline" style={auth_Style.authLogo} />
        <Text
          style={[
            auth_Style.input,
            inputStyle,
            { color: value ? generalTextColor : "#aaa" },
            value && { fontSize: generalTextSize },
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
          <View style={[styles.modalContent, { height: height * 0.6 }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel} style={styles.headerButton} activeOpacity={generalActiveOpacity} hitslop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{label}</Text>
              <View style={styles.headerButton} />
            </View>

            {/* Country List with Section Headers */}
            <SectionList
              sections={sections}
              keyExtractor={(item, index) => item + index}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  activeOpacity={0.6}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.countryText,
                      value === item && styles.selectedCountryText,
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
              stickySectionHeadersEnabled={true}
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
    backgroundColor: AppScreenBackgroundColor,
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
    fontSize: articleTitleSize,
    fontWeight: "600",
    color: generalTitleColor,
    fontFamily: generalTitleFont,
    textAlign: "center",
  },
  cancelText: {
    fontSize: generalTextSize,
    color: withdrawnTitleColor,
    fontFamily: generalTextFont,
  },
  listContent: {
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  sectionHeader: {
    backgroundColor: "#E8E8ED",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: "700",
    color: MainBrownSecondaryColor,
    fontFamily: generalTitleFont,
    letterSpacing: 0.5,
  },
  countryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: AppScreenBackgroundColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  countryText: {
    fontSize: 16,
    fontFamily: generalTextFont,
    color: generalTextColor,
  },
  selectedCountryText: {
    fontWeight: "600",
    color: MainBrownSecondaryColor,
  },
});

export default CountryPicker;
