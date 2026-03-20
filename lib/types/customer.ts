export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

export type CustomerByPhoneResponse = {
  found: boolean;
  customer: Customer | null;
};

export type CreateCustomerInput = {
  name: string;
  phone: string;
  email?: string | null;
};

export type UpdateCustomerInput = {
  name?: string;
  phone?: string;
  email?: string | null;
};