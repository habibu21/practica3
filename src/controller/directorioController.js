const pool = require("../model/directorio");
require("dotenv").config();

class DirectorioController {

    async getStatus(req, res) {
        try {
            // Verificar la conexión a la base de datos
            await pool.query('SELECT 1');
            res.send('pong');
        } catch (err) {
            console.error('Error al verificar la conexión a la base de datos:', err);
            res.status(500).send('Error de conexión a la base de datos');
        }
    }

    async create(req, res) {
        try {
            const { name, emails } = req.body;
            const newDirectorio = await pool.query(
                `INSERT INTO directorio (dire_name) VALUES ('${name}') RETURNING *`
            );
            const newEmails = [];
            for (const email of emails) {
                const newEmail = await pool.query(
                    `insert into email (email_address, fk_directorio) values ('${email}', '${newDirectorio.rows[0].dire_id}')  returning *`
                );
                newEmails.push(newEmail.rows[0].email_address);
            }
            res.json({
                name:newDirectorio.rows[0].dire_name,
                emails:newEmails
            });
        } catch (err) {
            res.status(500).send({
                message: err.message || "Error al realizar la creación del directorio"
            });
        }
    }

    async findAll(req, res) {
        const limit = process.env.LIMIT;
        const page = req.query.page ? req.query.page : 1;
        try {
            const directorios = await pool.query(`SELECT * FROM directorio LIMIT ${limit} OFFSET ${limit}*(${page}-1)`);
            let i = 0;
            let response = {
                count: 0,
                results:[]
            };
            for (const directorio of directorios.rows) {
                response.results[i] = {
                    id: directorio.dire_id,
                    name: directorio.dire_name
                }
                const emails = await pool.query(`select email_address from email where fk_directorio = '${directorio.dire_id}'`);
                response.results[i].emails = emails.rows;
                i++
            }
            response.count = response.results.length;
            res.json(response);
        } catch (err) {
            res.status(500).send({ message: 'Error al realizar la búsqueda'});
        }
    }

    async findOne(req, res) {
        const id = req.params.id;
        try {
            const directorio = await pool.query(`SELECT * FROM directorio WHERE dire_id = ${id}`);
            let response = {};
            if (directorio.rows.length === 0) {
                res.status(404).send({ message: `Directorio con ID ${id} no encontrado` });
            } else {
                response.name = directorio.rows[0].dire_name;
                const emails = await pool.query(`select email_address from email where fk_directorio = '${directorio.rows[0].dire_id}'`);
                response.emails = emails.rows;
                res.json(response);
            }
        } catch (err) {
            res.status(500).send({
                message: err.message || `Error al buscar el Directorio con ID ${id}`
            });
        }
    }

    async update(req, res) {
        const id = req.params.id;
        const { name, emails } = req.body;
        try {
            const updatedDirectorio = await pool.query(
                'UPDATE directorios SET name = $1, emails = $2 WHERE id = $3 RETURNING *',
                [name, emails, id]
            );
            if (updatedDirectorio.rows.length === 0) {
                res.status(404).send({ message: `No se pudo actualizar el Directorio con ID ${id}` });
            } else {
                res.json(updatedDirectorio.rows[0]);
            }
        } catch (err) {
            res.status(500).send({
                message: err.message || `Error al actualizar el Directorio con ID ${id}`
            });
        }
    }

    async delete(req, res) {
        const id = req.params.id;
        try {
            await pool.query(`Delete from email where fk_directorio = ${id}`);
            const deletedDirectorio = await pool.query(`DELETE FROM directorio WHERE dire_id = ${id} RETURNING *`);
            if (deletedDirectorio.rows.length === 0) {
                res.status(404).send({ message: `No se pudo borrar el Directorio con ID ${id}` });
            } else {
                res.json({ message: `Directorio con ID ${id} eliminado correctamente` });
            }
        } catch (err) {
            res.status(500).send({
                message: err.message || `Error al borrar el Directorio con ID ${id}`
            });
        }
    }

    async updatePartial(req, res) {
        const id = req.params.id;
        const { name, emails } = req.body;

        try {
            const existingDirectorio = await pool.query('SELECT * FROM directorios WHERE id = $1', [id]);

            if (existingDirectorio.rows.length === 0) {
                return res.status(404).json({ message: `Directorio con ID ${id} no encontrado` });
            }

            const updatedDirectorio = {
                name: name || existingDirectorio.rows[0].name,
                emails: emails || existingDirectorio.rows[0].emails
            };

            const result = await pool.query('UPDATE directorios SET name = $1, emails = $2 WHERE id = $3 RETURNING *',
                [updatedDirectorio.name, updatedDirectorio.emails, id]);

            res.json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ message: `Error al actualizar parcialmente el Directorio con ID ${id}` });
        }
    }
}

module.exports = new DirectorioController();