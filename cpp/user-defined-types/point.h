#ifndef POINT
#define POINT

#include <math.h>
#include <iostream>

int square(int a) {return a * a;}

class point
{
    private:
        int m_x;
        int m_y;
    public:
        point(int x = 0, int y = 0)
        {
            m_x = x;
            m_y = y;
        }
        void print()
        {
            std::cout << "Point(" << m_x << ", " << m_y << ")\n";
        }
        double distanceTo(point &otherPoint)
        {
            return sqrt(square(m_x - otherPoint.m_x) + square(m_y - otherPoint.m_y));
        }
};

#endif