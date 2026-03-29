import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import QuizScreen from './screens/QuizScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="HomeScreen"
                    component={HomeScreen}
                    options={{
                        title: 'Home',
                        headerTintColor: '#FFFFFF',
                        headerStyle: {
                            backgroundColor: '#1F3A5F'
                        }
                    }} />

                <Stack.Screen name="QuizScreen"
                    component={QuizScreen}
                    options={({ route }) => ({
                        title: route.params.mode.modeName, headerTintColor: '#FFFFFF',
                        headerStyle: {
                            backgroundColor: '#1F3A5F'
                        }
                    })}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
