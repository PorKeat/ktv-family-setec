interface Customer {
  _id?: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipId?: string | null;
}

interface Membership {
  membershipId: string;
  type: string;
  startDate: string;
  expiryDate: string;
}

export type { Customer, Membership };
