import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';

interface DatePickerInputProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
}

export function DatePickerInput({ label, value, onChange, error }: DatePickerInputProps) {
  const [show, setShow] = useState(false);
  const { locale } = useHerd();

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // No Android, o seletor é fechado automaticamente. No iOS, precisamos fechar manualmente.
    if (Platform.OS === 'android') {
      setShow(false);
    }

    // Se uma data foi selecionada (não cancelada), atualiza o estado.
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  // Formata a data para exibição no formato local (ex: 25/12/2024)
  const formattedDate = value.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC', // Usar UTC para evitar problemas de fuso horário
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[styles.inputContainer, error ? styles.inputError : null]}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Calendar size={20} color={Colors.textMuted} />
        <Text style={styles.inputText}>{formattedDate}</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={value}
          mode="date"
          is24Hour={true}
          display="default" // 'spinner' ou 'calendar' no Android
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
    fontWeight: FontWeight.medium,
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
    minHeight: 48,
    gap: Spacing.sm,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});