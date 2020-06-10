# Video Room Manager

This project aims to manage a video calls server.

The application has user management and virtual rooms management.


### Stack

- [Node.js](https://nodejs.org)
- [Express.js](https://expressjs.com)
- [Type ORM](https://typeorm.io)
    - This project is compatible with all databases supported by TypeOrm projects

### Download

- [Link to the project repository on github](https://github.com/guipassos/video-server-challenge.git/)


### Fire up

To start this project, you needs to download the dependencies through command:

``` console
npm install
```

In the next step, you need to create and configure the .env file. To do this, you must copy the .env.example file to .env in the main directory and set the env values.

``` console
cp .env.example .env
```

Then, you can change the database parameters inside [ormconfig.json](ormconfig.json) file, according to your scenario.
   - The default setting is SQLite



### Run API

After downloading, installing dependencies, and configure database settings, you can already now run the API:

``` console
npm start 
```

or

``` console
npm run prod 
```

And so you can perform the initial migrations using:

``` console
npm run migrations:run
```


### API's Endpoints

[Link to Endpoints](https://documenter.getpostman.com/view/1470157/Szzefenj)



### Objectives

Design a server that handles HTTP requests based on the following specifications:

1. User management: 
    - The server should be able to register and authenticate users. 
    - User has: username, password, and an optional mobile_token (string)
    - Required routes:
            - Get users (no auth required): returns a list of all users
            - Get users (no auth required): takes a username and return the user with matching username
            - Register (no auth required): takes a username, password and optional string for mobile_token. 
            - Registers the user and authenticates the client as the newly created user
            - Sign in/authenticate: takes a username and password, and authenticates the user
            - Update User (must be signed in as the user): updates password and/or mobile_token of the user
            - Delete User (must be signed in as the user): deletes the user
1. Room management: 
    - The server should be able to handle creating conference rooms
    - Room has: name (non-unique), guid, host user, participants (users) in the room, and a capacity limit. 
    - Number of users in the room must not exceed the capacity
    - Required routes:
        - Create a room (signed in as a user): creates a room hosted by the current user, with an optional capacity limit. Default is 5.
        - Change host (must be signin as the host): changes the host of the user from the current user to another user
        - Join/leave (signed in as a user): joins/leaves the room as the current user
        - Get info (no auth): given a room guid, gets information about a room
        - Search for the rooms that a user is in: given a username, returns a list of rooms that the user is in.

