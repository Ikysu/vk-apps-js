export default async function (app) {

    // Get User
    app.get('/', async (req, reply) => {
        let user_id = !+req.query.id==!0?req.vk.vk_user_id:+req.query.id
        let data = await app.db.models["User"].findOne({
            where:{
                user_id
            }
        })
        let tags = [...new Set((await (await app.db.models["User-Tag"].findAll({
            where:{
                user_id
            }   
        }))).map(({tag_id})=>tag_id))]
        if(data){
            return { statusCode:200, data:{...data.dataValues, tags} }
        }else{
            //if(user_id==req.vk.vk_user_id){
            //    let data = await app.db.models["User"].ups({
            //        user_id:req.vk.vk_user_id
            //    },{
            //        user_id:req.vk.vk_user_id,
            //        city:0,
            //        description:""
        
            //    })
            //    if(data.dataValues){
            //        reply.send({ statusCode:200, data:{...data.dataValues, tags:[] }})
            //    }else{
            //        reply.status(400).send({ statusCode:400, error:"Ошибка создания" })
            //    }
            //}else{
            //    return { statusCode:404, error:"Пользователь не найден"}
            //}
            return { statusCode:404, error:"Пользователь не найден"}
            
        }
    })

    // Create/Update User
    app.post('/', async (req, reply) => {
        let newTags = req?.body?.tags;
        let tags = newTags?[]:[...new Set((await (await app.db.models["User-Tag"].findAll({
            where:{
                user_id:req.vk.vk_user_id
            }   
        }))).map(({tag_id})=>tag_id))]
        if(newTags){
            await app.db.query("DELETE FROM `User-Tags` WHERE user_id = "+req.vk.vk_user_id+" AND tag_id IN (SELECT tag_id FROM `User-Tags` WHERE user_id = "+req.vk.vk_user_id+");")


            await newTags.forEach(async tag=>{
                tags.push(tag)
                let cTag = await app.db.models["Tag"].ups({
                    tag_id:tag
                },{
                    tag_id:tag,
                    type_id:1
                })
                if(cTag.dataValues.tag_id){
                    await app.db.models["User-Tag"].ups({
                        user_id:req.vk.vk_user_id,
                        tag_id:cTag.dataValues.tag_id
                    }, {
                        user_id:req.vk.vk_user_id,
                        tag_id:cTag.dataValues.tag_id
                    })
                }
            })
        }

        let data = await app.db.models["User"].ups({
            user_id:req.vk.vk_user_id
        },{
            user_id:req.vk.vk_user_id,
            city:req?.body?.city?.id??0,
            description:req?.body?.description??""
        })
        if(data.dataValues){
            reply.send({ statusCode:200, data:{...data.dataValues, tags }})
        }else{
            reply.status(400).send({ statusCode:400, error:"Ошибка создания" })
        }
    })


    //Добавление пользователей из хакатона
    app.post('/data', async (req, reply) => {
        await req.body.tags.forEach(async tag=>{
            await app.db.models["Tag"].ups({
                tag_id:tag
            },{
                tag_id:tag,
                type_id:Math.floor(Math.random() * 2 + 1)
            })
        })



        await req.body.data.forEach(async user=>{
            await user.tags.forEach(async tag=>{
                await app.db.models["User-Tag"].create({
                    user_id:user.id,
                    tag_id:tag
                })
            })
            await app.db.models["User"].ups({
                user_id:user.id
            },{
                user_id:user.id,
                city:0,
                description:""
            })
        })

        

    })
}