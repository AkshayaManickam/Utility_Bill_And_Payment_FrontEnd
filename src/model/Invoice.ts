export interface Invoice {
    id: number;
    serviceConnectionNumber: string;  // ✅ Change this to match API
    user?: { id: number };  // ✅ Optional in case user is missing
    unitsConsumed: number;
    totalAmount: number;
    billGeneratedDate: string;
    dueDate: string;
    isPaid: string;
  }