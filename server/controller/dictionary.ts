//

import cors from "cors";
import {
  TextChannel
} from "discord.js";
import {
  Request,
  Response
} from "express";
import fs from "fs";
import {
  SaverCreator
} from "soxsot/dist/io";
import {
  Controller
} from "/server/controller/controller";
import {
  before,
  controller,
  cron,
  get,
  post
} from "/server/controller/decorator";
import {
  DISCORD_IDS
} from "/server/discord/id";
import {
  DiscordClient
} from "/server/util/client";
import {
  ExtendedDictionary
} from "/server/util/dictionary";
import {
  getTempFilePath
} from "/server/util/misc";
import * as val from "/server/util/validator/builtin-validators";
import {
  PASSWORD
} from "/server/variable";


@controller("/api/dictionary")
export class DictionaryController extends Controller {

  @get("/fetch")
  @before(cors())
  public async [Symbol()](request: Request, response: Response): Promise<void> {
    const dictionary = await ExtendedDictionary.fetch();
    const plainDictionary = dictionary.toPlain();
    response.json(plainDictionary).end();
  }

  @post("/upload")
  public async [Symbol()](request: Request, response: Response): Promise<void> {
    const validator = val.object({
      password: val.string
    });
    const [body, invalids] = validator.validate(request.body);
    if (body !== undefined && request.file?.path !== undefined) {
      if (body.password === PASSWORD) {
        const path = request.file?.path;
        const dictionary = await ExtendedDictionary.upload(path);
        const channel = DiscordClient.instance.channels.resolve(DISCORD_IDS.channel.sokad.sotik);
        if (channel instanceof TextChannel) {
          await channel.send(`辞書データが更新されました (${dictionary.words.length} 語)。`);
        }
        await fs.promises.unlink(path);
        response.json(null).end();
      } else {
        response.sendStatus(403).end();
      }
    } else {
      response.status(400).json(invalids).end();
    }
  }

  @get("/download")
  @before(cors())
  public async [Symbol()](request: Request, response: Response): Promise<void> {
    const validator = val.object({
      kind: val.enums("single", "oldShaleian")
    });
    const [query, invalids] = validator.validate(request.query);
    if (query !== undefined) {
      const path = getTempFilePath("txt");
      const fileName = "shaleian" + ((query.kind === "single") ? ".xdn" : ".xdc");
      const dictionary = await ExtendedDictionary.fetch();
      const saver = SaverCreator.createByKind(query.kind, dictionary, path);
      await saver.asPromise();
      response.download(path, fileName, (error) => {
        fs.promises.unlink(path);
      });
    } else {
      response.status(400).json(invalids).end();
    }
  }

  @post("/request")
  @before(cors())
  public async [Symbol()](request: Request, response: Response): Promise<void> {
    const validator = val.object({
      names: val.array(val.string)
    });
    const [body, invalids] = validator.validate(request.body);
    if (body !== undefined) {
      const dictionary = await ExtendedDictionary.fetch();
      const count = await dictionary.addCommissions(body.names);
      response.json(count).end();
    } else {
      response.status(400).json(invalids).end();
    }
  }

  @get("/count")
  @before(cors())
  public async [Symbol()](request: Request, response: Response): Promise<void> {
    const dictionary = await ExtendedDictionary.fetch();
    const count = dictionary.words.length;
    response.json(count).end();
  }

  @get("/difference")
  @before(cors())
  public async [Symbol()](request: Request, response: Response): Promise<void> {
    const validator = val.object({
      durations: val.arrayOrSingle(val.intFromString)
    });
    const [query, invalids] = validator.validate(request.query);
    if (query !== undefined) {
      const dictionary = await ExtendedDictionary.fetch();
      const difference = await dictionary.fetchWordCountDifferences(query.durations);
      response.json(difference).end();
    } else {
      response.status(400).json(invalids).end();
    }
  }

  @get("/badge/count")
  @before(cors())
  public async [Symbol()](request: Request, response: Response): Promise<void> {
    const dictionary = await ExtendedDictionary.fetch();
    const count = dictionary.words.length;
    const output = {schemaVersion: 1, color: "informational", label: "words", message: count.toString()};
    response.json(output).end();
  }

  @cron("20,50 * * * *")
  public async [Symbol()](): Promise<void> {
    const dictionary = await ExtendedDictionary.fetch();
    await dictionary.saveHistory();
  }

  @cron("*/30 * * * *")
  public async [Symbol()](): Promise<void> {
    const dictionary = await ExtendedDictionary.fetch();
    const word = dictionary.words[Math.floor(Math.random() * dictionary.words.length)];
    const embed = ExtendedDictionary.createWordDiscordEmbed(word);
    if (embed !== undefined) {
      const channel = DiscordClient.instance.channels.resolve(DISCORD_IDS.channel.sokad.sotik);
      if (channel instanceof TextChannel) {
        await channel.send({embeds: [embed]});
      } else {
        throw new Error("cannot happen");
      }
    }
  }

}