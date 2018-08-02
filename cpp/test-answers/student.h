#ifndef MY_HEADER
#define MY_HEADER

#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <string>

using namespace std;

enum Schools
{
    MHS,
    AIT,
    UCTECH,
    AAHS,
    APA
};

class students
{
    string firstName;
    string lastName;
    int idNumber;
    int gradeLevel;
    Schools school;
    int QPA;
    bool inAttendence;

    public:
    students(string firstName = "john", string lastName = "doe", int idNumber = 123456, int gradeLevel = 9, Schools school = MHS, int QPA = 93, bool inAttendence = false):
        firstName(firstName), lastName(lastName), idNumber(idNumber), gradeLevel(gradeLevel), school(school), QPA(QPA), inAttendence(inAttendence)
            {

            }

    void print()
    {
        cout << "Student(" << firstName << " " << lastName << ")" << endl;
    }

    void toggleAttendence()
    {
        inAttendence = !inAttendence;
    }

    void compareAgainst(students &student)
    {
        cout << firstName << " has a QPA of " << QPA << "\% and " << student.firstName << " has a QPA of " << QPA << "\%. " << flush;

        if(student.QPA > QPA)
        {
            cout << student.firstName << " is a better student." << endl;
        }
        else if(student.QPA < QPA)
        {
            cout << firstName << " is a better student." << endl;
        }
        else if(student.QPA == QPA)
        {
            cout << firstName << " and " << student.firstName << " are equal students." << endl;
        }
    }

    string getEmailAddress()
    {
        return firstName[0] + lastName + "@ucvts.org";
    }
};

#endif
