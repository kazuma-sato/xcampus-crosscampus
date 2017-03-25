/*
    Mock data to populate crosscampus database for testing
    by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 21, 2017
    Date last modified Feb 22, 2017
*/

USE crosscampus;

START TRANSACTION;

# Users #
INSERT INTO users(username, firstname, lastname, email)
VALUES ('testy-mctesty', 'Testy', 'McTestie', 'test@test.123');
INSERT INTO users(username, firstname, lastname, email)
VALUES ('tester-testserson', 'Test', 'Testerson', 'test@testing.aaa');

# Institution #
INSERT INTO institution(name, domain)
VALUES ('Tested University', 'test.123');
INSERT INTO institution(name, domain)
VALUES ('Testar College', 'testing.aaa');

# Program #
INSERT INTO program(id, name, startSemester, institution)
VALUES ('T999', 'Bachelor of Testing Arts', CURRENT_DATE, 1);
INSERT INTO program(id, name, startSemester, institution)
VALUES ('T177135', 'Testers and Test Analyst', CURRENT_DATE, 2);

# Student Program #
INSERT INTO student_program(studentID, programID, startSemester, institution)
VALUES (1, 'T999', CURRENT_DATE, 1);
INSERT INTO student_program(studentID, programID, startSemester, institution)
VALUES (2, 'T177135', CURRENT_DATE, 2);

# Course #
INSERT INTO course(id, name, programCode, institution, startSemester)
VALUES ('TEST101', 'Introduction to Tests', 'T999', 1, CURRENT_DATE);
INSERT INTO course(id, name, programCode, institution, startSemester)
VALUES ('TEST200', 'Testing Tests', 'T177135', 2, CURRENT_DATE);

# Entry Type #
INSERT INTO entryType(name)
VALUES ('note');
INSERT INTO entryType(name)
VALUES ('ad');
INSERT INTO entryType(name)
VALUES ('comment');

# Entry #
INSERT INTO entry(author, title, entryType, description, courseID, programCode, institution, startSemester)
VALUES (1, 'Taking a Test', 1, 'This is a note about taking a test.', 'TEST101', 'T999', 1, CURRENT_DATE);
INSERT INTO entry(author, title, entryType, description)
VALUES (2, 'Selling TEST101 Textbook 2nd Edition', 2, 'Good Condition, $200');
INSERT INTO entry(author, parentID, title, entryType, description)
VALUES(1, 2, 'I need this textbook!', 3, 'Is this book still available?');
INSERT INTO entry(author, parentID, title, entryType, description)
VALUES(2, 3, 'Sorry!', 3, 'I just sold it, an hour ago!');

# Rating #
INSERT INTO rating(entryID, userID)
VALUES (1, 2);
INSERT INTO rating(entryID, userID)
VALUES (4, 1);

# Favourite #
INSERT INTO favourite(entryID, userID)
VALUES (1, 2);
INSERT INTO favourite(entryID, userID)
VALUES (3, 2);

# Action Type #
INSERT INTO actionType(name)
VALUES ('commented');
INSERT INTO actionType(name)
VALUES ('rated');
INSERT INTO actionType(name)
VALUES ('flagged');

# Notification #
INSERT INTO notification(entryID, userID, actionID)
VALUES (4, 1, 2);
INSERT INTO notification(entryID, userID, actionID)
VALUES (2, 1, 1);
INSERT INTO notification(entryID, userID, actionID)
VALUES (3, 2, 1);

COMMIT;