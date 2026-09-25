import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import GlassScreen from '../../components/GlassScreen';

type PDFViewerParams = {
    PDFViewer: {
        url: string;
        title?: string;
    };
};

const PDFViewerScreen: React.FC = () => {
    const route = useRoute<RouteProp<PDFViewerParams, 'PDFViewer'>>();
    const navigation = useNavigation();
    const { url, title } = route.params;

    // Use Google Docs Viewer for PDF rendering
    const pdfViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {title || 'PDF Viewer'}
                </Text>
                <View style={styles.spacer} />
            </View>

            <WebView
                source={{ uri: pdfViewerUrl }}
                style={styles.webview}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#38bdf8" />
                        <Text style={styles.loadingText}>Loading PDF...</Text>
                    </View>
                )}
                onError={(syntheticEvent: { nativeEvent: { code: number; description: string } }) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error: ', nativeEvent);
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scalesPageToFit={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#1e293b',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(75, 85, 99, 0.4)',
    },
    backButton: {
        paddingVertical: 8,
        paddingRight: 16,
    },
    backText: {
        color: '#38bdf8',
        fontSize: 16,
        fontWeight: '600',
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#f9fafb',
        textAlign: 'center',
    },
    spacer: {
        width: 60,
    },
    webview: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#9ca3af',
    },
});

export default PDFViewerScreen;
