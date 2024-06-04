import fs from "fs";
import path from "path";

const attendanceFile = path.join(__dirname, "../../attendance.json");

export interface AttendanceRecord {
  [userId: string]: string[];
}

export const loadAttendance = (): AttendanceRecord => {
  if (fs.existsSync(attendanceFile)) {
    const data = fs.readFileSync(attendanceFile, "utf8");
    return JSON.parse(data);
  }
  return {};
};

export const saveAttendance = (attendance: AttendanceRecord) => {
  fs.writeFileSync(attendanceFile, JSON.stringify(attendance, null, 2));
};
