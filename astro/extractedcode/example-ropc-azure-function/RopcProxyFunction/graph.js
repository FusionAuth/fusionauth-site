const MicrosoftGraph = require('@microsoft/microsoft-graph-client');
const MyAuthenticationProvider = require('./authProvider');
const fs = require('fs');

require('isomorphic-fetch');

const clientOptions = {
	authProvider: new MyAuthenticationProvider(),
    defaultVersion: "beta"
};

const client = MicrosoftGraph.Client.initWithMiddleware(clientOptions);

async function getUsers() {
    try {
        console.log('Graph API called at: ' + new Date().toString());
        return await client.api('/users').get();
    } catch (error) {
        console.log(error);
        return error;
    }
}

async function getUser(id) {
    try {
        console.log('Graph API called at: ' + new Date().toString());
        return await client.api(`/users/${id}`).get();
    } catch (error) {
        console.log(error);
        return error;
    }
}

async function deleteUser(id) {
    try {
        console.log('Graph API called at: ' + new Date().toString());
        return await client.api(`/users/${id}`).delete();
    } catch (error) {
        console.log(error);
        return error;
    }
}

async function updateUser(id, prop) {
    try {
        console.log('Graph API called at: ' + new Date().toString());
        return await client.api(`/users/${id}`).patch(prop);
    } catch (error) {
        console.log(error);
        return error;
    }
}

async function createUser(user) {
    try {
        console.log('Graph API called at: ' + new Date().toString());
        return await client.api('/users').post(user);
    } catch (error) {
        console.log(error);
        return error;
    }
}

async function createUsersFromFile(path) {
    let users = JSON.parse(fs.readFileSync(path));

    try {
        console.log('Graph API called at: ' + new Date().toString());
        return await users.forEach(async(user) => {
            return await client.api('/users').post(user);
        });
    } catch (error) {
        console.log(error);
        return error;
    }
}

module.exports = {
    getUsers: getUsers,
    getUser: getUser,
    updateUser: updateUser,
    createUser: createUser,
    createUsersFromFile: createUsersFromFile,
    deleteUser: deleteUser
}