#include "point.h"

int main()
{
    point a(1, 1);
    point b(3, 2);

    std::cout << "a = ";
    a.print();
    std::cout << "b = ";
    b.print();

    std::cout << "Distance = " << a.distanceTo(b) << std::endl;
    return 0;
}