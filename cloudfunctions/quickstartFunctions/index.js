const getOpenId = require('./getOpenId/index');
const getMiniProgramCode = require('./getMiniProgramCode/index');
const users = require('./users/index');
// 学校
const schools = require('./schools/index');
// 年级
const grades = require('./grades/index');
// 班级
const classes = require('./classes/index');
// 作息时间
const schedules = require('./schedules/index');
// 班级课程
const courses = require('./courses/index');
// 班级课表
const timetables = require('./timetables/index');


// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'getOpenId':
      return await getOpenId.main(event, context);
    case 'getMiniProgramCode':
      return await getMiniProgramCode.main(event, context);
    case 'users':
      return await users.main(event, context);
    case 'schools':
      return await schools.main(event, context);
    case 'grades':
      return await grades.main(event, context);
    case 'classes':
      return await classes.main(event, context);
    case 'schedules':
      return await schedules.main(event, context);
    case 'courses':
      return await courses.main(event, context);
    case 'timetables':
      return await timetables.main(event, context);
    default:
      return {
        errCode: 1,
        msg: `type参数错误，没有成功调用云函数。(${event.type})`
      }
  }
};
