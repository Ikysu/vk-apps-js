
export default async function (app) {
    app.get('/', async (req, reply) => {
        let data = await app.db.models["Tag"].findAll({
            where:{
                tag_id: {
                    $like:`${req.query.text??""}%`
                }
            },
            limit:5
        })
      	return { statusCode:200, data }
    })



}