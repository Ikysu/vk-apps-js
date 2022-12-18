// SELECT tag_id, COUNT(tag_id) as "cnt" FROM `User-Tags` GROUP BY tag_id HAVING COUNT(*) > 1 AND tag_id IN (SELECT tag_id FROM `User-Tags` WHERE user_id = 10585173) ORDER BY cnt DESC

import {QueryTypes} from 'sequelize'

export default async function (app) {
    // Get User
    app.get('/', async (req, reply) => {

        // Здесь таится огромный костыль
        // Не делай так, это только для хакатона
        let user_id = req.vk.vk_user_id,
            offset = (+req.query.offset);

        let top = (await app.db.query('SELECT tag_id FROM `User-Tags` GROUP BY tag_id HAVING COUNT(*) > 1 AND tag_id IN (SELECT tag_id FROM `User-Tags` WHERE user_id = '+user_id+') ORDER BY COUNT(tag_id) DESC', { type: QueryTypes.SELECT })).map(({tag_id})=>tag_id);
        let all = (await app.db.models['User-Tag'].findAll({
            where:{
                user_id:{
                    $not:user_id
                }
                
            }
        })).map(({dataValues})=>{
            return {
                user_id:dataValues.user_id,
                tag_id:dataValues.tag_id
            }
        });
        let list = {};
        all.forEach(({user_id, tag_id})=>{
            if(!list[user_id]) list[user_id]=[];
            list[user_id].push(tag_id)
        })
        let out = {}
        Object.keys(list).forEach(key=>{
            if(+key!=req.vk.vk_user_id){
                let id = list[key].filter(x => top.includes(x)).length;
                if(!out[id]) out[id]=[]
                out[id].push(+key)
            }
        })

        let fin = []
        Object.keys(out)
        .sort()
        .forEach(function(v, i) {
            fin=fin.concat(out[v])
        });

        return {statusCode:200, data:fin.reverse().slice(0+offset,10+offset)}
    })
}