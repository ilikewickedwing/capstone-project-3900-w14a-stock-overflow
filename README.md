# capstone-project-3900-w14a-stock-overflow

## 1 Setup on Virtual Machine
This setup is for Lubuntu. You can change it to suit your desktop environment. 
###	1.1	Install Yarn and NodeJS
1. Clone this repository
```
git clone git@github.com:unsw-cse-comp3900-9900-21T3/capstone-project-3900-w14a-stock-overflow.git
```
2.	Install latest version of yarn and node 14. On the virtual machine you can simply run the following script from within the repository:
```
sudo install.sh
```
During the installation, it might prompt you and ask are you sure you want to install Node and yarn, in which you would type **'Y'** in response.
### 1.2	Setup Backend Server

1.  Change the terminal to **\backend** directory

```
cd backend/
```

2.  From here install all the packages that are used eg: Express... and so on

```
yarn install
```

3.  You have now set up your environment
### 1.3	Setup Frontend
1) Change the terminal to **\frontend** directory
```
cd frontend/
```

2) From here install all the packages that are used eg: React... and so on

```
yarn install
```

3) You have now set up your frontend environment

## 2 Backend

The backend is written in javascript with Node Js

### 2.1 Starting development server

To start the server, simply run the command from within the **/backend** directory
```
yarn start
```

You can also choose the port number the server runs of by passing it as a command line argument. Example:

```
yarn start 5050
```

### 2.2 Testing
Tests are stored in the **/backend/src/test** directory.
You can run all tests with the following command
```
yarn test
```

### 2.3	Documentation
The backend server automatically generates the REST API documentation based on the JSdocs comments that you put in your code. You can access the documentation by going to the root domain on the server. So for example, you could find it in the **https://localhost:5050/**

## 3 Database (MongoDB) 

The database is MongoDB and it is hosted in the cloud.

During developement, a mock MongoDB instance is run in memory instead of calling the actual database on the cloud. During deployment this will be changed.

You can change this manually by changing the **testmode** parameter in **./src/database.js** to false so that it
will call the actual database in the cloud instead of the mock database

## 4 Frontend
The frontend is written with react

### 4.1	Starting Front end
To start the server, simply run the command from within the **/frontend** directory
```
yarn start
```

