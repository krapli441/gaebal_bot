const fs = require("fs");
const attendanceFile = "./attendance.json";

const loadAttendance = () => {
  if (fs.existsSync(attendanceFile)) {
    const data = fs.readFileSync(attendanceFile, "utf8");
    return JSON.parse(data);
  }
  return {};
};

const saveAttendance = (attendance) => {
  fs.writeFileSync(attendanceFile, JSON.stringify(attendance, null, 2));
};

module.exports = { loadAttendance, saveAttendance };
