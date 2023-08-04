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
const createCollection = require('./createCollection/index');
const selectRecord = require('./selectRecord/index');
const updateRecord = require('./updateRecord/index');
const sumRecord = require('./sumRecord/index');


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
    case 'createCollection':
      return await createCollection.main(event, context);
    case 'selectRecord':
      return await selectRecord.main(event, context);
    case 'updateRecord':
      return await updateRecord.main(event, context);
    case 'sumRecord':
      return await sumRecord.main(event, context);
    default:
      return {
        errCode: 1,
        msg: `type参数错误，没有成功调用云函数。(${event.type})`
      }
  }
};
