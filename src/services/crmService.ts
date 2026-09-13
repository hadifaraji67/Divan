export interface CustomerProfile {
  id: number;
  name: string;
  phone: string;
  totalSpent: number;
  loyaltyPoints: number;
  group: 'regular' | 'silver' | 'gold' | 'vip';
}

export const calculateLoyaltyGroup = (totalSpent: number): 'regular' | 'silver' | 'gold' | 'vip' => {
  if (totalSpent >= 50000000) return 'vip';
  if (totalSpent >= 20000000) return 'gold';
  if (totalSpent >= 5000000) return 'silver';
  return 'regular';
};

export const updateCustomerPoints = (customer: CustomerProfile, invoiceAmount: number): CustomerProfile => {
  const addedPoints = Math.floor(invoiceAmount / 100000); // هر ۱۰۰ هزار تومان ۱ امتیاز
  const newTotalSpent = customer.totalSpent + invoiceAmount;
  return {
    ...customer,
    totalSpent: newTotalSpent,
    loyaltyPoints: customer.loyaltyPoints + addedPoints,
    group: calculateLoyaltyGroup(newTotalSpent)
  };
};
