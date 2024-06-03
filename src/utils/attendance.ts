import fs from "fs";

const attendanceFile = "./attendance.json";

export const loadAttendance = (): Record<string, string[]> => {
  if (fs.existsSync(attendanceFile)) {
    const data = fs.readFileSync(attendanceFile, "utf8");
    return JSON.parse(data);
  }
  return {};
};

export const saveAttendance = (attendance: Record<string, string[]>) => {
  fs.writeFileSync(attendanceFile, JSON.stringify(attendance, null, 2));
};
