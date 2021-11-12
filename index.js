const Discord = require("discord.js");
const enmap = require("enmap");
const {DB} = require('mongquick');
async function db(uri){
const settings = new DB(uri);
}

async function start(client){
if(!client) throw new Error("Client not provided, Ticket system will not be working.")

client.on("messageReactionAdd", async (reaction, user, message) => {
  if (user.partial) await user.fetch();
  if (reaction.partial) await reaction.fetch();
  if (reaction.message.partial) await reaction.message.fetch();
  if (user.bot) return;

  if (!(await(settings.has(`${reaction.message.guild.id}-ticket`)))) return;

  if (reaction.message.id == (await(settings.get(`${reaction.message.guild.id}-ticket`))) && reaction.emoji.name == "🎫") {
    reaction.users.remove(user);

    reaction.message.guild.channels
      .create(`ticket-${user.username}`, {
        permissionOverwrites: [
          {
            id: user.id,
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
          content: String(`<@${user.id}>`),
          embeds: [new Discord.MessageEmbed()
            .setTitle("Welcome to your ticket!")
            .setDescription("Support Team will be with you shortly")
            .setColor("RANDOM")],
          components: [
            new Discord.MessageActionRow().addComponents(
              new Discord.MessageButton()
              .setStyle('DANGER')
              .setLabel("Close Ticket")
              .setCustomId('cl')
            )
          ]
        }).then(m => {
          let collector = m.createMessageComponentCollector({
            max: 1
        });
        collector.on('collect', async i => {
          await i.deferReply()
          close(channel)
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
          .setDescription("React to open a ticket!")
          .setFooter("Ticket System")
          .setColor("00ff00")
      ]
    }).then(sent => {
      sent.react("🎫");
      settings.set(`${message.guild.id}-ticket`, sent.id);
    });
      message.channel.send("Ticket System Setup Done!");
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
module.exports.login = db
module.exports.close = close
