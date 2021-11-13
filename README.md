# Exameple
```
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
    client.login("TOEKN)
    client.on('messageCreate', async (s4dmessage) => {
    if (message.content.startsWith('n!ticket')) {
        ticket.setup(message, message.mentions.channels.first().id);
    }
    if (message.content.startsWith('n!close')) {
        ticket.close(message);
    }
    if (message.content.startsWith('n!archive')) {
        ticket.archive(message);
    }

});
```

# Setup
## Declaration
```
const ticket = require('tickets-discord');

ticket.start(client //client)
```
## Important

```
Create a .env file called DB and set a mongoDB url
```

## Setup

```
ticket.setup(message/interaction, channelID//ticket setup channel id)
```

## Closing a ticket 
Genarally the close button is already given in this ticket welcome and also you can delete a ticket by using.

```
ticket.close(message //the message parameter)
```

## Archiving a ticket
The button archives the ticket also you can use 

```
ticket.archive(messsage //message parameter)
```