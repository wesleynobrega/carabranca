// components/DatePickerInput.web.tsx
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/colors';
import { Calendar } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DatePickerInputProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  placeholder?: string;
}

const dateToHtmlValue = (date: Date): string => {
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export function DatePickerInput({ label, value, onChange, error, placeholder }: DatePickerInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label} *</Text>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <Calendar size={20} color={Colors.textMuted} />
        <input
          type="date"
          style={styles.webInput}
          value={dateToHtmlValue(value)}
          onChange={(e) => {
            const dateString = e.target.value;
            if (dateString) {
              // Adicionamos 'T00:00:00' para corrigir o fuso horário no Web
              onChange(new Date(dateString + 'T00:00:00'));
            } else {
              onChange(new Date(NaN)); 
            }
          }}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
  webInput: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    fontSize: FontSize.md,
    color: Colors.text,
    // Estilos para desabilitar o estilo nativo do navegador
    appearance: 'none',
    borderWidth: 0,
    backgroundColor: 'transparent',
    outlineStyle: 'none',
  } as any, // 'as any' é usado para aceitar propriedades específicas do HTML/Web no TSX
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});