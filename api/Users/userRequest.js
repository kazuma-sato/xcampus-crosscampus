'use strict';
console.log('Loading userRequest.handler');
/*
	Lambda Function for userRequest.handler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Mar 17, 2017
    Date last modified Mar 21, 2017
*/
const mysql = require('mysql');

exports.handler = (event, context) => {

    const connection = mysql.createConnection(event.stageVariables);
	const done = (error, responseBody) => {

        const response = {
            statusCode : error ? '400' : '200',
            body       : error ? error.message : responseBody,
            headers    : { 'Content-Type': 'application/json' }
        };
        console.log("Response : \n" +
            JSON.stringify(response, null, 2)
        );
        response.body = JSON.stringify(response.body);
        connection.end();
        context.succeed(response);
    };
    const parseRequest = (eventParam, request) => {

        Object.keys(eventParam).map(key => {

            if(key.toLowerCase() == "limit") {
                request.limit = eventParam[key].split(",").map(parseInt);
            } else {
                request.body[key] = eventParam[key];
            }
        });
        return request;
    };
    let request = {
        httpMethod : event.httpMethod,
        username   : event.requestContext.identity.user,
        body       : {}
     };
    const resources = event.resource.split("/").filter(Boolean).map(resource => resource.toLowerCase());

    console.log('Received event:', JSON.stringify(event, null, 2));
    if(event.queryStringParameters) {
        request = parseRequest(event.queryStringParameters, request);
    }
    if(event.body) {
        request = parseRequest(JSON.parse(event.body), request);
    }
    if(event.pathParameters) {
        request.body.username = event.pathParameters.username;
        request.type = resources[0];
    }
    if(resources[2]){
        request.type = resources[2];
    }

    console.log('Processed event to request : \n' + JSON.stringify(request,null,2));

    switch(request.httpMethod) {

        case 'DELETE':
            deleteHandler(request, done);
            break;

        case 'GET':
            getHandler(request, done);
            break;

        case 'PUT':
            putHandler(request, done);
            break;

        case 'POST':
            postHandler(request, done);
            break;
        default:
            done(new Error(`Error : Unsupported method "${event.httpMethod}"`));
    }

    function deleteHandler(request, callback) {

        if(!request.type) {
            if(request.username) {
                let query = "UPDATE users SET dateDeleted=NOW() " +
                            "WHERE id=(SELECT id FROM users WHERE username=?);";
                console.log(
                    connection.query(query, request.username, callback).sql
                );
            } else {
                callback(new Error("Error : Missing username. Required to delete user."));
            }
        } else if(request.type == "entry") {
            callback(new Error(`Error : Unsupported method "${event.httpMethod}"`));
        } else {
            let query = mysql.format("DELETE FROM ?? ", request.type);
            query += mysql.format("WHERE userID=(SELECT id FROM users WHERE username=?) "
                    , request.username);
            query += mysql.format("AND entryID=? ",request.body.entryId);
            if(request.type == "notification") {
                query += mysql.format("AND actionID=(SELECT id FROM actionType WHERE name=?)",
                request.body.actionName)
            }
            console.log(
                connection.query(query,callback).sql
            );
        }
    }

    function getHandler(request, callback) {

        let query;

        switch(request.type) {

            case("user") :
                query = "SELECT username, firstname, lastname, dateCreated "
                      + "FROM users ";
                query = whereClauseParse(request);
                selectUsers(query)
                .then(prepEntriesArray)
                .then(users =>
                    Promise.all(
                        users.map(user =>
                                selectAllFromEntries(user)
                                .then(selectFromProgram)
                                .then(selectCoursesFromEntry)
                        )
                    )
                ).then(users => callback(null, users))
                .catch(callback);
                break;

            case("entry") :

                query +=
                selectUsers(
                    mysql.format(query,request.body.username)
                ).then(prepEntriesArray)
                .then(array =>
                    Promise.resolve(array[0])
                ).then(selectAllFromEntries)
                .then(user =>
                    callback(null, user.entry)
                ).catch(callback);
                break;
            case("favouite") :
                query = "SELECT users.username, favourite.entryID FROM favourite " +
                            "LEFT JOIN users ON favourite.userID=users.id " +
                            "WHERE favourite.entryID=? AND " +
                            "userID=(SELECT id FROM users WHERE username=?) AND " +
                            "(SELECT flaggedBy FROM entry WHERE id=? AND flaggedBy IS NULL);"
                new Promise((resolve, reject) =>
                    console.log(
                        connection.query(query,
                            [request.entry.id,  request.username, request.entry.id],
                            (error, result) => {
                                if(error) reject(error);
                                return resolve(result);
                            }
                        ).sql
                    )
                ).then(result => callback(null,result)
                ).catch(callback);
                break;

            case("rating") :

                const ratedBy =
                        "SELECT entry.id AS entry, users.username AS ratedBy FROM rating "+
                        "LEFT JOIN entry ON entryID=entry.id " +
                        "LEFT JOIN users ON userID=users.id " +
                        "WHERE entry.author=" +
                        "(SELECT id FROM users WHERE username=? " +
                            "AND dateDeleted IS NULL) " +
                        "AND flaggedBy IS NULL ";
                const entriesRated =
                        "SELECT entry.id AS entry, users.username AS ratedBy FROM rating "+
                        "LEFT JOIN entry ON entryID=entry.id " +
                        "LEFT JOIN users ON userID=users.id " +
                        "WHERE rating.userID=" +
                        "(SELECT id FROM users WHERE username=? " +
                            "AND dateDeleted IS NULL) " +
                        "AND flaggedBy IS NULL ";

                Promise.all([
                    promisedQuery(ratedBy,request.body.username),
                    promisedQuery(entriesRated,request.body.username)
                ]).then(result => callback(null,result)
                ).catch(callback);

                break;

            default :
                query = "SELECT username, firstname, lastname, dateCreated "
                      + "FROM users ";
                query = whereClauseParse(request);
                selectUsers(query)
                .then(prepEntriesArray)
                .then(users =>
                    Promise.all(
                        users.map(user =>
                                selectIdFromEntries(user)
                                .then(selectFromProgram)
                                .then(selectCoursesFromEntry)
                    )
                )).then(users => callback(null, users))
                .catch(callback);
        }

        function whereClauseParse(request) {

            let clause = ""

            if(request.body){
                if(request.body.username) {
                    clause = mysql.format(clause + "username=? AND ", request.body.username);
                } else if(request.body.id) {
                    clause = mysql.format(clause + "id=? AND ", request.body.id);
                } else {
                    Object.keys(request.body).forEach(key => {
                            clause += "??=? AND ";
                            clause = mysql.format(clause, [key, request.body[key]]);
                    });
                }
            } else if(request.username) {
                clause = mysql.format(clause + "username=? AND ", request.username);
            }

            clause += "dateDeleted IS NULL ";
            clause += "ORDER BY username ";
            if(request.limit) {
                clause += "LIMIT ";
                clause += (request.limit.length == 1) ? "?" : "?,?";
                clause = mysql.format(clause, request.limit);
            }
            clause += ";";
            return clause;
        }
        function promisedQuery(query, values){

            return new Promise((resolve, reject) =>
                console.log(
                    connection.query(query,values,
                        (error, result) => {
                            if(error) reject(error);
                            return resolve(result);
                        }
                    ).sql
                )
            )
        }

        function selectUsers(request) {

            query = "SELECT id, username FROM users " +
                        "WHERE ";
            query += whereClauseParse(request);

            return new Promise(
                (resolve, reject) =>

                    console.log(
                        connection.query(query,
                            (error, result) => {

                                if(error) reject(error);
                                if(!result.length)
                                    reject(new Error("Error : No users found!"));
                                return resolve(result);
                            }
                        ).sql
                    )
            );
        }

        function prepEntriesArray(users) {

            const query = "SELECT name FROM entryType;";
            return new Promise((resolve, reject) =>

                console.log(
                    connection.query(query,
                    (error, entryTypes) => {

                        if(error) reject(error);
                        users = users.map(user => {

                            let entries = {};
                            entryTypes.forEach(entryType => {
                                entries[entryType.name] = [];
                            });
                            user.entry = entries;
                            return user;
                        });
                        return resolve(users);
                    }
                ).sql)
            );
        }

        function selectIdFromEntries(user) {

            const query =   "SELECT entry.id AS id, entryType.name AS type " +
                            "FROM entry " +
                            "LEFT JOIN entryType " +
                                "ON entry.entryType=entryType.id " +
                            "WHERE entry.author=(SELECT id FROM users WHERE username=?) " +
                                "AND flaggedBy IS NULL;";

            return new Promise((resolve, reject) =>

                console.log(
                    connection.query(query, user.username,
                        (error, entries) => {

                            if(error) reject(error);
                            entries.forEach(entry =>
                                user.entry[entry.type].push(entry.id)
                            );
                            return resolve(user);
                        }
                    ).sql
                )
            );
        }

        function selectAllFromEntries(user) {

            const query =   "SELECT \r\n\tentry.*,\r\n\tparenttype,\r\n\tparenttitle,\r\n\tparentrating,\r\n\tparentdescription,\r\n\tparentdateCreated,\r\n\tparentdateModified,\r\n\tparentcourse,\r\n\tparentprogram,\r\n\tparentstartSemester,\r\n\tparentinstitution\n" +
                            "FROM (\r\n\tSELECT \r\n\t\ta.id,\r\n\t\tentryType.name AS type,\r\n\t\ta.title,\r\n\t\tCOUNT(rating.userID) AS rating,\r\n\t\ta.description,\r\n\t\ta.parentId,\r\n\t\ta.dateCreated,a.dateModified,\r\n\t\tcourse.name AS course,\r\n\t\tprogram.name AS program,\r\n\t\ta.startSemester,institution.name AS institution \r\n\t" +
                                "FROM entry a\r\n\t" +
                                    "LEFT JOIN entryType \r\n\t\tON entryType=entryType.id\r\n\t" +
                                    "LEFT JOIN rating \r\n\t\tON a.id=rating.entryID\r\n\t" +
                                    "LEFT JOIN course \r\n\t\tON courseID=course.id \r\n\t\tAND a.startSemester=course.startSemester \r\n\t\tAND a.programCode=course.programCode \r\n\t\tAND a.institution=course.institution \r\n\t" +
                                    "LEFT JOIN program \r\n\t\tON course.programCode=program.id \r\n\t" +
                                    "LEFT JOIN institution \r\n\t\tON course.institution=institution.id\r\n\t" +
                                "WHERE author=(SELECT id FROM users WHERE username=?)\r\n\t\tAND flaggedBy IS NULL\n\t" +
                                "GROUP BY a.id,\r\n\program.name\n\t" +
                                ") entry\r\n" +
                            "LEFT JOIN (\r\n\tSELECT \r\n\t\tb.id,\r\n\t\tentryType.name AS parenttype,\r\n\t\tb.title AS parenttitle,\r\n\t\tCOUNT(rating.userID) AS parentrating,\r\n\t\tb.description AS parentdescription,\r\n\t\tb.dateCreated AS parentdateCreated,\r\n\t\tb.dateModified AS parentdateModified,\r\n\t\tcourse.name AS parentcourse,\r\n\t\tprogram.name AS parentprogram,\r\n\t\tb.startSemester parentstartSemester,\r\n\t\tinstitution.name AS parentinstitution \r\n\t" +
                                "FROM entry b\r\n\t" +
                                    "LEFT JOIN entryType \r\n\t\tON entryType=entryType.id\r\n\t" +
                                    "LEFT JOIN rating \r\n\t\tON b.id=rating.entryID\r\n\t" +
                                    "LEFT JOIN course \r\n\t\tON courseID=course.id \r\n\t\tAND b.startSemester=course.startSemester \r\n\t\tAND b.programCode=course.programCode \r\n\t\tAND b.institution=course.institution \r\n\t" +
                                    "LEFT JOIN program \r\n\t\tON course.programCode=program.id \r\n\t" +
                                    "LEFT JOIN institution \r\n\t\tON course.institution=institution.id\r\n\t" +
                                "GROUP BY b.id,\r\n\program.name\n\t" +
                            ") parent \r\n\t" +
                                "ON entry.parentID=parent.id;";

            return new Promise((resolve, reject) =>

                console.log(
                    connection.query(query, user.username,
                        (error, results) => {

                            if(error) reject(error);
                            results.forEach(row => {

                                let entry = {};
                                let parent = {};
                                Object.keys(row).forEach(column => {
                                    if(row[column] && column != "type"){
                                        if(column.includes("parent")) {
                                            parent[column.substring(6)] = row[column];
                                        } else {
                                        entry[column] = row[column];
                                        }
                                    }
                                })
                                if(row.type = "comment") entry.parent = parent;
                                user.entry[row.type].push(entry);
                            });
                            return resolve(user);
                        }
                ).sql)
            )
        }

        function selectFromProgram(user) {

            const query =   "SELECT program.name, student_program.startSemester, " +
                                "institution.name AS institution " +
                            "FROM student_program " +
                            "LEFT JOIN program " +
                                "ON student_program.programID=program.id " +
                            "LEFT JOIN institution " +
                                "ON student_program.institution=institution.id " +
                            "WHERE student_program.studentID=(SELECT id FROM users WHERE username=?);";

            return new Promise((resolve, reject) =>

                console.log(
                    connection.query( query, user.username,
                    (error, programs) => {

                        if(error) reject(error);
                        if(programs.length) user.programs = programs;
                        return resolve(user);
                    }
                ).sql)
            );
        }

        function selectCoursesFromEntry(user) {

            const query =   "SELECT DISTINCT "+
                                "course.name, program.name AS program, " +
                                "course.startSemester, institution.name " +
                            "FROM entry " +
                            "LEFT JOIN course " +
                                "ON entry.courseID=course.id " +
                                "AND entry.startSemester=course.startSemester " +
                                "AND entry.programCode=course.programCode " +
                                "AND entry.institution=course.institution " +
                            "LEFT JOIN program " +
                                "ON course.programCode=program.id " +
                            "LEFT JOIN institution " +
                                "ON program.institution=institution.id " +
                            "WHERE entry.author=(SELECT id FROM users WHERE username=?) " +
                                "AND course.name IS NOT NULL "
                                "AND entry.flaggedBy IS NULL;";

            return new Promise((resolve, reject) =>

                console.log(
                    connection.query(query, user.username,
                        (error, results) => {

                            let courses = [];
                            if(error) reject(error);
                            results.forEach(result => {

                                let course = {};
                                let empty = true;
                                Object.keys(result).forEach(key => {

                                    if(result[key]) {
                                        course[key] = result[key];
                                        empty = false;
                                    }
                                });
                                if(!empty && course.name) courses.push(course);
                            });
                            if(courses.length) user.courses = courses;
                            return resolve(user);
                        }
                    ).sql
                )
            );
        }
    }

    function putHandler(entry, username) {

        if(!username) {
            done(new Error("Error : You must be logged to edit an entry!"));
        }
        new Promise((resolve,reject) =>

            console.log(
                connection.query(
                    "SELECT (SELECT id FROM users WHERE username=?)="+
                    "(SELECT author FROM entry WHERE id=?) AS isValid",
                    [username, entry.id],
                    (error, result) => {

                        if(error) reject(error);
                        if(result) {
                            if(result[0].isValid) {
                                return resolve(entry);
                            } else {
                                reject(new Error("Error : The requested user cannot edit this entry!"));
                            }
                        } else {
                            reject(new Error("Error : Cannot find an ID# for this user"));
                        }
                    }
                ).sql
            )
        ).then(entry => {

           return new Promise((resolve,reject) =>

                console.log(
                    connection.query(
                        'UPDATE entry SET ? WHERE id=?',
                        [ entry, entry.id ],
                        (error,result) => {

                            if(error) reject(error);
                            return resolve(result);
                        }
                    ).sql
                )
            );
        }).then(result => done(null,result)
        ).catch(error => done(error));
    }

    function postHandler() {

        const entry = request.entry;

        if(!entry.parentId) {
            if(entry.entryType == "comment"){
                done(new Error("Error : Comments require a parentID."));
            }
        } else {
            entry.entryType = "comment";
        }

       new Promise((resolve, reject) =>

            console.log(
                connection.query(
                    'SELECT * FROM entryType WHERE name=?;',
                    entry.entryType,
                    (error, result) => {
                        if(error) return reject(error);
                        request.entryType = result[0];
                        request.entry.entryType = result[0].id;
                        resolve(request);
                    }
                ).sql
            )
        ).then(request => {

            return new Promise((resolve, reject) =>

                console.log(
                    connection.query(
                        "INSERT INTO entry SET ?, `author`=" +
                        "(SELECT id FROM users WHERE username=?);",
                        [request.entry, request.username],
                        (error,result) => {
                            if(error) return reject(error);
                            request.insertEntryResult = result;
                            resolve(request);
                        }
                    ).sql
                )
            );
        }).then(request => {

            return new Promise((resolve,reject) => {

                if(request.entryType.name == "comment") {
                    console.log(
                        connection.query(
                            'INSERT INTO notification(entryID, userID, actionID)' +
                            'VALUES (?,(SELECT author FROM entry WHERE id=?),(SELECT id FROM actionType WHERE name=?))',
                            [ request.insertEntryResult.insertId,
                              request.entry.parentId,
                              "commented" ],
                            (error, result) => {

                                if(error) return reject(error);
                                request.insertNotificationResults = result;
                                resolve(request);
                            }
                        ).sql
                    );
                } else {
                    resolve(request);
                }
            });
        }).then(response => done(null, response)
        ).catch(error => done(error));
    }
};