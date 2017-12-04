#include <iostream>
using namespace std;

class DateClass
{
    public:    
        // Same as the attributes for a struct
        int m_month;
        int m_day;
        int m_year;
        int m_century;

        // You can also member functions (methods)
        void print()
        {
            cout << m_month << "/" << m_day << "/" << m_century - 1 << m_year << endl;
        }

        // Create a Constructor
        // This is run when the object is declared and initialized
        DateClass(int month = 1, int day = 1, int year = 00, int century = 21)
        {
            m_month = month;
            m_day = day;
            m_year = year;
            m_century = century;
        }
};

int main()
{
    // Defining an object "today" that belongs to the class "DateClass"
    DateClass today;
    // Setting the attributes manually
    today.m_month = 12;
    today.m_day = 4;
    today.m_year = 17;
    today.m_century = 21;

    // Run the print method for the today object
    today.print();

    // Defining an object "myBirthday" that belongs to the class "DateClass"
    DateClass myBirthday(8, 20, 99, 20);
    myBirthday.print();


    return 0;
}