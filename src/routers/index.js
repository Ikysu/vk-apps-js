export default async function (app) {
    app.get('/', (req, reply) => {
      	return { authors: [
            {
                name:"Ikysu",
                full_name:"Даниил Сагабутдинов",
                link:"https://iky.su"
            },
            {
                name:"DamirLut",
                full_name:"Дамир Лутфрахманов",
                link:"https://damirlut.online"
            }
        ] }
    })
}