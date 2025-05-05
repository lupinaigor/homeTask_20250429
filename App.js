import {useState, useEffect} from 'react';
import {Alert, Button, StyleSheet, Text, TextInput, View, FlatList, TouchableOpacity} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {createStackNavigator} from "@react-navigation/stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import {NavigationContainer} from "@react-navigation/native";

const Stack = createStackNavigator();

const TaskScreen = ({ navigation }) => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        loadsTasks();
    }, []);

    const loadsTasks = async () => {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
        }
    };

    const saveTasks = async (newTasks) => {
        await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
        setTasks(newTasks);
    };

    const updateTask = (updatedTask) => {
        const updatedTasks = tasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
        );
        setTasks(updatedTasks);
    };

    const deleteTask = (id) => {
        Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    const newTasks = tasks.filter((task) => task.id !== id);
                    saveTasks(newTasks);
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tasks:</Text>

            <View style={{ flex: 1 }}>
                {tasks.length === 0 ? (
                    <View style={styles.noTasksContainer}>
                        <Text style={styles.noTasksText}>No tasks</Text>
                    </View>//Додається
                ) : (
                    <FlatList
                        data={tasks}
                        keyExtractor={(item) => item.id}//додається
                        renderItem={({ item }) => (
                            <View style={styles.taskItemContainer}>
                                <TouchableOpacity
                                    style={styles.taskItem}
                                    onPress={() =>
                                        navigation.navigate('TaskDetails', {
                                            task: item,
                                            updateTask,
                                        })
                                    }
                                >
                                    <Text style={styles.taskText} numberOfLines={1}>
                                        {item.text}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                                    <Ionicons name="trash-outline" size={24} color="#ff5c5c" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )}
            </View>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddTask', { saveTasks, tasks })}
            >
                <Text style={styles.addButtonText}>+ Add New Task</Text>
            </TouchableOpacity>
        </View>
    );
};

const TaskDetailsScreen = ({route, navigation}) => {
    const {task, updateTask} = route.params;
    const [taskText, setTaskText] = useState(task.text);

    const saveTask = async () => {
        if (!taskText.trim()) {
            alert('Task text cannot be empty')
        }

        updateTask({...task, text: taskText});
        navigation.goBack();

    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Change your task:</Text>
            <TextInput
                style={styles.input}
                value={taskText}
                onChangeText={setTaskText}
                multiline
            />
            <TouchableOpacity
                style={styles.addButton}
                onPress={saveTask}
            >
                <Text style={styles.addButtonText}>Save</Text>
            </TouchableOpacity>
        </View>
    )
}

const AddTaskScreen = ({route, navigation}) => {
    const {saveTasks, tasks} = route.params;
    const [taskText, setTaskText] = useState('');

    const addTask = async () => {
        if (!taskText.trim()) {
            alert('Task text cannot be empty')
            return; // Додати return, щоб зупинити виконання коду, якщо поле порожнє
        }

        const newTask = {
            id: new Date().toString(),
            text: taskText,
            completed: false
        }

        await saveTasks([...tasks, newTask]);

        setTaskText(''); // Очищення поля вводу після додавання задачі

        navigation.goBack();

    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add new Task</Text>
            <TextInput
                style={styles.textArea}
                placeholder="Enter your task details here..."
                value={taskText}
                onChangeText={setTaskText}
                multiline
            />
            <TouchableOpacity
                style={styles.saveButton}
                onPress={addTask}
            >
                <Text style={styles.saveButtonText}>Save Task</Text>
            </TouchableOpacity>
        </View>
    );
}

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Tasks" component={TaskScreen}/>
                <Stack.Screen name="AddTask" component={AddTaskScreen}/>
                <Stack.Screen name="TaskDetails" component={TaskDetailsScreen}/>
            </Stack.Navigator>
        </NavigationContainer>

    )
}

export default App;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    taskItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,
    },
    taskItem: {
        flex: 1,
        padding: 10,
    },
    taskText: {
        fontSize: 16,
    },
    addButton: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#007bff',
        borderRadius: 5,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        backgroundColor: '#fff',
        fontSize: 16,
        marginBottom: 10,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        backgroundColor: '#fff',
        fontSize: 16,
        marginBottom: 10,
        minHeight: 150,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    noTasksContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    noTasksText: {
        fontSize: 18,
        color: '#888',
    },
});


