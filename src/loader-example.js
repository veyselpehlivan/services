const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const path = require('path');
const fetch = require("node-fetch");
const DataLoader = require("dataloader");
const LaunchDarkly = require('launchdarkly-node-server-sdk');


client = LaunchDarkly.init("api-8fc4fb85-ac1f-4645-94de-df414a79ec98");

const classroomAddress = "http://localhost:8081/classroom";
const studentAddress = "http://localhost:8080/student";
const teacherAddress = "http://localhost:8082/teacher";

client.once("ready", () => {
    client.variation("eks-or-lambda", {"key": "user@test.com"}, false,
      (err, showFeature) => {
        if (showFeature) {
          console.log("show feature is true");
        } else {
          console.log("show feature is false");
        }
      });
  });

const resolvers = {
    Query: {
        getStudent: () => {
            return fetch(studentAddress).then(function (response) {
                if (response.ok) {
                    return response.json()
                } else {
                    return Promise.reject(response)
                }
            })
        },

        getClassroom: () => {
            return fetch(classroomAddress).then(function (response) {
                if (response.ok) {
                    return response.json()
                } else {
                    return Promise.reject(response)
                }
            })
        },

        getTeacher: () => {
              return fetch(classroomAddress).then(function (response) {
                  if (response.ok) {
                      return response.json()
                  } else {
                      return Promise.reject(response)
                  }
              })
          },

        getStudentById: (parent, args) => {
            const { id } = args

            return fetch(studentAddress +`/${id}`).then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(response);
                }
            })
        },

        getClassroomById: (parent, args) => {
            const { id } = args

            return fetch(classroomAddress + `/${id}`).then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(response);
                }
            })
        },

        getTeacherById: (parent, args) => {
            const { id } = args

            return fetch(teacherAddress +  `/${id}`).then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(response);
                }
            })
        },

        getClassroomByIds: (parent, args) => {
            const dto = {
                ids: args.ids
            }
            return fetch(classroomAddress + `/find-by-ids`,
                { method: 'POST', body: JSON.stringify(dto), headers: { 'Content-Type': 'application/json' } }
            ).then(res => res.json())
        },

        getTeacherByIds: (parent, args) => {
            const dto = {
                ids: args.ids
            }
            return fetch(teacherAddress + `/find-by-ids`,
                { method: 'POST', body: JSON.stringify(dto), headers: { 'Content-Type': 'application/json' } }
            ).then(res => res.json())
        },

    },

    Student: {
        id: (student, _args) => student.id,
        classroom: (student, _args, { loaderStudent }) => {
            console.log(student.classroomId);
            return loaderStudent.classrooms.load(student.classroomId);
        }
    },

    Classroom: {
        id: (classroom, _args) => classroom.id,
        teacher: (classroom, _args, { loaderClassroom }) => {
            console.log("deneme" + classroom.teacherId);
            return loaderClassroom.teachers.load(classroom.teacherId);
        }
    },

    Teacher: {
        id: (teacher, _args) => teacher.id,
        classroom: (teacher, _args, { loaderTeacher }) => {
            console.log(teacher.classroomId);
            return loaderTeacher.classrooms.load(teacher.classroomId);
        }
    },

    Mutation: {
        createStudent: (parent, args) => {
            const student = {
                id: args.id,
                name: args.name,
                age: args.age,
                email: args.email,
                classroomId: args.classroomId
            }

            return fetch(studentAddress, {
                method: 'POST', body: JSON.stringify(student), headers: { 'Content-Type': 'application/json' }
            }).then(res => res.json())
        },

        updateStudent: (parent, args) => {
            let id = args.id
            return fetch(studentAddress + `/${id}`, {
                method: 'PUT', body: JSON.stringify(args), headers: { 'Content-Type': 'application/json' }
            }).then(res => res.json())
        },

        createClassroom: (parent, args) => {
            const classroom = {
                id: args.id,
                name: args.name,
                code: args.code,
                teacherId: args.teacherId
            }

            return fetch(classroomAddress, {
                method: 'POST', body: JSON.stringify(classroom), headers: { 'Content-Type': 'application/json' }
            }).then(res => res.json())
        },

        updateClassroom: (parent, args) => {
            let id = args.id
            return fetch(classroomAddress + `/${id}`, {
                method: 'PUT', body: JSON.stringify(args), headers: { 'Content-Type': 'application/json' }
            }).then(res => res.json())
        },

        createTeacher: (parent, args) => {
            const teacher = {
                id: args.id,
                firstName: args.firstName,
                lastName: args.lastName
            }

            return fetch(teacherAddress, {
                method: 'POST', body: JSON.stringify(teacher), headers: { 'Content-Type': 'application/json' }
            }).then(res => res.json())
        },

        updateTeacher: (parent, args) => {
            let id = args.id
            console.log(id)
            return fetch(teacherAddress + `/${id}`, {
                method: 'PUT', body: JSON.stringify(args), headers: { 'Content-Type': 'application/json' }
            }).then(res => res.json())
        },

        deleteStudent: (parent, args) => {
            const { id } = args
            return fetch(studentAddress +`/${id}`, { method: 'DELETE' }).then(res => res.json())
        },

        deleteClassroom: (parent, args) => {
            const { id } = args
            return fetch(classroomAddress + `/${id}`, { method: 'DELETE' }).then(res => res.json())
        },

        deleteTeacher: (parent, args) => {
            const { id } = args
            return fetch(teacherAddress + `/${id}`, { method: 'DELETE' }).then(res => res.json())
        },
    },
};

const loaderStudent = {
    classrooms: new DataLoader(async ids => {
        const dto = {
            ids: ids
        }
        const rows = await fetch(classroomAddress+`/find-by-ids`,
            { method: 'POST', body: JSON.stringify(dto), headers: { 'Content-Type': 'application/json' } }
        ).then(res => res.json())

        const lookup = rows.reduce((acc, row) => {
            acc[row.id] = row;
            return acc;
        }, {});

        console.log(lookup);

        return ids.map(id => lookup[id] || null);
    }, { cache: true })
}

const loaderClassroom = {
    teachers: new DataLoader(async ids => {
        const dto = {
            ids: ids
        }
        const rows = await fetch(teacherAddress+`/find-by-ids`,
            { method: 'POST', body: JSON.stringify(dto), headers: { 'Content-Type': 'application/json' } }
        ).then(res => res.json())

        const lookup = rows.reduce((acc, row) => {
            acc[row.id] = row;
            return acc;
        }, {});

        console.log(lookup);

        return ids.map(id => lookup[id] || null);
    }, { cache: false })
}

const loaderTeacher = {
    classrooms: new DataLoader(async ids => {
        const dto = {
            ids: ids
        }
        const rows = await fetch(classroomAddress+`/find-by-ids`,
            { method: 'POST', body: JSON.stringify(dto), headers: { 'Content-Type': 'application/json' } }
        ).then(res => res.json())

        const lookup = rows.reduce((acc, row) => {
            acc[row.id] = row;
            return acc;
        }, {});

        console.log(lookup);

        return ids.map(id => lookup[id] || null);
    } , { cache: false })
}

const server = new ApolloServer({
    typeDefs: fs.readFileSync(
        path.join(__dirname, 'schema.graphql'),
        'utf8'
    ),
    resolvers,
    context: () => {
        return { loaderStudent, loaderClassroom, loaderTeacher };
    }
})

server
    .listen()
    .then(({ url }) =>
        console.log(`Server is running on ${url}`)
    );