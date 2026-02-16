export class ChatDto {
  messages: string;
  
  // Optional: History for context awareness
  // Gemini format: { role: 'user' | 'model', parts: [{ text: string }] }
  history?: {
    role: 'user' | 'model';
    parts: { text: string }[];
  }[];
}
