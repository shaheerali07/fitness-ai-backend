const xlsx = require("xlsx");
const path = require("path");

const parseExcelData = () => {
  const filePath = path.join(__dirname, "../data/Frida_Dataset_May2024.xlsx");
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets["Data_Table"];
  return xlsx.utils.sheet_to_json(worksheet);
};

module.exports = parseExcelData;
