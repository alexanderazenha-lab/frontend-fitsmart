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

export default function StudentChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ teacherId?: string }>();

  // ID padrão do professor caso não venha via parâmetro de rota
  const targetTeacherId = Number(params.teacherId) || 1;

  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Carrega as mensagens da API Spring Boot
  const loadMessages = async () => {
    try {
      const history = await getChatHistory(targetTeacherId);
      setMessages(history);
      await markMessagesAsRead(targetTeacherId);
    } catch (error) {
      console.error("Erro ao carregar chat do aluno:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();

    // Atualiza o chat a cada 4 segundos para receber novas respostas do professor
    const interval = setInterval(() => {
      loadMessages();
    }, 4000);

    return () => clearInterval(interval);
  }, [targetTeacherId]);

  // Envia nova mensagem
  const handleSend = async () => {
    if (!inputMessage.trim() || sending) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setSending(true);

    try {
      const newMsg = await sendMessage({
        destinatarioId: targetTeacherId,
        texto: messageText,
      });

      if (newMsg) {
        setMessages((prev) => [...prev, newMsg]);
      } else {
        // Fallback local caso ocorra falha temporária na rede
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            remetenteId: 0,
            destinatarioId: targetTeacherId,
            texto: messageText,
            dataEnvio: new Date().toISOString(),
            tipoRemetente: "ALUNO",
          },
        ]);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
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
            uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
          }}
          style={styles.avatar}
        />

        <View style={styles.headerInfo}>
          <Text style={styles.teacherName}>Prof. Lucas Andrade</Text>
          <Text style={styles.onlineStatus}>Personal Trainer • Online</Text>
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
            const isStudent = msg.tipoRemetente === "ALUNO";
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
                  isStudent ? styles.studentWrapper : styles.teacherWrapper,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isStudent ? styles.studentBubble : styles.teacherBubble,
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
          placeholder="Tire uma dúvida com o seu personal..."
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
  teacherName: {
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
  studentWrapper: {
    justifyContent: "flex-end",
  },
  teacherWrapper: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 16,
    padding: 12,
  },
  studentBubble: {
    backgroundColor: "#FF5500",
    borderBottomRightRadius: 4,
  },
  teacherBubble: {
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