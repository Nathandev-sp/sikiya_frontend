import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AppScreenBackgroundColor, { articleTitleSize, auth_Style, authScrreenBackgroundColor, generalActiveOpacity, generalTextColor, generalTextFont, generalTextSize, generalTitleColor, generalTitleFont, MainBrownSecondaryColor } from "../styles/GeneralAppStyle";

const DatePickerModal = ({
  value,
  onSelect,
  placeholder = "Select your date of birth",
  label = "Date of Birth",
  error,
  containerStyle,
  inputStyle,
  minimumDate = new Date(1900, 0, 1),
  maximumDate = new Date(),
  onOpen,
}) => {
  const [visible, setVisible] = useState(false);
  const [tempDate, setTempDate] = useState(
    value ? new Date(value) : new Date(2000, 0, 1)
  );

  const formatDate = (dateInput) => {
    if (!dateInput) return "";
    // If it's a string (YYYY-MM-DD), parse it directly to avoid timezone issues
    if (typeof dateInput === "string") {
      const [year, month, day] = dateInput.split("-");
      return `${day}/${month}/${year}`;
    }
    // If it's a Date object, use UTC methods to avoid timezone shifts
    const d = new Date(dateInput);
    const day = d.getUTCDate().toString().padStart(2, "0");
    const month = (d.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForAPI = (date) => {
    // Use local date methods since the picker returns local time
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setVisible(false);
      if (event.type === "set" && selectedDate) {
        onSelect(formatDateForAPI(selectedDate));
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onSelect(formatDateForAPI(tempDate));
    setVisible(false);
  };

  const handleCancel = () => {
    setTempDate(value ? new Date(value) : new Date(2000, 0, 1));
    setVisible(false);
  };

  // Android shows inline picker
  if (Platform.OS === "android" && visible) {
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
          <Ionicons name="calendar-outline" style={auth_Style.authLogo} />
          <Text
            style={[
              auth_Style.input,
              inputStyle,
              { color: value ? generalTextColor : "#aaa" },
            ]}
          >
            {value ? formatDate(value) : placeholder}
          </Text>
        </TouchableOpacity>
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="spinner"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      </>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[
          auth_Style.authInputContainer,
          containerStyle,
          error && auth_Style.inputErrorCont,
        ]}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" style={auth_Style.authLogo} />
        <Text
          style={[
            auth_Style.input,
            inputStyle,
            { color: value ? generalTextColor : "#aaa" },
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>

      {/* iOS Modal with native picker */}
      {Platform.OS === "ios" && (
        <Modal visible={visible} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.backdropTouchable}
              activeOpacity={1}
              onPress={handleCancel}
            />
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel} style={styles.headerButton} activeOpacity={generalActiveOpacity} hitslop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={handleConfirm} style={styles.headerButton} activeOpacity={generalActiveOpacity} hitslop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Text style={styles.confirmText}>Done</Text>
                </TouchableOpacity>
              </View>

              {/* Native iOS Date Picker */}
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.datePicker}
                textColor={generalTextColor}
              />
            </View>
          </View>
        </Modal>
      )}
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
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D1D1D6",
    width: "100%",
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modalTitle: {
    fontSize: articleTitleSize,
    fontWeight: "600",
    color: generalTitleColor,
    fontFamily: generalTitleFont,
  },
  cancelText: {
    fontSize: generalTextSize,
    color: "#8E8E93",
    fontFamily: generalTextFont,
  },
  confirmText: {
    fontSize: generalTextSize,
    fontWeight: "600",
    color: MainBrownSecondaryColor,
    fontFamily: generalTitleFont,
  },
  datePicker: {
    height: 216,
    width: "100%",
    alignSelf: "center",
  },
});

export default DatePickerModal;
