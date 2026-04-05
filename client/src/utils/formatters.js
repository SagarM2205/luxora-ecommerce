export const formatPrice = (price) => {
  const num = Number(price);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(isNaN(num) ? 0 : num);
};


export const getDiscount = (mrp, price) => {
  return Math.round(((mrp - price) / mrp) * 100);
};
