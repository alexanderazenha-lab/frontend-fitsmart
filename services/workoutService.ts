import {
  ExercicioResponseDTO,
  SaveTreinoDTO,
  TreinoResponseDTO,
} from "../types/workout";
import { api } from "./api";

// 1. Busca todos os exercícios do catálogo
export async function getExercises(): Promise<ExercicioResponseDTO[]> {
  const response = await api.get<ExercicioResponseDTO[]>("/exercicios");
  return response.data;
}

// 2. Detalhes de um exercício específico
export async function getExerciseById(
  exerciseId: number,
): Promise<ExercicioResponseDTO> {
  const response = await api.get<ExercicioResponseDTO>(
    `/exercicios/${exerciseId}`,
  );
  return response.data;
}

// 3. Criar rascunho de treino
export async function createWorkoutDraft(
  studentId: number,
  payload: SaveTreinoDTO,
): Promise<TreinoResponseDTO> {
  const response = await api.post<TreinoResponseDTO>(
    `/professors/me/students/${studentId}/workouts`,
    payload,
  );
  return response.data;
}

// 4. Listar treinos do aluno
export async function getStudentWorkouts(
  studentId: number,
): Promise<TreinoResponseDTO[]> {
  const response = await api.get<TreinoResponseDTO[]>(
    `/professors/me/students/${studentId}/workouts`,
  );
  return response.data;
}

// 5. Buscar treino por ID
export async function getWorkoutById(
  studentId: number,
  workoutId: number,
): Promise<TreinoResponseDTO> {
  const response = await api.get<TreinoResponseDTO>(
    `/professors/me/students/${studentId}/workouts/${workoutId}`,
  );
  return response.data;
}

// 6. Atualizar rascunho de treino
export async function updateWorkout(
  studentId: number,
  workoutId: number,
  payload: SaveTreinoDTO,
): Promise<TreinoResponseDTO> {
  const response = await api.put<TreinoResponseDTO>(
    `/professors/me/students/${studentId}/workouts/${workoutId}`,
    payload,
  );
  return response.data;
}

// 7. Publicar treino
export async function publishWorkout(
  studentId: number,
  workoutId: number,
): Promise<TreinoResponseDTO> {
  const response = await api.post<TreinoResponseDTO>(
    `/professors/me/students/${studentId}/workouts/${workoutId}/publish`,
  );
  return response.data;
}
