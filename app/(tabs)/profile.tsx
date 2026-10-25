import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import api from "../../services/api";

interface ProfileData {
  nome: string;
  email: string;
  plano?: string;
  professorNome?: string;
  professorId?: number;
}

export default function StudentProfileScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get("/students/me/profile");
        setProfile(response.data);
      } catch (error) {
        console.error("Erro ao carregar perfil do aluno:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF5500" />
      </SafeAreaView>
    );
  }

  const studentName = profile?.nome || "Aluno FitSmart";
  const studentEmail = profile?.email || "aluno@email.com";
  const teacherName = profile?.professorNome || "Prof. Lucas Andrade";
  const teacherId = profile?.professorId || 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090A" />

      <ScrollView contentContainerStyle={styles.scrollPadding}>
        <Text style={styles.headerTitle}>Meu Perfil</Text>

        {/* Card do Usuário */}
        <View style={styles.userCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>
              {studentName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{studentName}</Text>
            <Text style={styles.userEmail}>{studentEmail}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {profile?.plano || "Plano Premium"}
              </Text>
            </View>
          </View>
        </View>

        {/* Card do Personal Trainer com Botão de Chat Integrado */}
        <Text style={styles.sectionTitle}>Seu Treinador</Text>
        <View style={styles.teacherCard}>
          <View style={styles.teacherMainInfo}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
              }}
              style={styles.teacherAvatar}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.teacherRole}>Personal Trainer</Text>
              <Text style={styles.teacherName}>{teacherName}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/chat" as any,
                params: { teacherId },
              })
            }
            activeOpacity={0.8}
          >
            <Feather name="message-square" size={18} color="#FFFFFF" />
            <Text style={styles.chatButtonText}>Falar com o Personal</Text>
          </TouchableOpacity>
        </View>

        {/* Opções do Menu */}
        <Text style={styles.sectionTitle}>Opções</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/chat" as any,
                params: { teacherId },
              })
            }
          >
            <View style={styles.menuIconBox}>
              <Feather name="message-circle" size={18} color="#FF5500" />
            </View>
            <Text style={styles.menuText}>Mensagens e Dúvidas</Text>
            <Feather name="chevron-right" size={18} color="#71717A" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <Feather name="user" size={18} color="#71717A" />
            </View>
            <Text style={styles.menuText}>Dados Pessoais</Text>
            <Feather name="chevron-right" size={18} color="#71717A" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <Feather name="bell" size={18} color="#71717A" />
            </View>
            <Text style={styles.menuText}>Notificações</Text>
            <Feather name="chevron-right" size={18} color="#71717A" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <View style={styles.menuIconBox}>
              <Feather name="log-out" size={18} color="#EF4444" />
            </View>
            <Text style={[styles.menuText, { color: "#EF4444" }]}>
              Sair da Conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090A",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollPadding: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181B",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#261710",
    borderWidth: 1,
    borderColor: "#FF5500",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FF5500",
    fontSize: 22,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userEmail: {
    fontSize: 13,
    color: "#71717A",
    marginTop: 2,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 85, 0, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  badgeText: {
    fontSize: 11,
    color: "#FF5500",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  teacherCard: {
    backgroundColor: "#18181B",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  teacherMainInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  teacherAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  teacherRole: {
    fontSize: 11,
    color: "#71717A",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  teacherName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 2,
  },
  chatButton: {
    flexDirection: "row",
    backgroundColor: "#FF5500",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  chatButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  menuGroup: {
    backgroundColor: "#18181B",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#27272A",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#09090A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});