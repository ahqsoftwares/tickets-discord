const Discord = require("discord.js");
const {DB} = require('mongquick');
const settings = new DB(process.env.DB);

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
              .setLabel("Archive Ticket")
              .setCustomId('cl')
            )
          ]
        }).then(m => {
          let collector = m.createMessageComponentCollector({
            max: 1
        });
        collector.on('collect', async i => {
          await i.deferReply()
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
    let role = message.guild.roles.cache.get(r => r.name === "Ticket");
  if (role == '') {
    message.guild.roles.create({
      name: 'Ticket'
    })
  }
      message.channel.send("Ticket System Setup Done!");
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
  message.channel.permissionOverwrites.edit([
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
  ]);
}
async function close(message){
  if (!message.name.includes("ticket-")){
  message.send("You cannot use that here!");
  return 
  }
message.delete()
}
module.exports.setup = setup
module.exports.start = start
module.exports.close = close
module.exports.archive = archive
