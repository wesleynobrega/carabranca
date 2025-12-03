import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View, TouchableOpacity, TextInputProps } from 'react-native';

// Importações relativas corrigidas
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '../constants/colors';
import i18n, { t } from '@/lib/i18n'; 

interface DatePickerInputProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  placeholder?: string;
}

// 1. Helper para formatar data para exibição no MOBILE
const formatDate = (date: Date): string => {
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(i18n.currentLocale(), { timeZone: 'UTC' }); 
};

// 2. Helper para formatar data para o input HTML (YYYY-MM-DD)
const dateToHtmlValue = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export function DatePickerInput({ label, value, onChange, error, placeholder, ...props }: DatePickerInputProps) {
  const [show, setShow] = useState(false);

  // --- HANDLERS PARA MOBILE (Abre modal) ---
  const handleDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    setShow(false); 
    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
  };
  
  // --- RENDERING PARA WEB (PWA) ---
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label} *</Text>
        <View style={[styles.inputContainer, error && styles.inputError]}>
          <Calendar size={20} color={Colors.textMuted} />
          {/* ✅ Renderiza input HTML nativo (abre o calendário do navegador) */}
          <input
            type="date"
            style={styles.webInput}
            value={dateToHtmlValue(value)}
            onChange={(e) => {
              // Adicionamos 'T00:00:00' para corrigir o fuso horário no Web
              const dateString = e.target.value;
              if (dateString) {
                onChange(new Date(dateString + 'T00:00:00'));
              }
            }}
          />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  // --- RENDERING PARA NATIVE (ANDROID/IOS) ---
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label} *</Text>
      
      {/* 💡 MOBILE: Touchabre para abrir o modal nativo */}
      <TouchableOpacity onPress={() => setShow(true)} style={styles.touchArea}>
        <View style={[styles.inputContainer, error && styles.inputError]}>
          <Calendar size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.textInput}
            value={formatDate(value)}
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

// ✅ O bloco de estilos DEVE estar sempre no final
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
  webInput: { // ✅ Estilo do Input HTML para parecer nativo
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    fontSize: FontSize.md,
    color: Colors.text,
    appearance: 'none',
    borderWidth: 0,
    backgroundColor: 'transparent',
    outlineStyle: 'none',
  } as any,
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  touchArea: {
    // Usado para garantir que o toque funcione no mobile
  }
});