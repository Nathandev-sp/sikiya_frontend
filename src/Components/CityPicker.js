import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Modal, SectionList, StyleSheet, useWindowDimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth_Style, authScrreenBackgroundColor, generalTextColor, generalTextFont, generalTitleColor, generalTitleFont, MainBrownSecondaryColor, withdrawnTitleColor, articleTextSize, generalTextSize } from "../styles/GeneralAppStyle";
import CitiesByCountry from "../../assets/Data/CitiesByCountry.json";

// Country name mapping to handle variations between country picker names and CitiesByCountry.json keys
const countryNameMap = {
  "DR Congo": "Democratic Republic of the Congo",
  "Democratic Republic of Congo": "Democratic Republic of the Congo",
  "DRC": "Democratic Republic of the Congo",
  "Congo (DRC)": "Democratic Republic of the Congo",
  "Congo-Kinshasa": "Democratic Republic of the Congo",
  "Congo": "Republic of the Congo",
  "Republic of Congo": "Republic of the Congo",
  "Congo-Brazzaville": "Republic of the Congo",
  "CAR": "Central African Republic",
  "Central African Republic": "Central African Republic",
  "Cabo Verde": "Cape Verde",
  "Cape Verde": "Cape Verde",
  "São Tomé and Príncipe": "Sao Tome and Principe",
  "São Tomé and Principe": "Sao Tome and Principe",
  "Sao Tome and Principe": "Sao Tome and Principe",
  "Côte d'Ivoire": "Ivory Coast",
  "Ivory Coast": "Ivory Coast",
};

const CityPicker = ({
  value,
  onSelect,
  selectedCountry,
  placeholder = "Select a city",
  label = "City",
  error,
  containerStyle,
  inputStyle,
}) => {
  const { height } = useWindowDimensions();
  const [visible, setVisible] = useState(false);

  // Get cities for selected country (with name mapping)
  const cities = useMemo(() => {
    if (!selectedCountry) {
      return [];
    }
    
    // Try direct lookup first
    if (CitiesByCountry[selectedCountry]) {
      return CitiesByCountry[selectedCountry];
    }
    
    // Try mapped name if direct lookup fails
    const mappedCountryName = countryNameMap[selectedCountry];
    if (mappedCountryName && CitiesByCountry[mappedCountryName]) {
      return CitiesByCountry[mappedCountryName];
    }
    
    return [];
  }, [selectedCountry]);

  // Group cities alphabetically
  const sections = useMemo(() => {
    if (!cities || cities.length === 0) return [];
    
    const sorted = [...cities].sort((a, b) => a.localeCompare(b));
    const grouped = {};
    
    sorted.forEach((city) => {
      const letter = city.charAt(0).toUpperCase();
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(city);
    });

    return Object.keys(grouped)
      .sort()
      .map((letter) => ({
        title: letter,
        data: grouped[letter],
      }));
  }, [cities]);

  const handleCancel = () => {
    setVisible(false);
  };

  const isDisabled = !selectedCountry;

  return (
    <>
      <TouchableOpacity
        style={[
          auth_Style.authInputContainer,
          containerStyle,
          error && auth_Style.inputErrorCont,
          isDisabled && styles.disabledContainer,
        ]}
        onPress={() => !isDisabled && setVisible(true)}
        activeOpacity={isDisabled ? 1 : 0.8}
        disabled={isDisabled}
      >
        <Ionicons name="location-outline" style={auth_Style.authLogo} />
        <Text
          style={[
            auth_Style.input,
            inputStyle,
            { color: value ? generalTextColor : "#aaa" },
            value && { fontSize: generalTextSize },
            isDisabled && styles.disabledText,
          ]}
        >
          {isDisabled 
            ? "Select country first" 
            : value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={isDisabled ? "#ccc" : "#888"} />
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
              <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{label}</Text>
              <View style={styles.headerButton} />
            </View>

            {/* City List with Section Headers */}
            {sections.length > 0 ? (
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
                    style={styles.cityItem}
                    activeOpacity={0.6}
                    onPress={() => {
                      onSelect(item);
                      setVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.cityText,
                        value === item && styles.selectedCityText,
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
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No cities available</Text>
                <Text style={styles.emptySubtext}>Please select a country first</Text>
              </View>
            )}
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
  cityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: authScrreenBackgroundColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  cityText: {
    fontSize: 16,
    fontFamily: generalTextFont,
    color: generalTextColor,
  },
  selectedCityText: {
    fontWeight: "600",
    color: MainBrownSecondaryColor,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  disabledText: {
    color: "#aaa",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: generalTitleFont,
    color: generalTitleColor,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
  },
});

export default CityPicker;

