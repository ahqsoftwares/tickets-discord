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
    channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setTitle("Ticket System")
          .setDescription("Click to open a ticket!")
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
      settings.set(`${message.guild.id}-ticket`, channelID);
    });
    if (!(message.guild.roles.cache.find(role => role.name == "Ticket"))) {

message.guild.roles.create({
    name: "Ticket",
    color: "#ff0000"
}).then(role => {
    role.setPermissions([Discord.Permissions.FLAGS.VIEW_CHANNEL, Discord.Permissions.FLAGS.SEND_MESSAGES]);
    role.setMentionable(false);
    message.channel.send(`Role \`${role.name}\` created and ticket system success!`);
});
    } else {
      message.channel.send(`Role \`Ticket\` was found and ticket system success!`);
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