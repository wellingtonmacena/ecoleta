import {Request, Response} from 'express'
import connection from '../database/connection'

class ItemsController{
    async index(req: Request, res: Response){
        const items = await connection('items').select('*')

        const serializedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                name_url: `http://localhost:4001/uploads/${item.image}`
            }
        })
        res.json(serializedItems);

    }
}

export default ItemsController