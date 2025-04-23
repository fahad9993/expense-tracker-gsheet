export const formatBDNumber = (value: number) => {
  if (value < 1000) {
    return value;
  }
  const valueStr = value.toString();
  const lastThree = valueStr.slice(-3); // Get the last 3 digits
  const rest = valueStr.slice(0, -3); // Get the rest of the number

  const formattedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ","); // Insert commas every 2 digits

  return formattedRest + "," + lastThree;
};
