import { Request, Response } from 'express'
import connection from '../database/connection'
import Knex from 'knex';

class PointsController {
    async create(req: Request, res: Response) {
        let response = '';

        const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body
        try {
            const trx = await connection.transaction()

            const insertedIds = await trx('points').insert({
                image: "https://images.unsplash.com/photo-1591135869190-91a375d825b5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
                name,
                email,
                whatsapp,
                latitude,
                longitude,
                city,
                uf
            })

            let point_id = insertedIds[0]
            const pointItems = items.map((item_id: number) => {
                return {
                    item_id,
                    point_id
                };
            })

            await trx('point_items').insert(
                pointItems
            )

            await trx.commit();

            response = "A new point has created"
        }
        catch (err) {
            response = "error:" + err
        }

        return res.json(response)
    }

    async show(req: Request, res: Response) {

        const { id } = req.params
        console.log(id)

        const response = await connection('points')
            .where({
                id
            })
            .first()

        if (!(response)) {
            return res.status(400).json({ message: "Point not found" })
        }

        const items = await connection('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('title');

        return res.json({ response, items })
    }

    async index(req: Request, res: Response) {
        const { uf, city, items } = req.query;

        const parsedItems = String(items).split(',').map(item => Number(item.trim()))

        const points = await connection('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*')

        return res.json(points)
    }
}

export default PointsController