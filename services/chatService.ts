import api from "./api";

export interface MessageDTO {
  id: number;
  remetenteId: number;
  destinatarioId: number;
  texto: string;
  dataEnvio: string;
  tipoRemetente: "ALUNO" | "PROFESSOR";
  lida?: boolean;
}

export interface SendMessagePayload {
  destinatarioId: number;
  texto: string;
}

/**
  Busca o histórico de mensagens trocadas com um usuário específico.
  @param userId ID do aluno ou do professor com quem se está conversando
 */
export async function getChatHistory(userId: number): Promise<MessageDTO[]> {
  try {
    const response = await api.get(`/chats/messages/user/${userId}`);
    return Array.isArray(response.data) ? response.data : response.data?.content || [];
  } catch (error) {
    console.error("Erro ao buscar histórico de mensagens:", error);
    return [];
  }
}

/**
  Envia uma nova mensagem para o backend.
  @param payload Objeto contendo o destinatarioId e o texto da mensagem
 */
export async function sendMessage(payload: SendMessagePayload): Promise<MessageDTO | null> {
  try {
    const response = await api.post("/chats/messages", payload);
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return null;
  }
}

/**
  Marca todas as mensagens não lidas de uma conversa como lidas.
  @param senderId ID do usuário que enviou as mensagens
 */
export async function markMessagesAsRead(senderId: number): Promise<void> {
  try {
    await api.patch(`/chats/messages/user/${senderId}/read`);
  } catch (error) {
    console.error("Erro ao marcar mensagens como lidas:", error);
  }
}