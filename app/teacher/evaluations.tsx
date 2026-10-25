import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import api from "../../services/api";

interface EvaluationResponse {
  id: number;
  dataAvaliacao?: string;
  data?: string;
  peso: number;
  percentualGordura?: number;
  dobrasCutaneas?: any;
  alunoNome?: string;
}

export default function EvaluationsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ studentId?: string }>();

  const [evaluations, setEvaluations] = useState<EvaluationResponse[]>([]);
  const [studentName, setStudentName] = useState<string>("Aluno");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Carrega as avaliações do aluno informado
  const fetchEvaluations = async () => {
    try {
      if (params.studentId) {
        const response = await api.get(
          `/professors/students/${params.studentId}/evaluations`
        );
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];

        setEvaluations(data);

        if (data.length > 0 && data[0].alunoNome) {
          setStudentName(data[0].alunoNome);
        }
      } else {
        // Fallback: Busca todas as avaliações enviadas pelo professor
        const response = await api.get("/professors/me/evaluations");
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];
        setEvaluations(data);
      }
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [params.studentId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvaluations();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090A" />

      <ScrollView
        contentContainerStyle={styles.scrollPadding}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF5500"
          />
        }
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Avaliações</Text>
            <Text style={styles.studentName}>
              {params.studentId ? `Aluno: ${studentName}` : "Geral de Alunos"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addEvaluationButton}
            onPress={() =>
              router.push({
                pathname: "/teacher/create-evaluation",
                params: { studentId: params.studentId },
              })
            }
          >
            <Feather name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.addEvaluationText}>Nova avaliação</Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo Dinâmico */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF5500" />
            <Text style={styles.loadingText}>A carregar avaliações...</Text>
          </View>
        ) : evaluations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="activity" size={36} color="#52525B" />
            <Text style={styles.emptyTitle}>Sem avaliações registadas</Text>
            <Text style={styles.emptySubtitle}>
              Clique em "Nova avaliação" para registar as medidas do aluno.
            </Text>
          </View>
        ) : (
          <View style={{ marginTop: 20 }}>
            {evaluations.map((item) => {
              const displayDate =
                item.dataAvaliacao || item.data || "Data N/A";
              const weightText = item.peso ? `${item.peso} kg` : "--";
              const fatText = item.percentualGordura
                ? `${item.percentualGordura}%`
                : "--";

              return (
                <View key={item.id} style={styles.evaluationCard}>
                  <View>
                    <Text style={styles.evalDate}>{displayDate}</Text>
                    <Text style={styles.evalMeta}>
                      Peso: {weightText} • % Gordura: {fatText}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.outlineOrangeButton}
                    onPress={() =>
                      router.push({
                        pathname: "/teacher/evaluation-detail",
                        params: { evaluationId: item.id },
                      })
                    }
                  >
                    <Text style={styles.outlineOrangeText}>Ver detalhes</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Tab Bar Inferior Professor */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.replace("/teacher/dashboard")}
        >
          <Feather name="home" size={20} color="#71717A" />
          <Text style={styles.tabLabelInactive}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.replace("/teacher/students")}
        >
          <FontAwesome5 name="users" size={18} color="#71717A" />
          <Text style={styles.tabLabelInactive}>Alunos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.replace("/teacher/workout-builder")}
        >
          <MaterialCommunityIcons name="dumbbell" size={20} color="#71717A" />
          <Text style={styles.tabLabelInactive}>Treinos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="star" size={20} color="#FF5500" />
          <Text style={styles.tabLabelActive}>Avaliações</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.replace("/teacher/more")}
        >
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
  backButton: {
    marginBottom: 16,
    width: 36,
    height: 36,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  studentName: {
    fontSize: 14,
    color: "#71717A",
    marginTop: 2,
  },
  addEvaluationButton: {
    flexDirection: "row",
    backgroundColor: "#FF5500",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    gap: 6,
  },
  addEvaluationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  loadingText: {
    color: "#71717A",
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  emptySubtitle: {
    color: "#71717A",
    fontSize: 13,
    textAlign: "center",
  },
  evaluationCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#18181B",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  evalDate: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  evalMeta: {
    fontSize: 12,
    color: "#71717A",
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