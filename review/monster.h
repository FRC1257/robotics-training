#ifndef BEASTIARY
#define BEASTIARY

#include <iostream>
#include <string>

using namespace std;

#define print(x) cout << x;

enum species // TODO make enum into enum class
{
    ORC,
    ZOMBIE,
    DRAGON,
    GOBLIN,
    FSM,
    CTHULHU
};

string getSpecies(species input)
{
    switch (input) 
    {
        case ORC: return "Orc";
        case ZOMBIE: return "Zombie";
        case DRAGON: return "Dragon";
        case GOBLIN: return "Goblin";
        case FSM: return "Flying Spaghetti Monster";
        case CTHULHU: return "Cthulu";
        default: return "Invalid Type";
   }
}

class monster
{
    private:
        species m_type;
        string m_inventory[10];

        int m_health;
        int m_attackDamage;
        int m_hitRate;
    public:
        monster(species type, int health, int attack, int speed) // TODO add defaults
        {
            m_type = type;
            m_health = health;
            m_attackDamage = attack;
            m_hitRate = speed;
        }
        void addItem(string itemName)
        {
            // TODO
        }
        void printName()
        {
            print("Monster(" << getSpecies(m_type) << ")" << endl);
        }
        void printStatus()
        {
            print("Health: " << m_health << " Attack Damage: " << m_attackDamage);
            print(" Inventory: [");
            for (int i = 0; i < 10; i++)
            {
                if (m_inventory[i].length() > 0)
                {
                    print(m_inventory[i]);
                    if (i > 0) print(", ");
                }
            }
            print("]\n");
        }
        void fight(monster &enemy)
        {
            if (enemy.m_hitRate > m_hitRate)
            {
                m_health -= enemy.m_attackDamage;
                print(getSpecies(enemy.m_type) <<" swung first for " << enemy.m_attackDamage << " damage!\n");
            }
            while (enemy.m_health > 0 && m_health > 0)
            {
                enemy.m_health -= m_attackDamage;
                print(getSpecies(m_type) << " swung for " << m_attackDamage << " damage!\n");
                if (enemy.m_health < 1) break;

                m_health -= enemy.m_attackDamage;
                print(getSpecies(enemy.m_type) << " swung for " << enemy.m_attackDamage << " damage!\n");
                if (m_health < 1) break;
            }
            // TODO drop system
            if (m_health < 0)
            {
                print(getSpecies(m_type) << " lost!");
                return;
            }
            else
            {
                print(getSpecies(enemy.m_type) << " lost!");
                return;
            }
        }
};

#endif