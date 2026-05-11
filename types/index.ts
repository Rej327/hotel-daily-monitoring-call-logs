export interface CallLog {
  id: string;
  requestedBy: string;
  lastName: string;
  roomNo: string;
  guestReq: string;
  timeOfRequest: string;
  timeOfDelivered: string;
  remarks: string;
  followUp: number;
  acknowledgedBy: string; // New field
}

export type CallLogColumn = keyof Omit<CallLog, 'id' | 'followUp'>;
