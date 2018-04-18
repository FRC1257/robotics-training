#include <cstdio>
#include <cstdlib>
#include <iostream>

using namespace std;

enum Item 
{
    HEALTH_POTION,
    TORCH,
    ARROW 
};

void randomAssignItems(Item items[], int size)
{
    for(int i = 0; i < size; i++)
    {
        Item randomItem;
        double random = (double) rand() / RAND_MAX;

        if(random < 0.333) randomItem = HEALTH_POTION;
        else if(random < 0.666) randomItem = TORCH;
        else randomItem = ARROW;

        items[i] = randomItem;
    }
}

void printArrayItem(Item items[], int size)
{
    for(int i = 0; i < size; i++)
    {
        switch (items[i])
        {
            case HEALTH_POTION:
                cout << "Health Potion" << endl;
                break;
            case TORCH:
                cout << "Torches" << endl;
                break;
            case ARROW:
                cout << "Arrows" << endl;
                break;
        }
    }
}

int main()
{
    srand(1000);

    Item items[10];
    randomAssignItems(items, 10);
    
    printArrayItem(items, 10);
    return 0;
}