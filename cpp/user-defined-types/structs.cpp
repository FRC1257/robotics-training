#include <iostream>
using namespace std;

// Declare an RGB structure that can keep track of color values
struct RGB
{
    // Start each color channel with a value of 0
    int red;
    int green;
    int blue;
};

struct Student
{
    string first;
    string last;
    int grade;
    double gpa;
};

void printEmail(Student &dude);

int main()
{
    // This is inefficient
    int r = 0;
    int g = 0;
    int b = 0;

    // This is better
    // This defines an RGB struct named "yellow"
    RGB yellow;
    yellow.red = 255;
    yellow.green = 255;

    // Defines a Student struct named "Student1"
    // Only valid in C++11
    // Sets
    Student bestStudent = {"Zach", "Breit", 12, -1};
    printEmail(bestStudent);
    return 0;
}

void printEmail(Student &dude)
{
    cout << dude.first[0] << dude.last << "@ucvts.org\n";
}