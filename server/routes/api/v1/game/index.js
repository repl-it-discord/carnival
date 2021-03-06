import express from 'express';
import { users, games } from '../../../../models/index';
import { fn, col } from 'sequelize';
import uid from 'uid';
import btoa from 'btoa';
import jwt from 'jsonwebtoken';
import Fuse from 'fuse.js';
const { jwtKey } = require('../../../../config');

const router = express.Router();

const authorize = async req => {
  if (req.headers.authorization) {
    if (
      req.headers.authorization.split(' ').shift().toLowerCase() === 'bearer'
    ) {
      try {
        let result = await users.findOne({
          where: {
            secret_id: jwt.verify(
              req.headers.authorization.split(' ').pop(),
              jwtKey
            ).secret_id
          }
        });
        if (result === null)
          return { status: 404, error: 'Invalid token was passed.' };
        else {
          return { status: 200, data: result };
        }
      } catch (err) {
        return { status: 500, error: err.message };
      }
    } else {
      return { status: 400, error: 'Invalid token type' };
    }
  } else {
    return { status: 400, error: 'Authentication token not provided' };
  }
};

router.get('/list', async (req, res) => {
  let page = parseInt(req.query.page) || 0;
  let results = await games.findAll({
    limit: 10,
    offset: page * 10,
    order: [[fn('array_length', col('votes'), 1), 'DESC']],
    attributes: [
      'game_id',
      'game_name',
      'game_title',
      'game_desc',
      'talk_url',
      'game_owner',
      'repl',
      [fn('array_length', col('votes'), 1), 'votes']
    ]
  });
  res.json(results.map(x => x.toJSON()));
});

router.get('/data/:id', async (req, res) => {
  if (isNaN(parseInt(req.params.id))) res.sendStatus(400);
  else {
    let auth;
    if (req.headers.authorization) auth = await authorize(req);
    let result = await games.findOne({
      where: {
        game_id: req.params.id
      },
      attributes: [
        'game_id',
        'game_name',
        'game_title',
        'game_desc',
        'talk_url',
        'game_owner',
        'repl',
        'author',
        'auth_token',
        'game_data',
        [fn('array_length', col('votes'), 1), 'votes']
      ]
    });
    if (result === null) res.status(404).json({ error: 'Game not found' });
    else {
      let gameData = result.toJSON();
      if (
        auth === undefined ||
        !(auth.status === 200 && auth.data.secret_id === gameData.author)
      ) {
        delete gameData.author;
        delete gameData.auth_token;
        delete gameData.game_data;
      }
      res.status(200).json(gameData);
    }
  }
});

router.post('/new', async (req, res) => {
  let auth = await authorize(req);
  if (auth.status !== 200) res.status(auth.status).json({ error: auth.error });
  else {
    if (req.body.title && req.body.desc && req.body.repl) {
      let title = req.body.title;
      let name = title.toLowerCase().replace(/ /g, '-');
      let token = btoa(auth.data.secret_id + ':' + uid(36));
      let repl = req.body.repl.split('/');
      let replUsername = repl[repl.length - 2].substr(1);
      let replName = repl[repl.length - 1];
      let gameId = await games.max('game_id');
      let result;
      try {
        result = await games.create({
          game_id: gameId + 1,
          game_name: name,
          game_title: title,
          game_desc: req.body.desc,
          author: auth.data.secret_id,
          talk_url: req.body.talkLink,
          game_owner: replUsername,
          repl: replName,
          votes: [auth.data.secret_id],
          game_scores: [],
          auth_token: token
        });
        res.status(200).json(result.toJSON());
      } catch (error) {
        res.status(500).json({
          error: error.message
        });
      }
    } else {
      res.status(400).json({
        error:
          'Missing parameters - ' + req.body.title
            ? ''
            : 'title, ' + req.body.desc
            ? ''
            : 'desc, ' + req.body.repl
            ? ''
            : 'repl' + '.'
      });
    }
  }
});

router.get('/search', async (req, res) => {
  let gameList = (
    await games.findAll({
      order: [['votes', 'DESC']],
      attributes: [
        'game_id',
        'game_name',
        'game_title',
        'game_desc',
        'talk_url',
        'game_owner',
        'repl',
        [fn('array_length', col('votes'), 1), 'votes']
      ]
    })
  ).map(x => x.toJSON());
  let fuse = new Fuse(gameList, {
    minMatchCharLength: 2,
    findAllMatches: true,
    keys: ['game_title'],
    threshold: 0.4,
    distance: 200
  });
  res.json(fuse.search(decodeURIComponent(req.query.q)).map(x => x.item));
});

router.get('/vote/:game', async (req, res) => {
  let auth = await authorize(req);
  if (auth.status === 200) {
    let result = await games.findOne({ where: { game_id: req.params.game } });
    if (result === null)
      res.status(404).json({ error: 'The game was not found.' });
    else {
      let voters = result.votes;
      if (!voters.includes(auth.data.secret_id))
        voters.push(auth.data.secret_id);
      try {
        await games.update(
          { votes: voters },
          { where: { game_id: req.params.game } }
        );
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Unable to update DB' });
      }
    }
  } else {
    res.status(auth.status).json({ error: auth.error });
  }
});

router.get('/downvote/:game', async (req, res) => {
  let auth = await authorize(req);
  if (auth.status === 200) {
    let result = await games.findOne({ where: { game_id: req.params.game } });
    if (result === null)
      res.status(404).json({ error: 'The game was not found.' });
    else {
      let voters = result.votes;
      if (voters.includes(auth.data.secret_id))
        voters.splice(voters.indexOf(auth.data.secret_id), 1);
      try {
        await games.update(
          { votes: voters },
          { where: { game_id: req.params.game } }
        );
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Unable to update DB' });
      }
    }
  } else {
    res.status(auth.status).json({ error: auth.error });
  }
});

export default router;
