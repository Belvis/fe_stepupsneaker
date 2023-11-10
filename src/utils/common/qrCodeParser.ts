import { QRCodeData } from "../../interfaces";

export function parseQRCodeResult(qrCodeResult: string): QRCodeData {
  const data = qrCodeResult.split("|");

  return {
    cicNumber: data[0].trim(),
    idcNumber: data[1].trim(),
    fullName: data[2].trim(),
    dob: formatDate(data[3].trim()),
    gender: mapGenderToEnglish(data[4].trim()),
    address: data[5].trim(),
    issueDate: formatDate(data[6].trim()),
  };
}

function formatDate(dateString: string): string {
  const parts = dateString.match(/(\d{2})(\d{2})(\d{4})/);
  if (parts) {
    const day = parts[1];
    const month = parts[2];
    const year = parts[3];
    return `${year}-${month}-${day}`;
  }
  return "";
}

function mapGenderToEnglish(gender: string): string {
  const genderMap: Record<string, string> = {
    Nam: "Male",
    Nữ: "Female",
    Khác: "Other",
  };

  return genderMap[gender] || gender;
}
