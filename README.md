# Example 🔍
```
//js
let {
        Discord,
        Client,
        MessageEmbed,
        MessageButton,
        MessageActionRow,
        Intents,
        Permissions,
        MessageSelectMenu
    } = require("discord.js")
    
    const client = new Discord.Client({
        intents: [Object.values(Discord.Intents.FLAGS).reduce((acc, p) => acc | p, 0)]
    });
    
    client.login("TOKEN")
    
    const ticket = require('tickets-discord');
    
    ticket.start(client) //defined client
    ticket.login("MONGODB url")  // you can write 'local' here also!

    client.on('messageCreate', async (message) => {
    if (message.content.startsWith('n!ticket')) {
        ticket.setup(message, message.mentions.channels.first().id);
    }
    if (message.content.startsWith('n!close')) {
        ticket.close(message.channel);
    }
    if (message.content.startsWith('n!archive')) {
        ticket.archive(message.channel);
    }
    if (message.content.startsWith('n!unarchive')) {
        ticket.unarchive(message.channel);
    }

});
```

# Setup 🎟

## Example in detail ✔
### Declaration 📢
```
const ticket = require('tickets-discord');

ticket.start(client) //client

//Login with MongoDB/Local DB
ticket.login("MongoDB url")
```
You can use `local` instead of a mongodb url to make a local DB.

Example 
```
const ticket = require('tickets-discord');

ticket.start(client) //client

//Login with MongoDB/Local DB
ticket.login("local")
//This will make a local quickdb database!
```
### Make ticket 🎫

```
ticket.setup(message/interaction, channelID)//message, ticket setup channel id
```
### Archiving a ticket 🎫
The button archives the ticket also you can use 

```
ticket.archive(messsage.channel) //message channel parameter
```

### Unarchiving a ticket 🎫

```
ticket.archive(messsage.channel) //message channel parameter
```
### Closing a ticket 🎫
Genarally the close button is already given in this ticket welcome and also you can delete a ticket by using.

```
ticket.close(message.channel) //the message channel parameter
```

# Whats new in 2.7.5 🎉

## We added new `local` db option ☑
## Fixed bugs 🐛

## Updated examples 🔼

## Added create role if not exists 📢
