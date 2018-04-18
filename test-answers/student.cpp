#include <iostream>
#include "student.h"

int main()
{
    students zach =  students("zach", "breit", 654321, 12, MHS, 30, false);
    students constance = students("constance", "contraire", 713337, 9, AIT, 99, true);

    zach.print();
    constance.print();

    constance.toggleAttendence();
    zach.compareAgainst(constance);

    cout << zach.getEmailAddress() << endl;
    return 0;
}