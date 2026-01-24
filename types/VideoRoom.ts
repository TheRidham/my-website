export type RoomStatus = "waiting" | "active" | "ended";

export interface Room {
  status: RoomStatus;
  createdAt: FirebaseFirestore.Timestamp | Date;
  createdBy: string;
}

export interface Participant {
  identity: string;
  joinedAt: FirebaseFirestore.Timestamp | Date;
}
