#include <iostream>
using namespace std;

class DateClass
{
    private: // also private or protected
        // Same as the attributes for a struct
        int m_month;
        int m_day;
        int m_year;
    public:
        // You can also member functions (methods)
        void print()
        {
            cout << m_month << "/" << m_day << "/" << m_year << endl;
        }

        // Create a Constructor
        // This is run when the object is declared and initialized
        DateClass(int month = 1, int day = 1, int year = 2000)
        {
            m_month = month;
            m_day = day;
            m_year = year;
        }

        int example()
        {
            return m_month;
        }
};

int main()
{
    // Defining an object "today" that belongs to the class "DateClass"
    DateClass today(12, 4, 2017);

    // Run the print method for the today object
    today.print();

    cout << "the month is " << today.example() << endl;

    // Defining an object "myBirthday" that belongs to the class "DateClass"
    DateClass myBirthday(8, 20, 1999);
    myBirthday.print();

    DateClass test(12, 20, 2017);
    test.print();


    return 0;
}