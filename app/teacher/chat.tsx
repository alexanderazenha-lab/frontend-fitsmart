import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getChatHistory,
  markMessagesAsRead,
  MessageDTO,
  sendMessage,
} from "../../services/chatService";

export default function TeacherChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ studentId?: string; studentName?: string }>();

  // Dados do aluno selecionado na conversa
  const targetStudentId = Number(params.studentId) || 1;
  const studentDisplayName = params.studentName || "Aluno";

  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Carrega as mensagens da conversa com o aluno
  const loadMessages = async () => {
    try {
      const history = await getChatHistory(targetStudentId);
      setMessages(history);
      await markMessagesAsRead(targetStudentId);
    } catch (error) {
      console.error("Erro ao carregar chat do professor:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();

    // Atualiza a conversa a cada 4 segundos para checar novas mensagens do aluno
    const interval = setInterval(() => {
      loadMessages();
    }, 4000);

    return () => clearInterval(interval);
  }, [targetStudentId]);

  // Envia resposta para o aluno
  const handleSend = async () => {
    if (!inputMessage.trim() || sending) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setSending(true);

    try {
      const newMsg = await sendMessage({
        destinatarioId: targetStudentId,
        texto: messageText,
      });

      if (newMsg) {
        setMessages((prev) => [...prev, newMsg]);
      } else {
        // Fallback local em caso de instabilidade de rede
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            remetenteId: 0,
            destinatarioId: targetStudentId,
            texto: messageText,
            dataEnvio: new Date().toISOString(),
            tipoRemetente: "PROFESSOR",
          },
        ]);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem pelo professor:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090A" />

      {/* Header do Chat */}
      <View style={styles.chatHeader}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
          }}
          style={styles.avatar}
        />

        <View style={styles.headerInfo}>
          <Text style={styles.studentName}>{studentDisplayName}</Text>
          <Text style={styles.onlineStatus}>Aluno • Online agora</Text>
        </View>

        <TouchableOpacity style={styles.iconButton}>
          <Feather name="phone" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Área de Mensagens */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5500" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.messagesPadding}>
          {messages.map((msg) => {
            const isTeacher = msg.tipoRemetente === "PROFESSOR";
            const formattedTime = msg.dataEnvio
              ? new Date(msg.dataEnvio).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Agora";

            return (
              <View
                key={msg.id}
                style={[
                  styles.messageWrapper,
                  isTeacher ? styles.teacherWrapper : styles.studentWrapper,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isTeacher ? styles.teacherBubble : styles.studentBubble,
                  ]}
                >
                  <Text style={styles.messageText}>{msg.texto}</Text>
                  <Text style={styles.messageTime}>{formattedTime}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Input de Mensagem */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Feather name="paperclip" size={20} color="#A1A1AA" />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Escreva uma mensagem..."
          placeholderTextColor="#52525B"
          value={inputMessage}
          onChangeText={setInputMessage}
        />

        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={16} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090A",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#18181B",
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  onlineStatus: {
    fontSize: 12,
    color: "#22C55E",
  },
  messagesPadding: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: "row",
  },
  teacherWrapper: {
    justifyContent: "flex-end",
  },
  studentWrapper: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 16,
    padding: 12,
  },
  teacherBubble: {
    backgroundColor: "#FF5500",
    borderBottomRightRadius: 4,
  },
  studentBubble: {
    backgroundColor: "#18181B",
    borderWidth: 1,
    borderColor: "#27272A",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#18181B",
    backgroundColor: "#09090A",
    gap: 10,
  },
  attachButton: {
    padding: 6,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#18181B",
    color: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF5500",
    alignItems: "center",
    justifyContent: "center",
  },
});