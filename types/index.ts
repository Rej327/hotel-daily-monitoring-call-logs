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
  acknowledgedBy: string;
  createdAt: number;
  callType: 'guest' | 'res_in' | 'res_out' | 'inq_in' | 'inq_out' | 'booking_confirmation';
}

export type CallLogColumn = keyof Omit<CallLog, 'id' | 'followUp'>;
