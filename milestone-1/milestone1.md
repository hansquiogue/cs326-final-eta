# COMPSCI 326 - Final Project Milestone 1

## Group ETA

---

- Jackson Callaghan: *[jackson-callaghan-school](https://github.com/jackson-callaghan-school)*

- John Tan: *[weijohntan](https://github.com/weijohntan)*

- Hans Quiogue: *[hansquiogue](https://github.com/hansquiogue)*

---

## Project Euryale

### *Online Dungeons & Dragons Character Sheet Tool*

---

## Data Interactions

### **Innovative Idea**

Our group wants to improve the Dungeons and Dragons (D&D) experience by making the character creation sheet portion of the game more convenient to use. Often times, when most D&D players utilize character creation sheets, they'll use a physical copy that's static—the process of creating a character in the game can be incredibly boring and tedious with the game's complex and long rules. Some don't even know that character creation sheet websites exist! There are a lot of available online character creation sheets, but most of them are outdated and complicated. That is why our group is creating this project. Our goal is to create a website that lets D&D users have an automated character sheet that's easy to use and centralized in a space with nice visuals. The website will be convenient for D&D users since they'll be able to plug in their statistics, from backgrounds, skill points, and more, and the website will be able to convert the input into the correct format so that users don't have to manually do any calculations. The website will also enable a greater D&D experience aswell since it will allow a user to import their personal touches to their characters, such as an image of their character. The website will also look modern and be straightforward to use. Overall, the idea of this project is to not make something super innovated, but rather to create a product that will be convenient to a very niche group of individuals and improve their gaming experience.

### **Important Components**

The main functionality of our application is to take in various user inputs from a DnD character sheet. Using a DnD character sheet can be a fairly grueling and complex task—when starting a new game, it might even take hours for a group with beginners to fill everything in the sheet in, and the game hasn't even started! Our website will be able to take in a user's character sheet input and automatically output back the correct calculated statistics and values. For example, a user could input their skills to their character and our website will account for skill bonuses and automatically update the value based on the bonus. Our website will allow creativity for users and enable them to personalize their characters. A feature could be allowing them to upload an image of their character—a normal character sheet won't even have a spot for a user to visualize their character! Our website could also include a dice roller, as the die is a vital part of the game.

### Data Interactions Summary

To summarize, user data interactions will be as follows:

- entering and referencing character statistics on a character sheet
- saving character sheets to the server for later retreival
- exporting character sheets as either PDF or JSON

## Wireframes

![Homepage](img/D&D%20Character%20Creation%20UI%20-%20Homepage.png)

The Euryale homepage, with links to sign in and register

![Sign-in page](img/D&D%20Character%20Creation%20UI%20-%20Signing%20in.png)

The sign-in page

![Registration](img/D&D%20Character%20Creation%20UI%20-%20Registering.png)

Registration

![Character selection](img/D&D%20Character%20Creation%20UI%20-%20Logged%20In%20.png)

This page is used for managing and selecting saved character sheets.

![Character sheet](img/D&D%20Character%20Creation%20UI%20-%20Character%20Sheet%20Page.png)

The real meat of the project - the character sheet. Users are presented with a large number of inputs, mirroring those on official Dungeons and Dragons (5th edition) character sheets. Inputs automatically populate from the saved sheet, with some numbers automatically calculating their own values based on 5e rules. These can be overwritten by the user.

![Inventory popup](img/D&D%20Character%20Creation%20UI%20-%20Inventory%20Pop%20Up.png)

A pop-up screen for detailed inventory management.

![Information](img/D&D%20Character%20Creation%20UI%20-%20Backstory%20Pop%20Up.png)

A pop-up screen for detailed character information.

![Spells](img/D&D%20Character%20Creation%20UI%20-%20Skills%20Pop%20Up.png)

A tabbed pop-up screen to keep track of spells.

## HTML & CSS Implementation

Below are the same screens as the wireframe as currently implemented in HTML and CSS. A lot of polish is still required, however much of this is simply due to the fact that the majority of each page is high functional and at least partially will depend on the in-depth JS implementation. Additionally, due to the nature of how many inputs and how much structure is required for this project, a lot of alignment, spacing, and coloring had to be left for the next milestone.


![Sign-in](img/signin-real.png)

![Registration](img/register-real.png)
