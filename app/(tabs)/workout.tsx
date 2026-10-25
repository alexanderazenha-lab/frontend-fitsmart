import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../../contexts/AuthContext";
import * as workoutService from "../../services/workoutService";
import { ItemTreinoResponseDTO, TreinoResponseDTO } from "../../types/workout";

// Estendemos o DTO original apenas para controlar a marcação visual de "concluído" na UI
interface LocalItemTreino extends ItemTreinoResponseDTO {
  concluido: boolean;
}

export default function WorkoutScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [workoutData, setWorkoutData] = useState<TreinoResponseDTO | null>(null);
  const [exercises, setExercises] = useState<LocalItemTreino[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega o treino ativo do aluno a partir do ID do utilizador autenticado
  const fetchActiveWorkout = async () => {
    try {
      setError(null);

      if (!user?.id) return;

      const workouts = await workoutService.getStudentWorkouts(user.id);

      // Pega o treino com status "ATIVO" ou o primeiro da lista
      const activeWorkout = Array.isArray(workouts)
        ? workouts.find((w) => w.status === "ATIVO") || workouts[0]
        : workouts;

      if (!activeWorkout) {
        setWorkoutData(null);
        setExercises([]);
        return;
      }

      setWorkoutData(activeWorkout);

      // Mapeia os itens do treino adicionando 'concluido: false' por padrão
      const itensComEstado: LocalItemTreino[] = (activeWorkout.itens || []).map(
        (item) => ({
          ...item,
          concluido: false,
        })
      );

      setExercises(itensComEstado);
    } catch (err: any) {
      console.error("Erro ao carregar treino:", err);
      setError("Não foi possível carregar o teu treino ativo.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchActiveWorkout();
    }
  }, [user?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchActiveWorkout();
  }, [user?.id]);

  // Alterna a marcação visual do exercício no app
  const toggleExercise = (id: number) => {
    setExercises((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, concluido: !item.concluido } : item
      )
    );
  };

  const completedCount = exercises.filter((ex) => ex.concluido).length;
  const progressPercentage =
    exercises.length > 0
      ? Math.round((completedCount / exercises.length) * 100)
      : 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF5500" />
        <Text style={styles.loadingText}>A carregar o teu treino...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090A" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF5500"
          />
        }
      >
        {/* Cabeçalho */}
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Meu Treino</Text>
            <Text style={styles.headerSubtitle}>
              {workoutData?.observacoes || "Treino do dia"}
            </Text>
          </View>

          {/* Progresso Circular */}
          <View style={styles.circularProgressContainer}>
            <View style={styles.circularProgressBorder}>
              <Text style={styles.circularProgressText}>
                {progressPercentage}%
              </Text>
            </View>
          </View>
        </View>

        {/* Estado com Erro ou Vazio */}
        {error ? (
          <View style={styles.emptyStateContainer}>
            <Feather name="alert-circle" size={40} color="#EF4444" />
            <Text style={styles.emptyStateTitle}>Ops!</Text>
            <Text style={styles.emptyStateSubtitle}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchActiveWorkout}>
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : exercises.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Feather name="activity" size={40} color="#71717A" />
            <Text style={styles.emptyStateTitle}>Sem treinos atribuídos</Text>
            <Text style={styles.emptyStateSubtitle}>
              O teu Personal Trainer ainda não registou um treino ativo para ti.
            </Text>
          </View>
        ) : (
          /* Lista de Exercícios */
          <View style={{ marginTop: 20 }}>
            {exercises.map((item) => {
              // Imagem placeholder padrão para o exercício
              const imageUrl =
                "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=300&auto=format&fit=crop";

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.exerciseCard,
                    item.concluido && styles.exerciseCardCompleted,
                  ]}
                  onPress={() => toggleExercise(item.id)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: imageUrl }} style={styles.exerciseImage} />

                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseTitle}>
                      {item.exercicioNome || `Exercício #${item.exercicioId}`}
                    </Text>
                    <View style={styles.exerciseMetaRow}>
                      <Text style={styles.exerciseMetaText}>
                        {item.series}x {item.repeticoes} ({item.carga}kg)
                      </Text>
                      <View style={styles.metaDot} />
                      <Feather name="clock" size={12} color="#A1A1AA" />
                      <Text style={styles.exerciseMetaText}>
                        {" "}{item.tempoSegundos}s
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.checkCircle,
                      item.concluido && styles.checkCircleChecked,
                    ]}
                  >
                    {item.concluido && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {exercises.length > 0 && (
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 24 }]}
            onPress={() =>
              router.push({
                pathname: "/explore",
                params: { treinoId: workoutData?.id },
              })
            }
          >
            <Text style={styles.primaryButtonText}>Finalizar Treino</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#71717A",
    marginTop: 4,
  },
  circularProgressContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 3,
    backgroundColor: "#27272A",
    alignItems: "center",
    justifyContent: "center",
  },
  circularProgressBorder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: "#FF5500",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#09090A",
  },
  circularProgressText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  exerciseCard: {
    flexDirection: "row",
    backgroundColor: "#18181B",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  exerciseCardCompleted: {
    borderColor: "#3F3F46",
    opacity: 0.85,
  },
  exerciseImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#27272A",
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  exerciseTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  exerciseMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseMetaText: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#71717A",
    marginHorizontal: 8,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#52525B",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  checkCircleChecked: {
    backgroundColor: "#FF5500",
    borderColor: "#FF5500",
  },
  primaryButton: {
    backgroundColor: "#FF5500",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptyStateSubtitle: {
    color: "#71717A",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#27272A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FF5500",
    fontWeight: "600",
  },
});