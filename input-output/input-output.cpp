#include <iostream>
using namespace std;

int main()
{
    cout << "What's your favorite number? " << endl;
    
    int favoriteNum;
    cin >> favoriteNum;
    if (favoriteNum < 4)
    {
        cout << "small number" << endl;
    }
    if (favoriteNum < 20)
    {
        cout << "medium number" << endl;
    }
    else
    {
        cout << "You would like to count to " << favoriteNum << '.' << endl;
    }
}
