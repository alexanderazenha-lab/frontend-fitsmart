import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
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
  TouchableOpacity,
  View,
} from "react-native";

// Ajuste para subir dois níveis (../../)
import api from "../../services/api";
import { ExercicioResponseDTO } from "../../types/workout";

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const [exercise, setExercise] = useState<ExercicioResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExerciseDetail() {
      if (!params.id) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const response = await api.get<ExercicioResponseDTO>(`/exercicios/${params.id}`);
        setExercise(response.data);
      } catch (err: any) {
        console.error("Erro ao carregar detalhes do exercício:", err);
        setError("Não foi possível carregar os detalhes do exercício.");
      } finally {
        setLoading(false);
      }
    }

    fetchExerciseDetail();
  }, [params.id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF5500" />
        <Text style={styles.loadingText}>A carregar exercício...</Text>
      </SafeAreaView>
    );
  }

  // Fallbacks com dados padrão caso o DTO não possua alguns campos opcionais
  const exerciseName = exercise?.nome || "Detalhes do Exercício";
  const difficulty = exercise?.dificuldade || "Intermediário";
  const objective = exercise?.objetivo || "Hipertrofia e Força";
  const description =
    exercise?.descricao ||
    "Execute o movimento de forma controlada mantendo a postura correta.";

  const actions: string[] = exercise?.acoesArticulares || [
    "Mantenha os pés firmes no chão.",
    "Controle a fase concêntrica e excêntrica.",
  ];

  const restrictions: string[] = exercise?.restricoesLesoes ||
    exercise?.restricoesLimitacoes || [
      "Evite afastar excessivamente os cotovelos para proteger as articulações dos ombros.",
    ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090A" />

      <ScrollView contentContainerStyle={styles.scrollPadding}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Thumbnail / Demonstrativo em Vídeo */}
        <View style={styles.videoContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
            }}
            style={styles.videoCover}
          />
          <TouchableOpacity style={styles.playOverlay}>
            <Ionicons name="play-circle" size={54} color="#FF5500" />
          </TouchableOpacity>
        </View>

        {/* Título e Músculo Alvo */}
        <Text style={styles.exerciseTitle}>{exerciseName}</Text>
        <View style={styles.tagRow}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{objective}</Text>
          </View>
          <View style={[styles.tagBadge, styles.secondaryBadge]}>
            <Text style={styles.secondaryTagText}>Nível: {difficulty}</Text>
          </View>
        </View>

        {/* Descrição do Exercício */}
        <Text style={styles.sectionTitle}>Orientação Técnica</Text>
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        {/* Ações / Passo a Passo com Tipagem Explícita */}
        <Text style={styles.sectionTitle}>Como executar</Text>
        {actions.map((step: string, index: number) => (
          <View key={index} style={styles.stepCard}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}

        {/* Cuidados e Restrições com Tipagem Explícita */}
        {restrictions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Cuidados e Restrições</Text>
            {restrictions.map((item: string, index: number) => (
              <View key={index} style={styles.warningBox}>
                <Feather
                  name="alert-circle"
                  size={18}
                  color="#EF4444"
                  style={{ marginTop: 2 }}
                />
                <Text style={styles.warningText}>{item}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Tab Bar Inferior Aluno */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/(tabs)/workout")}
        >
          <MaterialCommunityIcons name="dumbbell" size={20} color="#FF5500" />
          <Text style={styles.tabLabelActive}>Treino</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/(tabs)/explore")}
        >
          <Feather name="message-square" size={20} color="#71717A" />
          <Text style={styles.tabLabelInactive}>Feedback</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <FontAwesome5 name="user-alt" size={18} color="#71717A" />
          <Text style={styles.tabLabelInactive}>Perfil</Text>
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
    color: "#A1A1AA",
    marginTop: 12,
    fontSize: 14,
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
  videoContainer: {
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    marginBottom: 20,
  },
  videoCover: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  tagBadge: {
    backgroundColor: "rgba(255, 85, 0, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    color: "#FF5500",
    fontSize: 12,
    fontWeight: "bold",
  },
  secondaryBadge: {
    backgroundColor: "#27272A",
  },
  secondaryTagText: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
    marginTop: 12,
  },
  descriptionCard: {
    backgroundColor: "#18181B",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#27272A",
    marginBottom: 8,
  },
  descriptionText: {
    color: "#D4D4D8",
    fontSize: 13,
    lineHeight: 20,
  },
  stepCard: {
    flexDirection: "row",
    backgroundColor: "#18181B",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#27272A",
    marginBottom: 10,
    alignItems: "center",
    gap: 12,
  },
  stepNumber: {
    color: "#FF5500",
    fontSize: 16,
    fontWeight: "bold",
    width: 20,
    textAlign: "center",
  },
  stepText: {
    flex: 1,
    color: "#D4D4D8",
    fontSize: 13,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#1F1315",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#451A1D",
    marginBottom: 10,
    gap: 10,
  },
  warningText: {
    flex: 1,
    color: "#FCA5A5",
    fontSize: 12,
    lineHeight: 18,
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