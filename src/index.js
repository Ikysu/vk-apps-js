import Fastify from 'fastify';
import FastifyAutoload from '@fastify/autoload';
import FastifyCors from '@fastify/cors';
import FastifyORM from 'sequelize-fastify';
import { DataTypes, Op } from 'sequelize';
import fs from 'fs';
import {checkVkToken} from './utils.js';

import Az from 'az';

const operatorsAliases = {
    $like: Op.like,
    $in: Op.in,
    $not: Op.not,
    $or: Op.or,
    $in: Op.in
}

const fastify = Fastify();

const settings = JSON.parse(fs.readFileSync("settings.json", "utf-8"))

fastify.settings=settings;

fastify.register(FastifyCors, {
  origin:"*",
  methods:["GET", "POST", "PUSH", "OPTIONS"]
})

fastify.register(FastifyORM, {
  instance: 'db',
  sequelizeOptions: {
    ...settings.db,
    operatorsAliases 
  }
}).ready(async () => {
  try {

    const resultAuth = await fastify.db.authenticate()

    console.log('Database connection is successfully established.')

    fastify.db.define('User', {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      city: {
        type: DataTypes.INTEGER
      },
      description: {
        type: DataTypes.TEXT
      }
    }, {});

    fastify.db.define('Tag', {
      tag_id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      type_id: {
        type: DataTypes.INTEGER
      }
    }, {});

    fastify.db.define('Type', {
      type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING
      }
    }, {});

    fastify.db.define('User-Tag', {
      user_id: {
        type: DataTypes.INTEGER
      },
      tag_id: {
        type: DataTypes.STRING
      }
    }, {});

    

    const resultSync = await fastify.db.sync({
      //force: true
    });

    console.log('Database synced.')

    Object.keys(fastify.db.models).forEach(key=>{
      fastify.db.models[key].ups=(condition,values)=>{
        return fastify.db.models[key]
          .findOne({ where: condition })
          .then(function(obj) {
              // update
              if(obj) {
                return obj.update(values)
              }else{
                return fastify.db.models[key].create(values);
              };
              
          })
      }
    })



    
    

    

    console.log(fastify.printRoutes())

    
    
    

  } catch(err) {
    console.log(`Connection could not established: ${err}`)
  }
})

fastify.register(FastifyAutoload, {
  dir:"./src/routers"
})


fastify.addHook('onRequest', async (req, reply) => {
  if(req.headers["vk-token"]){
    let check = checkVkToken(req.headers["vk-token"]);
    if(check.statusCode==200){
      req.vk={
        ...check.data,
        vk_user_id:+check.data.vk_user_id
      }
    }else{
      reply.status(check.statusCode).send(check)
    }
  }else{
    reply.status(400).send({statusCode:400, error:"Неизвестный источник. Войдите через вк."})
  }
})

fastify.listen(settings.fastify, async err => {
  if (err) throw err;

  fastify.az = await new Promise((resolve, reject)=>{
    Az.Morph.init('bower_components/az/dicts', function() {
      function morph(word) {
        var parses = Az.Morph(word);
        return parses
      }
      resolve(morph)
    });
  });
});