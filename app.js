"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const { WebClient } = require("@slack/web-api");

const userClient = new WebClient(process.env.USER_OAUTH_TOKEN);
const botClient = new WebClient(process.env.BOT_USER_OAUTH_TOKEN);

const getEmoji = async (emoji) => {
  const list = await botClient.emoji.list();
  const emojis = list.emoji || {};

  if (!emojis[emoji])
    throw new Error(
      `${emoji} is missing or an error has occurred. please try again :pray:`
    );

  return emojis[emoji];
};

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 * Use body-parser's `verify` callback to export a parsed raw body
 * that you need to use to verify the signature
 */

const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || "utf8");
  }
};

app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

/*
 * Slash Command
 * Endpoint to receive /httpstatus slash command from Slack.
 */

app.post("/command", async (req, res, next) => {
  try {
    if (req.body.text) {
      const text = req.body.text;
      const emoji = text.replace(/:([^:]+):/, "$1");
      const image = await getEmoji(emoji);

      message = {
        response_type: "in_channel", // public to the channel
        attachments: [
          {
            color: "#fff",
            text: "",
            image_url: image,
          },
        ],
      };
    } else {
      message = {
        response_type: "ephemeral", // private message
        text: ":cat: How to use `/stamp` command:",
        attachments: [
          {
            text: "Type a emoji after the command, _e.g._ `/stamp :cat:`",
          },
        ],
      };
    }

    res.json(message);
  } catch (e) {
    next(error);
  }
});

app.use((err, req, res) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

const server = app.listen(process.env.PORT || 5000, () => {
  console.log(
    "Express server listening on port %d in %s mode",
    server.address().port,
    app.settings.env
  );
});
