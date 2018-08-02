#include <iostream>
using namespace std;

int main() {
    
    // Variable declarations
    double num1;
    double num2;
    char operation;
    
    cout << "Enter the first number: ";
    cin >> num1;
    cout << "Enter the operation: ";
    cin >> operation;
    cout << "Enter the second number: ";
    cin >> num2;
    
    // Switch statements check the equality of the operation variable
    // For the case of the plus sign, the switch statement is equivalent to:
    //      if(operation == '+')
    //      {
    //          CODE HERE
    //      }
    switch(operation) 
    {
        case '+':
            cout << num1 << " + " << num2 << " = " << num1 + num2;
            break;
        case '-':
            cout << num1 << " - " << num2 << " = " << num1 - num2;
            break;
        case '*':
        case 'x':
            cout << num1 << " * " << num2 << " = " << num1 * num2;
            break;    
        case '/':
            cout << num1 << " / " << num2 << " = " << num1 / num2;
            break;
        default:
            cout << "Please enter a valid operation when   you run the program again." << endl;
            break
    }
    
    return 0;
}
