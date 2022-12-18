export default async function (app) {
    app.get('/', async (req, reply) => {
        let data = await app.db.models["Type"].findAll()
      	return { statusCode:200, data }
    })
}