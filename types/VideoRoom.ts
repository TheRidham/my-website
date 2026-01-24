export type RoomStatus = "waiting" | "active" | "ended";

export interface Room {
  status: RoomStatus;
  createdAt: FirebaseFirestore.Timestamp | Date;
  createdBy: string;
  userId: string; // The user initiating the video call
  advisorId: string; // The advisor the user is connecting to
  closedAt?: FirebaseFirestore.Timestamp | Date; // When the call ended
  payment?: {
    amount: number;
    status: 'pending' | 'success' | 'failed';
    transactionId?: string;
    method?: 'wallet' | 'card' | 'upi' | "dodo";
    processedAt?: FirebaseFirestore.Timestamp | Date;
  };
}

export interface Participant {
  identity: string;
  joinedAt: FirebaseFirestore.Timestamp | Date;
}
