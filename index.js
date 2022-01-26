const Discord = require("discord.js");
const {DB} = require('mongquick');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var settings, type, mid, bot, r, log;
async function start(client, url, logs){
  if (url == 'local') {
    type = "quick";
const Database = require("easy-json-database");
settings = new Database("./tickets.json", {
    snapshots: {
        enabled: true,
        interval: 24 * 60 * 60 * 1000,
        folder: './backups/'
    }
});
  } else {
    type = 'mongo';
    settings = new DB(url);
  }
  if (logs == true) {
    log = true
  }
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
    if (log == true) {
      ticket(interaction, (await(settings.get(`r${interaction.guild.id}`))));
      return  
    }
    ticket(interaction, (await(settings.get(`r${interaction.guild.id}`))));
  }
} else {
  if (!((settings.has(`${interaction.guild.id}-ticket`)))) return;
  if (reaction.channel.id == ((settings.get(`${interaction.message.guild.id}-ticket`)))) {
    if (log == true) {
      ticket(interaction, settings.get(`r${interaction.guild.id}`));
      return
    }
    ticket(interaction, settings.get(`r${interaction.guild.id}`));
  }
}
});
}
async function ticket(interaction, rname) {
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
          role => role.id === rname
        ),
        allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
      }
    ],
    type: "text"
  })
  .then(async channel => {
    if (log == true) {
      emit("ticketCreate", reaction, `Ticket for ${channel.name.replace("ticket-", "")} was **created**`, "GREEN")
    }
    settings.set(channel.id, interaction.member.user.id);
    channel.send({
      content: String(`<@${interaction.member.user.id}>\nStaff of <@&${rname}> please be online with us!`),
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
        if (i.user.id !== (message.member).id) {
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
            if (log == true) {
            issue(message, channel, 'Click to open a ticket!', "Ticket", 'logs-ticket');
            } else {
              issue(message, channel, 'Click to open a ticket!', "Ticket");
            }
        }
        if (i.customId == 'sec') {
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
                    reply = collected.first().content;
                    mess = reply;
                    message = collected.first();
                    (s4dmessage.channel).send(String('Your custom role name')).then(() => {
                        (s4dmessage.channel).awaitMessages({
                            filter: (m) => m.author.id === (s4dmessage.member).id,
                            time: (1 * 60 * 1000),
                            max: 1
                        }).then(async (collected) => {
                            reply = collected.first().content;
                            rolen = reply;
                            message = collected.first();
                            if (log == true) {
                            issue(message, channel, mess, rolen);  
                            } else {
                            issue(message, channel, mess, rolen);
                            }
                            reply = null;
                        }).catch(async (e) => {
                            console.error(e);
                            s4dmessage.channel.send({
                                content: String('Discarded!')
                            });
                        });
                    })
    
                    reply = null;
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
async function issue(message, channel, msg, rolename, logname){
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
            message.channel.send(`Role \`${rolename}\` was created and ticket system success!`);
        });
            } else {
              message.channel.send(`Role \`${rolename}\` was found and ticket system success!`);
              settings.set(`r${message.guild.id}`, ((message.guild.roles.cache.find(role => role.name == rolename)).id));
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
    if (log == true) {
      edit(channel, (await(settings.get(`r${channel.guild.id}`))), (await(settings.get(channel.id))));
      return
      }
    edit(channel, (await(settings.get(`r${channel.guild.id}`))), (await(settings.get(channel.id))));
  } else {
    if (!((settings.has(channel.id)))) {
      channel.send({
        content: String("The user of the ticket was not found!")
      })
      return
    }
    if (log == true) {
    edit(channel, (settings.get(`r${channel.guild.id}`)), (settings.get(channel.id)));
    return
    }
    edit(channel, (settings.get(`r${channel.guild.id}`)), (settings.get(channel.id)));
  }
}
async function edit(channel, rname, mid, logname) {
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
        role => role.id === rname
      ),
      allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
    }
  ]
  });
  if (log == true) {
    emit("ticketUnarchive", channel, `Ticket for ${channel.guild.members.cache.find(m => m.user.id == mid).user.username} was **unarchived**`, "YELLOW")
  }
  channel.send({
    content: `Hello <@${mid}>\nThe ticket was reopened by a staff member!`,
    components: [new Discord.MessageActionRow()
    .addComponents(
      new Discord.MessageButton()
      .setStyle("DANGER")
      .setLabel("Lock")
      .setEmoji("🔒")
      .setCustomId('lk')
    )]
  }).then(async f => {
    let collector = f.createMessageComponentCollector({
      max: 3
    });
    collector.on('collect', async i => {
      await i.reply({
        content: String(`Ok <@${i.user.id}>`)
      })
      archive(channel);
      collector.stop();
    });
    collector.on('end', async i => {
      f.edit({
        content: `Hello <@${mid}>\nThe ticket was reopened by a staff member!`,
    components: [new Discord.MessageActionRow()
    .addComponents(
      new Discord.MessageButton()
      .setStyle("DANGER")
      .setLabel("Lock")
      .setEmoji("🔒")
      .setCustomId('lk')
      .setDisabled(true)
    )]
      });
    })
  });
}
async function archive(message){
  if(!bot) throw new Error("Client not provided, Ticket system will not be working.")
  if (!message.name.includes("ticket-")){
    message.send("You cannot use that here!");
    return 
    }
    if (type == 'mongo') {
      if (log == true) {
      ar(message, (await(settings.get(`r${message.guild.id}`))));
      return
      }
      ar(message, (await(settings.get(`r${message.guild.id}`))));
    } else {
      if(log == true) {
      ar(message, (settings.get(`r${message.guild.id}`)));
      return
      }
      ar(message, (settings.get(`r${message.guild.id}`)));
    }
}
async function ar(message, rname){
  let channel = message;
  message.edit({
    permissionOverwrites: [
    {
      id: message.guild.id,
      deny: ["VIEW_CHANNEL"]
    },
    {
      id: message.guild.roles.cache.find(
        role => role.id === rname
      ),
      allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
    }
  ]
});
if (log == true) {
  emit("ticketArchive", channel, `Ticket for ${channel.name.replace("ticket-", "")} was **archived**!`, "YELLOW")
}
}
async function close(message){
  if(!bot) throw new Error("Client not provided, Ticket system will not be working.")
  if (!message.name.includes("ticket-")){
  message.send("You cannot use that here!");
  return 
  }
  settings.delete(message.id);
message.delete();
if (log == true) {
  emit("ticketClose", message, `Ticket for ${message.name.replace("ticket-", "")} was **closed**!`, "RED")
}
}
async function version() {
  return "version 4";
}
async function emit(a, b, c, d){
  const reaction = b;
  if (!(b.guild.channels.cache.find(c => c.name == "ticket-logs"))) {
    b.guild.channels.create("ticket-logs", {
      permissionOverwrites: [
        {
          id: reaction.guild.id,
          deny: ["VIEW_CHANNEL"]
        }
      ],
      type: "text"
    });
  }
  b.guild.channels.cache.find(c => c.name == "ticket-logs").send({
    embeds: [new Discord.MessageEmbed()
    .setTitle(String(a))
    .setDescription(String(c))
    .setColor(d)
    ]
  });

}
module.exports = {
  setup: setup,
  start: start,
  close: close,
  archive: archive,
  unarchive: unarchive,
  setup,
  start,
  close,
  archive,
  unarchive,
  version,
  emit
}