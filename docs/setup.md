# **COMPSCI 326 - Final Project Setup**

## **Group ETA**

- Jackson Callaghan: *[jackson-callaghan-school](https://github.com/jackson-callaghan-school)*

- John Tan: *[weijohntan](https://github.com/weijohntan)*

- Hans Quiogue: *[hansquiogue](https://github.com/hansquiogue)*

*Note: Jackson also has accidentally made multiple commits from his private account, previously named jackson-callaghan, but now named [tokebe](https://github.com/tokebe). Apologies for the confusion.*

## **Project Euryale Setup Guide**

### *Online Dungeons & Dragons Character Sheet Tool*

[Euryale Website Link](https://pacific-cove-11560.herokuapp.com/)

**All the files in the repository are required to build the project. Please make sure that all files are downloaded and accounted for.**

#### **Download**

Our preferred method of retrieving our project is to use **git to clone** the repository. But other methods, such as [downloading a ZIP file](https://github.com/hansquiogue/cs326-final-eta/archive/master.zip) of our repository can work as well. You may also download via the latest [release](https://github.com/hansquiogue/cs326-final-eta/releases/tag/final).

#### **Requirements**

- [Node.js]( https://nodejs.org/en/)
- [npm]( https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- Database URL and access
   - Contact one of us to gain permission.

#### **Building the Project**

Once all the files are downloaded and the requirements are completed, the project can finally be setup. Here are the setup steps:

1. Change the directory to the path where you placed the Euryale repository.

2. Install the package dependencies for Euryale.
   -  use **npm i** to install the required packages

3. Run the server script to initialize Euryale.
   - Use **npm run start** to start the server
   - *Note: the server will not run without the database URL, access and Express secret key; you will recieve an error!*

4. Load the Euryale webpage.
   - Head to **localhost:8080** on your preferred browser
   - Make sure the ports 8080 are not blocked in your network! Otherwise, you may personally change the port in server/server.js if needed.