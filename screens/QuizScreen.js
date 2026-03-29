import { useState, useEffect } from 'react';
import { Text, View, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import arrayShuffle from 'array-shuffle';
import { useAudioPlayer } from 'expo-audio';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';

const cs = require('../assets/correct.mp3');
const ws = require('../assets/wrong.mp3');

export default function NounsScreen({ route }) {

    const { mode } = route.params;
    const [voice, setVoice] = useState(undefined);

    const [items, setItems] = useState([]);
    const [nItems, setNItems] = useState(0);
    const [showMistakes, setShowMistakes] = useState(false);
    const [mistakes, setMistakes] = useState([]);

    const [currentItem, setCurrentItem] = useState(-1);
    const [options, setOptions] = useState();
    const [rightOpt, setRightOpt] = useState(-1);
    const [wrongOpt, setWrongOpt] = useState(-1);
    const [nCorrect, setNCorrect] = useState(0);
    const [nWrong, setNWrong] = useState(0);

    const correctSound = useAudioPlayer(cs);
    const wrongSound = useAudioPlayer(ws);

    const randomNumber = (min, max) => {
        return Math.floor(Math.random() * (max + 1 - min) + min);
    }

    const loadVoices = async () => {
        let voice;

        const voices = await Speech.getAvailableVoicesAsync();

        const germanVoices = voices.filter(
            v => v.language === "de-DE"
        );

        const preferredVoice = germanVoices.find(v =>
            /male|mann|stefan|markus|thomas|x-deg/i.test(
                `${v.identifier} ${v.name}`
            )
        );

        const fallbackVoice = germanVoices[0];

        voice = preferredVoice?.identifier ?? fallbackVoice?.identifier;
        setVoice(voice);
    }

    const loadItems = async () => {
        try {
            await loadVoices();

            let modeData = arrayShuffle(mode.data);

            setItems(modeData);
            setNItems(modeData.length);
        } catch (error) {
            console.error(error);
        }
    }

    const nextQuestion = () => {
        setCurrentItem(currentItem + 1);
    }

    useEffect(() => {

        if (currentItem == nItems) {
            return;
        }

        if (currentItem != -1 && items.length != 0) {
            if (mode.possibleAnswers && mode.possibleAnswers.length > 0) {
                var opt = [];
                var i = 0;
                for(const p of mode.possibleAnswers) {
                    opt.push(i)
                    i++;
                }
                setOptions(opt);
                speak(items[currentItem].split(" - ")[0].split(" ")[1]);
                return;
            }

            var opt = [];

            if (currentItem < nItems) {

                const corrAnswerPos = randomNumber(0, 3);
                opt[corrAnswerPos] = currentItem;

                var w1, w2, w3;
                do {
                    w1 = randomNumber(0, nItems - 1);
                    w2 = randomNumber(0, nItems - 1);
                    w3 = randomNumber(0, nItems - 1);

                } while (currentItem == w1 || currentItem == w2 || currentItem == w3 || w1 == w2 || w1 == w3 || w2 == w3);

                var ra = [w1, w2, w3];

                var i = 0;
                var j = 0;
                while (i < 4) {
                    if (i != corrAnswerPos) {
                        opt[i] = ra[j];
                        j++;
                    }
                    i++;
                }

                setOptions(opt);

                speak(items[currentItem].split(" - ")[0]);
            }
        }

    }, [currentItem]);

    const registerAnswer = async (i) => {

        if (rightOpt != -1 || wrongOpt != -1) {
            setRightOpt(-1);
            setWrongOpt(-1);
            nextQuestion();
        } else {
            var j = 0;
            while (j < options.length) {
                if ((!mode.possibleAnswers && options[j] === currentItem) || (mode.possibleAnswers && mode.possibleAnswers[j] === items[currentItem].split(" ")[0])) {
                    setRightOpt(j);
                    break;
                }
                j++;
            }

            if ((!mode.possibleAnswers && options[i] === currentItem) || (mode.possibleAnswers && mode.possibleAnswers[i] === items[currentItem].split(" ")[0])) {
                setNCorrect(nCorrect + 1);
                playCorrectSound();
            } else {
                setWrongOpt(i);
                setNWrong(nWrong + 1);
                setMistakes([...mistakes, items[currentItem]]);
                playWrongSound();
            }
        }

    }

    const playCorrectSound = () => {
        correctSound.seekTo(0);
        correctSound.play();
    }

    const playWrongSound = () => {
        wrongSound.seekTo(0);
        wrongSound.play();
    }

    const speak = async (text) => {
        Speech.speak(text, { language: 'de-DE', voice, rate: 0.6 });
    }

    useEffect(() => {
        if (items.length == 0) {
            loadItems();
        }
    }, []);

    useEffect(() => {
        if (items.length != 0) {
            nextQuestion();
        }
    }, [items]);

    return (
        <SafeAreaView style={{ backgroundColor: '#EEF3F8', flex: 1, justifyContent: 'center', justifyContent: 'space-around' }}>
            {options && currentItem >= 0 ?
                <View>
                    {!showMistakes ?

                        <View>
                            <View style={{ position: 'absolute', top: -100, padding: 20, flexDirection: 'row' }}>
                                <View style={{ borderRadius: 50, backgroundColor: '#E3F0FF' }} >
                                    <Text style={{ color: '#1F3A5F', fontSize: 20, width: 60, textAlign: 'center', padding: 10, fontWeight: 600 }}>
                                        {currentItem}
                                    </Text>
                                </View>
                                <View style={{ borderRadius: 50, backgroundColor: '#DFFBE6', marginLeft: 150 }} >
                                    <Text style={{ color: '#1E7F43', fontSize: 20, width: 60, textAlign: 'center', padding: 10, fontWeight: 600 }}>
                                        {nCorrect}
                                    </Text>
                                </View>
                                <Pressable onPress={() => setShowMistakes(true)}>
                                    <View style={{ borderRadius: 50, backgroundColor: '#FFE2E2', marginLeft: 20 }} >
                                        <Text style={{ color: '#B42318', fontSize: 20, width: 60, textAlign: 'center', padding: 10, fontWeight: 600 }}>
                                            {nWrong}
                                        </Text>
                                    </View>
                                </Pressable>
                            </View>
                            {currentItem < nItems ?
                                <View>
                                    <Pressable onPress={() => speak(items[currentItem].split(" - ")[0])}>
                                        <View style={{ marginBottom: 100 }}>
                                            {mode.modeType === 'FixedAnswers' ?
                                                <View>
                                                    <Text style={{ textAlign: 'center', fontSize: 42, fontWeight: 700, color: '#1F3A5F' }}>
                                                        ___ {items[currentItem].split(" - ")[0].split(" ")[1]}
                                                    </Text>
                                                    <Text style={{ textAlign: 'center', fontSize: 32, fontWeight: 200, color: '#1F3A5F' }}>
                                                        {items[currentItem].split(" - ")[1].trim()}
                                                    </Text>
                                                </View>
                                                :
                                                <Text style={{ textAlign: 'center', fontSize: 42, fontWeight: 700, color: '#1F3A5F' }}>
                                                    {items[currentItem].split(" - ")[0]}
                                                </Text>
                                            }
                                        </View>
                                    </Pressable>
                                    {
                                        options.map((option, i) => {

                                            var bgColor = "#E3F0FF";
                                            var txColor = "#1F3A5F";
                                            if (i == rightOpt) {
                                                bgColor = "#DFFBE6";
                                                txColor = "#1E7F43";
                                            } else if (i == wrongOpt) {
                                                bgColor = "#FFE2E2";
                                                txColor = "#B42318";
                                            }

                                            return (
                                                <Pressable key={i} onPress={() => registerAnswer(i)}>
                                                    <View style={{ backgroundColor: bgColor, padding: 12, paddingVertical: 20, marginVertical: 12, marginHorizontal: 10 }}>
                                                        <Text style={{ color: txColor, fontSize: 20, fontWeight: 700, textAlign: 'center' }}>
                                                            {mode.modeType === 'FixedAnswers' ? mode.possibleAnswers[option] : items[option].split(" - ")[1]}
                                                        </Text>
                                                    </View>
                                                </Pressable>
                                            );
                                        })
                                    }
                                </View>

                                :
                                <View>
                                    <Text style={{ textAlign: 'center', fontSize: 42, fontWeight: 800 }}>
                                        Done!
                                    </Text>
                                </View>

                            }
                        </View>

                        :

                        <View>
                            <Pressable onPress={() => setShowMistakes(false)}>
                                <View style={{ backgroundColor: "#E3F0FF", padding: 12, paddingVertical: 20, marginTop: 140, marginBottom: 20, marginHorizontal: 10 }}>
                                    <Text style={{ color: '#1F3A5F', fontSize: 20, fontWeight: 700, textAlign: 'center' }}>
                                        Go back
                                    </Text>
                                </View>
                            </Pressable>

                            <ScrollView style={{ marginBottom: 400 }}>
                                {
                                    mistakes.map((mistake, i) => {
                                        return (
                                            <Pressable key={i} onPress={() => speak(mistake.split(" - ")[0])}>
                                                <View style={{ backgroundColor: "#FFE2E2", padding: 12, paddingVertical: 20, marginVertical: 12, marginHorizontal: 10 }}>
                                                    <Text style={{ color: '#B42318', fontSize: 20, fontWeight: 700, textAlign: 'center' }}>
                                                        {mistake}
                                                    </Text>
                                                </View>
                                            </Pressable>

                                        );
                                    })
                                }
                            </ScrollView>

                        </View>

                    }

                </View>
                :
                <View >
                    <ActivityIndicator size="large" style={{ transform: [{ scaleX: 2 }, { scaleY: 2 }] }} color="#1F3A5F" />
                </View>
            }
        </SafeAreaView>
    );
}
