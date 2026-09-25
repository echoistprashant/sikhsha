import React from 'react';
import {
    BaseToast,
    ErrorToast,
    InfoToast,
    BaseToastProps,
} from 'react-native-toast-message';
import { StyleSheet } from 'react-native';

/**
 * Custom toast configuration with glassmorphic design
 */
export const toastConfig = {
    success: (props: BaseToastProps) => (
        <BaseToast
            {...props}
            style={styles.successToast}
            contentContainerStyle={styles.contentContainer}
            text1Style={styles.text1}
            text2Style={styles.text2}
            text2NumberOfLines={3}
        />
    ),
    error: (props: BaseToastProps) => (
        <ErrorToast
            {...props}
            style={styles.errorToast}
            contentContainerStyle={styles.contentContainer}
            text1Style={styles.text1}
            text2Style={styles.text2}
            text2NumberOfLines={3}
        />
    ),
    info: (props: BaseToastProps) => (
        <InfoToast
            {...props}
            style={styles.infoToast}
            contentContainerStyle={styles.contentContainer}
            text1Style={styles.text1}
            text2Style={styles.text2}
            text2NumberOfLines={3}
        />
    ),
};

const styles = StyleSheet.create({
    successToast: {
        borderLeftColor: '#22c55e',
        borderLeftWidth: 5,
        backgroundColor: 'rgba(34, 197, 94, 0.95)',
        height: undefined,
        minHeight: 60,
        paddingVertical: 12,
    },
    errorToast: {
        borderLeftColor: '#ef4444',
        borderLeftWidth: 5,
        backgroundColor: 'rgba(239, 68, 68, 0.95)',
        height: undefined,
        minHeight: 60,
        paddingVertical: 12,
    },
    infoToast: {
        borderLeftColor: '#38bdf8',
        borderLeftWidth: 5,
        backgroundColor: 'rgba(56, 189, 248, 0.95)',
        height: undefined,
        minHeight: 60,
        paddingVertical: 12,
    },
    contentContainer: {
        paddingHorizontal: 15,
    },
    text1: {
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff',
    },
    text2: {
        fontSize: 13,
        color: '#f3f4f6',
        marginTop: 4,
    },
});
