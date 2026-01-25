import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Modal, SectionList, StyleSheet, useWindowDimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppScreenBackgroundColor, { auth_Style, authScrreenBackgroundColor, generalTextColor, generalTextFont, generalTitleColor, generalTitleFont, MainBrownSecondaryColor, withdrawnTitleColor, generalTextSize, generalActiveOpacity, articleTitleSize } from "../styles/GeneralAppStyle";
import { useLanguage } from "../Context/LanguageContext";

// Country codes data
const countryCodes = [
  { name: "United States", code: "+1" },
  { name: "United Kingdom", code: "+44" },
  { name: "Canada", code: "+1" },
  { name: "Australia", code: "+61" },
  { name: "Germany", code: "+49" },
  { name: "France", code: "+33" },
  { name: "Italy", code: "+39" },
  { name: "Spain", code: "+34" },
  { name: "Netherlands", code: "+31" },
  { name: "Belgium", code: "+32" },
  { name: "Switzerland", code: "+41" },
  { name: "Austria", code: "+43" },
  { name: "Sweden", code: "+46" },
  { name: "Norway", code: "+47" },
  { name: "Denmark", code: "+45" },
  { name: "Finland", code: "+358" },
  { name: "Poland", code: "+48" },
  { name: "Portugal", code: "+351" },
  { name: "Greece", code: "+30" },
  { name: "Ireland", code: "+353" },
  { name: "South Africa", code: "+27" },
  { name: "Nigeria", code: "+234" },
  { name: "Kenya", code: "+254" },
  { name: "Ghana", code: "+233" },
  { name: "Egypt", code: "+20" },
  { name: "Morocco", code: "+212" },
  { name: "Algeria", code: "+213" },
  { name: "Tunisia", code: "+216" },
  { name: "Ethiopia", code: "+251" },
  { name: "Tanzania", code: "+255" },
  { name: "Uganda", code: "+256" },
  { name: "Rwanda", code: "+250" },
  { name: "Senegal", code: "+221" },
  { name: "Ivory Coast", code: "+225" },
  { name: "Cameroon", code: "+237" },
  { name: "Angola", code: "+244" },
  { name: "Democratic Republic of the Congo", code: "+243" },
  { name: "Republic of the Congo", code: "+242" },
  { name: "Mozambique", code: "+258" },
  { name: "Madagascar", code: "+261" },
  { name: "Zimbabwe", code: "+263" },
  { name: "Zambia", code: "+260" },
  { name: "Malawi", code: "+265" },
  { name: "Botswana", code: "+267" },
  { name: "Namibia", code: "+264" },
  { name: "Mauritius", code: "+230" },
  { name: "Burundi", code: "+257" },
  { name: "Chad", code: "+235" },
  { name: "Central African Republic", code: "+236" },
  { name: "Gabon", code: "+241" },
  { name: "Equatorial Guinea", code: "+240" },
  { name: "Guinea", code: "+224" },
  { name: "Guinea-Bissau", code: "+245" },
  { name: "Liberia", code: "+231" },
  { name: "Mali", code: "+223" },
  { name: "Mauritania", code: "+222" },
  { name: "Niger", code: "+227" },
  { name: "Sierra Leone", code: "+232" },
  { name: "Togo", code: "+228" },
  { name: "Benin", code: "+229" },
  { name: "Burkina Faso", code: "+226" },
  { name: "Cape Verde", code: "+238" },
  { name: "Comoros", code: "+269" },
  { name: "Djibouti", code: "+253" },
  { name: "Eritrea", code: "+291" },
  { name: "Gambia", code: "+220" },
  { name: "Lesotho", code: "+266" },
  { name: "Libya", code: "+218" },
  { name: "Seychelles", code: "+248" },
  { name: "Somalia", code: "+252" },
  { name: "Sudan", code: "+249" },
  { name: "South Sudan", code: "+211" },
  { name: "Eswatini", code: "+268" },
  { name: "São Tomé and Príncipe", code: "+239" },
  { name: "India", code: "+91" },
  { name: "China", code: "+86" },
  { name: "Japan", code: "+81" },
  { name: "South Korea", code: "+82" },
  { name: "Singapore", code: "+65" },
  { name: "Malaysia", code: "+60" },
  { name: "Thailand", code: "+66" },
  { name: "Indonesia", code: "+62" },
  { name: "Philippines", code: "+63" },
  { name: "Vietnam", code: "+84" },
  { name: "Brazil", code: "+55" },
  { name: "Mexico", code: "+52" },
  { name: "Argentina", code: "+54" },
  { name: "Chile", code: "+56" },
  { name: "Colombia", code: "+57" },
  { name: "Peru", code: "+51" },
  { name: "Venezuela", code: "+58" },
  { name: "Ecuador", code: "+593" },
  { name: "Uruguay", code: "+598" },
  { name: "Paraguay", code: "+595" },
  { name: "Bolivia", code: "+591" },
  { name: "Russia", code: "+7" },
  { name: "Turkey", code: "+90" },
  { name: "Saudi Arabia", code: "+966" },
  { name: "United Arab Emirates", code: "+971" },
  { name: "Israel", code: "+972" },
  { name: "Lebanon", code: "+961" },
  { name: "Jordan", code: "+962" },
  { name: "Kuwait", code: "+965" },
  { name: "Qatar", code: "+974" },
  { name: "Bahrain", code: "+973" },
  { name: "Oman", code: "+968" },
  { name: "Yemen", code: "+967" },
  { name: "Iraq", code: "+964" },
  { name: "Iran", code: "+98" },
  { name: "Pakistan", code: "+92" },
  { name: "Bangladesh", code: "+880" },
  { name: "Sri Lanka", code: "+94" },
  { name: "Nepal", code: "+977" },
  { name: "Afghanistan", code: "+93" },
  { name: "Myanmar", code: "+95" },
  { name: "Cambodia", code: "+855" },
  { name: "Laos", code: "+856" },
  { name: "New Zealand", code: "+64" },
  { name: "Fiji", code: "+679" },
  { name: "Papua New Guinea", code: "+675" },
];

const CountryCodePicker = ({
  value,
  onSelect,
  placeholder = "Code",
  label = "Country Code",
  error,
  containerStyle,
  inputStyle,
  onOpen,
}) => {
  const { height } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  // Group country codes alphabetically
  const sections = useMemo(() => {
    const sorted = [...countryCodes].sort((a, b) => a.name.localeCompare(b.name));
    const grouped = {};
    
    sorted.forEach((item) => {
      const letter = item.name.charAt(0).toUpperCase();
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(item);
    });

    return Object.keys(grouped)
      .sort()
      .map((letter) => ({
        title: letter,
        data: grouped[letter],
      }));
  }, []);

  const handleCancel = () => {
    setVisible(false);
  };

  const displayValue = value ? `${value.code}` : placeholder;

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
        <Ionicons name="call-outline" style={auth_Style.authLogo} />
        <Text
          style={[
            auth_Style.input,
            inputStyle,
            { color: value ? generalTextColor : "#aaa", fontSize: generalTextSize },
          ]}
        >
          {displayValue}
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
                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{label}</Text>
              <View style={styles.headerButton} />
            </View>

            {/* Country Code List with Section Headers */}
            <SectionList
              sections={sections}
              keyExtractor={(item, index) => item.name + index}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.codeItem}
                  activeOpacity={0.6}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <View style={styles.codeItemContent}>
                    <Text style={styles.codeName}>{item.name}</Text>
                    <Text
                      style={[
                        styles.codeNumber,
                        value?.code === item.code && styles.selectedCodeText,
                      ]}
                    >
                      {item.code}
                    </Text>
                  </View>
                  {value?.code === item.code && (
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
    backgroundColor: MainBrownSecondaryColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D1D1D6",
    
  },
  headerButton: {
    width: 75,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  modalTitle: {
    fontSize: articleTitleSize,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: generalTitleFont,
    textAlign: "center",
  },
  cancelText: {
    fontSize: generalTextSize,
    color: "#FFFFFF",
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
  codeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: AppScreenBackgroundColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  codeItemContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codeName: {
    fontSize: generalTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    flex: 1,
  },
  codeNumber: {
    fontSize: generalTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    marginLeft: 12,
    fontWeight: "500",
  },
  selectedCodeText: {
    fontWeight: "600",
    color: MainBrownSecondaryColor,
  },
});

export default CountryCodePicker;

