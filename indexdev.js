const Discord = require("discord.js");
const {DB} = require('mongquick');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var settings, type, mid, bot;
async function login(url) {
  if (url == 'local') {
    type = "quick";
    settings = require('quick.db');
    return
  }
  type = 'mongo';
  settings = new DB(url);
}

async function start(client){
if(!client) throw new Error("Client not provided, Ticket system will not be working.")
bot = client;
client.on("interactionCreate", async (interaction) => {
  if (!(interaction.isButton())) return;
  if (!(interaction.customId == 'cr')) return;
  if (interaction.member.user.bot) return;
  const reaction = interaction;
  await interaction.deferReply({ephemeral: true});
  if (type == 'mongo') {
  if (!(await(settings.has(`${interaction.guild.id}-ticket`)))) return;
  if (reaction.channel.id == (await(settings.get(`${interaction.message.guild.id}-ticket`)))) {
    ticket(interaction);
  }
} else {
  if (!((settings.has(`${interaction.guild.id}-ticket`)))) return;
  if (reaction.channel.id == ((settings.get(`${interaction.message.guild.id}-ticket`)))) {
    ticket(interaction);
  }
}
});
}
async function ticket(interaction) {
  if(!bot) throw new Error("Client not provided, Ticket system will not be working.")
  let reaction = interaction;
  reaction.guild.channels
  .create(`ticket-${interaction.member.user.username}`, {
    permissionOverwrites: [
      {
        id: interaction.member.user.id,
        allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
      },
      {
        id: reaction.guild.id,
        deny: ["VIEW_CHANNEL"]
      },
      {
        id: reaction.guild.roles.cache.find(
          role => role.name === "Ticket"
        ),
        allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
      }
    ],
    type: "text"
  })
  .then(async channel => {
    settings.set(channel.id, interaction.member.user.id);
    channel.send({
      content: String(`<@${interaction.member.user.id}>`),
      embeds: [new Discord.MessageEmbed()
        .setTitle("Welcome to your ticket!")
        .setDescription("Support Team will be with you shortly")
        .setColor("RANDOM")],
      components: [
        new Discord.MessageActionRow().addComponents(
          new Discord.MessageButton()
          .setStyle('DANGER')
          .setLabel("Lock Ticket")
          .setCustomId('cl')
          .setEmoji('🔒')
        )
      ]
    }).then(m => {
      let collector = m.createMessageComponentCollector({
        max: 3
    });
    collector.on('collect', async i => {
      if (i.user.id !== interaction.member.user.id) {
        await i.reply({
          content: String("You are not the ticket issuer"), 
          ephemeral: true
        })
        return
      }
      await i.update({
        embeds: [new Discord.MessageEmbed()
          .setTitle("Welcome to your ticket!")
          .setDescription("The ticket was archived")
          .setColor("RANDOM")],
        components: [
          new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton()
            .setStyle('DANGER')
            .setLabel("Locked Ticket")
            .setCustomId('cl')
            .setEmoji('🔏')
            .setDisabled(true)
          )
        ]
      })
      archive(channel)
    })
    });
  });
}
async function setup(message,channelID){
  if(!bot) throw new Error("Client not provided, Ticket system will not be working.")
    const channel = message.guild.channels.cache.find(channel => channel.id === channelID);
    let s4dmessage = message;
    message.channel.send({
        embeds: [
          new Discord.MessageEmbed()
            .setTitle("Ticket System")
            .setDescription("Chose your settings")
            .setFooter(`Secure ticketing for ${message.guild.name}`)
            .setColor("RANDOM")
        ],
        components: [
              new Discord.MessageActionRow().addComponents(
                new Discord.MessageButton()
                .setStyle('PRIMARY')
                .setLabel("Use Default Settings!")
                .setCustomId('pri')
                .setEmoji('🥇'),
                new Discord.MessageButton()
                .setStyle('SECONDARY')
                .setLabel("Use Custom Settings!")
                .setCustomId('sec')
                .setEmoji('🥈')
              )
            ]
      }).then(sent => {
        let collector = sent.createMessageComponentCollector({
            max: 3
        });
        collector.on('collect', async i => {
        if (i.user.id !== message.member.user.id) {
            await i.reply({
              content: String("Its not for you!"), 
              ephemeral: true
            })
            return
        }
        if (i.customId == 'pri') {
            await i.reply({
                content: String("Setting up!"), 
                ephemeral: true
            });
            issue(message, channel, 'Click to open a ticket!', "Ticket");
        }
        if (ticket.customId == 'sec') {
            await i.reply({
                content: String("Setting up!"), 
                ephemeral: true
            });
            (s4dmessage.channel).send(String('Ticket message (Description)')).then(() => {
                (s4dmessage.channel).awaitMessages({
                    filter: (m) => m.author.id === (s4dmessage.member).id,
                    time: (1 * 60 * 1000),
                    max: 1
                }).then(async (collected) => {
                    mess = collected.first().content;
                    s4d.message = collected.first();
                    (s4dmessage.channel).send(String('Your custom role name')).then(() => {
                        (s4dmessage.channel).awaitMessages({
                            filter: (m) => m.author.id === (s4dmessage.member).id,
                            time: (1 * 60 * 1000),
                            max: 1
                        }).then(async (collected) => {
                            rolen = collected.first().content;
                            s4d.message = collected.first();
                            issue(message, channel, mess, rolen);
                            s4d.reply = null;
                        }).catch(async (e) => {
                            console.error(e);
                            s4dmessage.channel.send({
                                content: String('Discarded!')
                            });
                        });
                    })
    
                    s4d.reply = null;
                }).catch(async (e) => {
                    console.error(e);
                    s4dmessage.channel.send({
                        content: String('Discarded!')
                    });
                });
            })
        }
        collector.stop()
    });
      });
    }
async function issue(message, channel, msg, rolename){
    channel.send({
        embeds: [
          new Discord.MessageEmbed()
            .setTitle("Ticket System")
            .setDescription(String(msg))
            .setFooter(`Secure ticketing for ${message.guild.name}`)
            .setColor("RANDOM")
        ],
        components: [
              new Discord.MessageActionRow().addComponents(
                new Discord.MessageButton()
                .setStyle('SUCCESS')
                .setLabel("Open Ticket")
                .setCustomId('cr')
                .setEmoji('🎫')
              )
            ]
      }).then(sent => {
        settings.set(`${message.guild.id}-ticket`, channel.id);
      });
      if (!(message.guild.roles.cache.find(role => role.name == rolename))) {

        message.guild.roles.create({
            name: String(rolename),
            color: "#ff0000"
        }).then(role => {
            role.setPermissions([Discord.Permissions.FLAGS.VIEW_CHANNEL, Discord.Permissions.FLAGS.SEND_MESSAGES]);
            role.setMentionable(false);
            settings.set(`r${message.guild.id}`, role.id);
            message.channel.send(`Role \`${rolename}\` created and ticket system success!`);
        });
            } else {
              message.channel.send(`Role \`${rolename}\` was found and ticket system success!`);
            }
}
async function unarchive(channel){
  if(!bot) throw new Error("Client not provided, Ticket system will not be working.")
  if (type == 'mongo') {
    if (!(await(settings.has(channel.id)))) {
      channel.send({
        content: String("The user of the ticket was not found!")
      })
      return
    }
    mid = (await(settings.get(channel.id)));
  } else {
    if (!((settings.has(channel.id)))) {
      channel.send({
        content: String("The user of the ticket was not found!")
      })
      return
    }
    mid = (settings.get(channel.id));
  }
  await delay(1500)
  channel.edit({
    permissionOverwrites: [
    {
      id: mid,
      allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
    },
    {
      id: channel.guild.id,
      deny: ["VIEW_CHANNEL"]
    },
    {
      id: channel.guild.roles.cache.find(
        role => role.name === "Ticket"
      ),
      allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
    }
  ]
  });
  channel.send({
    content: String(`Hello <@${mid}> \n The ticket was reopened by a staff member`)
  })
}
async function archive(message){
  if(!bot) throw new Error("Client not provided, Ticket system will not be working.")
  if (!message.name.includes("ticket-")){
    message.send("You cannot use that here!");
    return 
    }
  message.edit({
    permissionOverwrites: [
    {
      id: message.guild.id,
      deny: ["VIEW_CHANNEL"]
    },
    {
      id: message.guild.roles.cache.find(
        role => role.name === "Ticket"
      ),
      allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
    }
  ]
});
}
async function close(message){
  if(!bot) throw new Error("Client not provided, Ticket system will not be working.")
  if (!message.name.includes("ticket-")){
  message.send("You cannot use that here!");
  return 
  }
message.delete()
}
module.exports.setup = setup
module.exports.login = login
module.exports.start = start
module.exports.close = close
module.exports.archive = archive
module.exports.unarchive = unarchive