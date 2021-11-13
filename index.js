const Discord = require("discord.js");
const {DB} = require('mongquick');
var settings;
async function login(url) {
settings = new DB(url);
}

async function start(client){
if(!client) throw new Error("Client not provided, Ticket system will not be working.")

client.on("interactionCreate", async (interaction) => {
  if (!(interaction.isButton())) return;
  if (!(interaction.customId == 'cr')) return;
  if (interaction.member.user.bot) return;
  const reaction = interaction;
  await interaction.deferReply({ephemeral: true});
  if (!(await(settings.has(`${interaction.guild.id}-ticket`)))) return;

  if (reaction.channel.id == (await(settings.get(`${interaction.message.guild.id}-ticket`)))) {
    reaction.guild.channels
      .create(`ticket-${interaction.member.user.username}`, {
        permissionOverwrites: [
          {
            id: interaction.member.user.id,
            allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
          },
          {
            id: reaction.message.guild.id,
            deny: ["VIEW_CHANNEL"]
          },
          {
            id: reaction.message.guild.roles.cache.find(
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
              .setEmoji('🔐')
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
              .setDescription("The ticket was closed")
              .setColor("RANDOM")],
            components: [
              new Discord.MessageActionRow().addComponents(
                new Discord.MessageButton()
                .setStyle('DANGER')
                .setLabel("Lock Ticket")
                .setCustomId('cl')
                .setEmoji('🔐')
                .setDisabled(true)
              )
            ]
          })
          archive(channel)
        })
        });
      });
  }
});
}
async function setup(message,channelID){
    const channel = message.guild.channels.cache.find(channel => channel.id === channelID);
    channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setTitle("Ticket System")
          .setDescription("Click to open a ticket!")
          .setFooter("Ticket System")
          .setColor("00ff00")
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
      message.channel.send("Ticket System Setup Done!");
}
async function unarchive(channel){
  if (!(await(settings.has(channel.id)))) {
    channel.send({
      content: String("The user of the ticket was not found!")
    })
    return
  }
  let mid = (await(settings.get(channel.id)));
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
  if (!message.name.includes("ticket-")){
    message.send("You cannot use that here!");
    return 
    }
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