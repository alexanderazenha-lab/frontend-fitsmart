import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import api from "../../services/api";

interface EvaluationDetail {
  id: number;
  dataAvaliacao?: string;
  data?: string;
  peso?: number;
  percentualGordura?: number;
  massaMagra?: number;
  imc?: number;
  perímetros?: {
    cintura?: number;
    quadril?: number;
    braco?: number;
    coxa?: number;
  };
  observacoes?: string;
  lesoesLimitações?: string;
}

export default function EvaluationDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ evaluationId?: string }>();

  const [evaluation, setEvaluation] = useState<EvaluationDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchEvaluationDetail() {
      if (!params.evaluationId) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/professors/evaluations/${params.evaluationId}`);
        setEvaluation(response.data);
      } catch (error) {
        console.error("Erro ao carregar detalhes da avaliação:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvaluationDetail();
  }, [params.evaluationId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF5500" />
        <Text style={styles.loadingText}>A carregar detalhes da avaliação...</Text>
      </SafeAreaView>
    );
  }

  const evalDate = evaluation?.dataAvaliacao || evaluation?.data || "Data não informada";
  const weight = evaluation?.peso ? String(evaluation.peso) : "--";
  const fat = evaluation?.percentualGordura ? String(evaluation.percentualGordura) : "--";
  const leanMass = evaluation?.massaMagra ? String(evaluation.massaMagra) : "--";
  const imc = evaluation?.imc ? String(evaluation.imc) : "--";

  const waist = evaluation?.perímetros?.cintura ? String(evaluation.perímetros.cintura) : "--";
  const hip = evaluation?.perímetros?.quadril ? String(evaluation.perímetros.quadril) : "--";
  const arm = evaluation?.perímetros?.braco ? String(evaluation.perímetros.braco) : "--";
  const thigh = evaluation?.perímetros?.coxa ? String(evaluation.perímetros.coxa) : "--";

  const notes = evaluation?.observacoes || "Nenhuma observação registada.";
  const limitations = evaluation?.lesoesLimitações;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090A" />

      <ScrollView contentContainerStyle={styles.scrollPadding}>
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

        <Text style={styles.headerTitle}>Avaliação Física</Text>
        <Text style={styles.headerSubtitle}>{evalDate}</Text>

        {/* Composição Corporal */}
        <Text style={styles.sectionTitle}>Composição corporal</Text>
        <View style={styles.grid2x2}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Peso</Text>
            <Text style={styles.metricValue}>
              {weight} <Text style={styles.metricUnit}>kg</Text>
            </Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>% Gordura</Text>
            <Text style={styles.metricValue}>
              {fat}<Text style={styles.metricUnit}>%</Text>
            </Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Massa Magra</Text>
            <Text style={styles.metricValue}>
              {leanMass} <Text style={styles.metricUnit}>kg</Text>
            </Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>IMC</Text>
            <Text style={styles.metricValue}>{imc}</Text>
          </View>
        </View>

        {/* Medidas */}
        <Text style={styles.sectionTitle}>Medidas</Text>
        <View style={styles.grid2x2}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Cintura</Text>
            <Text style={styles.metricValue}>
              {waist} <Text style={styles.metricUnit}>cm</Text>
            </Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Quadril</Text>
            <Text style={styles.metricValue}>
              {hip} <Text style={styles.metricUnit}>cm</Text>
            </Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Braço</Text>
            <Text style={styles.metricValue}>
              {arm} <Text style={styles.metricUnit}>cm</Text>
            </Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Coxa</Text>
            <Text style={styles.metricValue}>
              {thigh} <Text style={styles.metricUnit}>cm</Text>
            </Text>
          </View>
        </View>

        {/* Observações */}
        <Text style={styles.sectionTitle}>Observações</Text>
        <View style={styles.cardBox}>
          <Text style={styles.bodyText}>{notes}</Text>
        </View>

        {/* Lesões e Limitações */}
        {limitations && (
          <>
            <Text style={styles.sectionTitle}>Lesões e limitações</Text>
            <View style={styles.cardBox}>
              <View style={styles.orangeBadge}>
                <Text style={styles.orangeBadgeText}>Atenção</Text>
              </View>
              <Text style={[styles.bodyText, { marginTop: 8 }]}>
                {limitations}
              </Text>
            </View>
          </>
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

        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => router.replace("/teacher/evaluations")}
        >
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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#71717A",
    marginTop: 12,
    fontSize: 14,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#71717A",
    marginTop: 2,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
    marginTop: 8,
  },
  grid2x2: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  metricBox: {
    width: "48%",
    backgroundColor: "#18181B",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  metricLabel: {
    fontSize: 12,
    color: "#71717A",
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: "normal",
    color: "#A1A1AA",
  },
  cardBox: {
    backgroundColor: "#18181B",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#27272A",
    marginBottom: 16,
  },
  bodyText: {
    color: "#D4D4D8",
    fontSize: 13,
    lineHeight: 18,
  },
  orangeBadge: {
    backgroundColor: "#FF5500",
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  orangeBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
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