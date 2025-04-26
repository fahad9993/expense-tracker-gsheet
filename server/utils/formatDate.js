const formatSheetDate = (sheetDate) => {
  const d = new Date(sheetDate);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};

module.exports = { formatSheetDate };
