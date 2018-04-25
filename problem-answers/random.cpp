#include <iostream>
#include <ctime>
using namespace std;

int random(int highest, int lowest)
{
    srand(time(0));    

    return rand() % (highest + 1 - lowest) + lowest;
}

int main()
{
    random(100, 1);
    int x = random(100,1);
    
 
    int guess = 0;
    while (guess != x)
    {
        cout << "Guess a number from one to one hundred" << endl;
        cin >> guess;
        if (guess < x)
        {
            cout << "You guessed to low. Try again" << endl;
        }
        else if (guess > x)
        {
            cout << "You guessed to high. Try again" << endl;
        }
    }
    
    cout << "you guessed the right number!!!" << endl;
    return 0;
}


