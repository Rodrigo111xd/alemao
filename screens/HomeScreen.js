import { useState, useEffect } from 'react';
import { Text, View, Pressable, ActivityIndicator, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {

    const [data, setData] = useState();
    const [currentLanguage, setCurrentLanguage] = useState();
    const [currentLanguageIndex, setCurrentLanguageIndex] = useState(-1);

    const loadData = async () => {
        var rawData;
        try {
            const response = await fetch('https://api.npoint.io/1ccc3cb391721593af78', {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': 0
                }
            });
            rawData = await response.json();
        } catch (error) {
            console.log("Erro ao baixar ou processar dados remotos. Utilizando dados locais.");
            rawData = require('../assets/german_all.json');
        }
        if (rawData) {
            setData(rawData);
        }
    }

    const changeLanguage = () => {
        setCurrentLanguageIndex((currentLanguageIndex + 1) % data.languages.length);
    }

    useEffect(() => {
        if (!data) {
            loadData();
        }
    }, []);

    useEffect(() => {
        if (data) {
            var processedData = data.languages[currentLanguageIndex];
            for (const mode of processedData.modes) {
                if (mode.reuseDataSet !== undefined) {
                    for (const mode2 of processedData.modes) {
                        if (mode2.modeName === mode.reuseDataSet && mode2.data) {
                            mode.data = mode2.data;
                            break;
                        }
                    }
                }
            }
            setCurrentLanguage(processedData);
        }
    }, [currentLanguageIndex]);

    useEffect(() => {
        if (data && currentLanguageIndex === -1) {
            setCurrentLanguageIndex(0);
        }
    }, [data]);

    return (
        <SafeAreaView style={{ backgroundColor: '#EEF3F8', flex: 1 }}>
            {
                data && currentLanguage ?
                    <ScrollView style={{ flex: 1, paddingBottom: "100px" }}>
                        <Pressable onPress={() => changeLanguage()}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                marginRight: 20,
                                backgroundColor: '#EEF3F8'
                            }}>
                            <Image source={{ uri: currentLanguage.countryFlagBase64 ?? currentLanguage.countryFlagUrl }} style={{ width: 32, height: 24, marginRight: 10 }} />
                            <Text style={{ color: '#1F3A5F', fontSize: 20, fontWeight: 500 }}>
                                {currentLanguage.languageName}
                            </Text>
                        </Pressable>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={require('../assets/logo.png')} style={{ width: "100%", alignSelf: 'center' }} resizeMode="contain" />
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            {
                                currentLanguage.modes.map((mode, i) => {
                                    return (
                                        <Pressable onPress={() => navigation.navigate('QuizScreen', { mode: mode })} key={i}>
                                            <View style={{ backgroundColor: '#D62828', borderRadius: 8, padding: 12, paddingVertical: 20, marginBottom: 30, marginHorizontal: 10 }}>
                                                <Text style={{ fontSize: 20, color: '#FFFFFF', fontWeight: 500, textAlign: 'center' }}>
                                                    {mode.modeName}
                                                </Text>
                                            </View>
                                        </Pressable>
                                    );
                                })
                            }
                        </View>
                    </ScrollView>
                    :
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <ActivityIndicator size="large" style={{ transform: [{ scaleX: 2 }, { scaleY: 2 }] }} color="#1F3A5F" />
                    </View>
            }
        </SafeAreaView>
    );
}
