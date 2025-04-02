export interface Invoice {
    id: number;
    serviceConnectionNumber: string;  
    user?: { id: number };  
    unitsConsumed: number;
    totalAmount: number;
    billGeneratedDate: string;
    dueDate: string;
    isPaid: string;
  }