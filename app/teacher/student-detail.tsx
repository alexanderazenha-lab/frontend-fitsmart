import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function StudentDetailScreen() {
  const router = useRouter();

  // Recebe os parâmetros passados pela lista de alunos
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    objective?: string;
    lastWorkout?: string;
    adhesion?: string;
    avatar?: string;
    age?: string;
    weight?: string;
    height?: string;
  }>();

  const [activeTab, setActiveTab] = useState<
    "Resumo" | "Avaliações" | "Treinos" | "Histórico"
  >("Resumo");

  // Valores dinâmicos com fallbacks para evitar telas vazias
  const studentName = params.name || "Ana Carolina";
  const studentAvatar =
    params.avatar ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop";
  const studentAge = params.age ? `${params.age} anos` : "24 anos";
  const studentObjective = params.objective || "Hipertrofia";
  const studentHeight = params.height ? `${params.height} m` : "1,68 m";
  const studentWeight = params.weight ? `${params.weight} kg` : "62,5 kg";
  const lastWorkoutDate = params.lastWorkout || "18/05/2026";
  const adhesionTextValue = params.adhesion
    ? `${params.adhesion}% de adesão`
    : "78% de adesão";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090A" />

      <ScrollView contentContainerStyle={styles.scrollPadding}>
        {/* Topo com Voltar e Menu de Opções */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="more-horizontal" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Perfil Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: studentAvatar }} style={styles.avatar} />
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.studentMeta}>{studentAge}</Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Ativo</Text>
          </View>
        </View>

        {/* Abas Secundárias Superior */}
        <View style={styles.tabsRow}>
          {(["Resumo", "Avaliações", "Treinos", "Histórico"] as const).map(
            (tab) => {
              const isSelected = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabButton,
                    isSelected && styles.tabButtonActive,
                  ]}
                  onPress={() => {
                    setActiveTab(tab);
                    if (tab === "Avaliações")
                      router.push("/teacher/evaluations");
                    if (tab === "Treinos")
                      router.push("/teacher/workout-builder");
                  }}
                >
                  <Text
                    style={[styles.tabText, isSelected && styles.tabTextActive]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            },
          )}
        </View>

        {/* Informações Gerais */}
        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Objetivo</Text>
            <View style={styles.infoValueBox}>
              <Text style={styles.infoValue}>{studentObjective}</Text>
              <Feather name="chevron-down" size={14} color="#71717A" />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nível</Text>
            <View style={styles.infoValueBox}>
              <Text style={styles.infoValue}>Intermediário</Text>
              <Feather name="chevron-down" size={14} color="#71717A" />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Altura</Text>
            <View style={styles.infoValueBox}>
              <Text style={styles.infoValue}>{studentHeight}</Text>
              <Feather name="chevron-down" size={14} color="#71717A" />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Peso</Text>
            <View style={styles.infoValueBox}>
              <Text style={styles.infoValue}>{studentWeight}</Text>
              <Feather name="chevron-down" size={14} color="#71717A" />
            </View>
          </View>
        </View>

        {/* Resumo Última Avaliação */}
        <View style={styles.actionCard}>
          <View>
            <Text style={styles.actionCardTitle}>Última avaliação</Text>
            <Text style={styles.actionCardSubtitle}>14/05/2026</Text>
          </View>
          <TouchableOpacity
            style={styles.outlineOrangeButton}
            onPress={() => router.push("/teacher/evaluation-detail")}
          >
            <Text style={styles.outlineOrangeText}>Ver detalhes</Text>
          </TouchableOpacity>
        </View>

        {/* Resumo Último Treino */}
        <View style={styles.actionCard}>
          <View>
            <Text style={styles.actionCardTitle}>Último treino</Text>
            <Text style={styles.actionCardSubtitle}>{lastWorkoutDate}</Text>
          </View>
          <Text style={styles.adhesionText}>{adhesionTextValue}</Text>
        </View>
      </ScrollView>

      {/* Tab Bar Inferior Professor */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/teacher/dashboard")}
        >
          <Feather name="home" size={20} color="#71717A" />
          <Text style={styles.tabLabelInactive}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/teacher/students")}
        >
          <FontAwesome5 name="users" size={18} color="#FF5500" />
          <Text style={styles.tabLabelActive}>Alunos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/teacher/workout-builder")}
        >
          <MaterialCommunityIcons name="dumbbell" size={20} color="#71717A" />
          <Text style={styles.tabLabelInactive}>Treinos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/teacher/evaluations")}
        >
          <Feather name="star" size={20} color="#71717A" />
          <Text style={styles.tabLabelInactive}>Avaliações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="menu" size={20} color="#71717A" />
          <Text style={styles.tabLabelInactive}>Mais</Text>
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
  scrollPadding: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    backgroundColor: "#27272A",
  },
  studentName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  studentMeta: {
    fontSize: 13,
    color: "#71717A",
    marginTop: 2,
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#22C55E",
    fontSize: 12,
    fontWeight: "600",
  },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF5500",
  },
  tabText: {
    fontSize: 13,
    color: "#71717A",
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#18181B",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#27272A",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#71717A",
  },
  infoValueBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#27272A",
  },
  actionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#18181B",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#27272A",
    marginBottom: 12,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  actionCardSubtitle: {
    fontSize: 12,
    color: "#71717A",
    marginTop: 2,
  },
  outlineOrangeButton: {
    borderWidth: 1,
    borderColor: "#FF5500",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  outlineOrangeText: {
    color: "#FF5500",
    fontSize: 12,
    fontWeight: "600",
  },
  adhesionText: {
    color: "#FF5500",
    fontSize: 13,
    fontWeight: "600",
  },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: "#09090A",
    borderTopWidth: 1,
    borderTopColor: "#18181B",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabelActive: {
    fontSize: 11,
    color: "#FF5500",
    fontWeight: "600",
    marginTop: 3,
  },
  tabLabelInactive: {
    fontSize: 11,
    color: "#71717A",
    marginTop: 3,
  },
});
