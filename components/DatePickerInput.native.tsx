// components/DatePickerInput.native.tsx
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/colors';
import i18n, { t } from '@/lib/i18n';

interface DatePickerInputProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  placeholder?: string;
}

const formatDate = (date: Date): string => {
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(i18n.currentLocale(), { timeZone: 'UTC' }); 
};

export function DatePickerInput({ label, value, onChange, error, placeholder, ...props }: DatePickerInputProps) {
  const [show, setShow] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    setShow(false); 
    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
  };
  
  const displayDate = formatDate(value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label} *</Text>
      <TouchableOpacity onPress={() => setShow(true)} style={styles.touchArea}>
        <View style={[styles.inputContainer, error && styles.inputError]}>
          <Calendar size={20} color={Colors.textMuted} />
          <TextInput
            style={[styles.textInput, !displayDate && styles.placeholderText]}
            value={displayDate}
            placeholder={placeholder || t('health.form.datePlaceholder')}
            placeholderTextColor={Colors.textMuted}
            editable={false} // Desabilita digitação manual
            {...props}
          />
        </View>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.error,
  },
  textInput: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  placeholderText: {
    color: Colors.textMuted,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  touchArea: {
    // Usado para garantir que o toque funcione no mobile
  }
});