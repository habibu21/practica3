const pool = require("../model/directorio");

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
                'INSERT INTO directorios (name, emails) VALUES ($1, $2) RETURNING *',
                [name, emails]
            );
            res.json(newDirectorio.rows[0]);
        } catch (err) {
            res.status(500).send({
                message: err.message || "Error al realizar la creación del directorio"
            });
        }
    }

    async findAll(req, res) {
        const { limit = 10, offset = 0 } = req.query;
        try {
            const directorios = await pool.query('SELECT * FROM directorios LIMIT $1 OFFSET $2', [limit, offset]);
            res.json(directorios.rows);
        } catch (err) {
            res.status(500).send({ message: 'Error al realizar la búsqueda' });
        }
    }

    async findOne(req, res) {
        const id = req.params.id;
        try {
            const directorio = await pool.query('SELECT * FROM directorios WHERE id = $1', [id]);
            if (directorio.rows.length === 0) {
                res.status(404).send({ message: `Directorio con ID ${id} no encontrado` });
            } else {
                res.json(directorio.rows[0]);
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
            const deletedDirectorio = await pool.query('DELETE FROM directorios WHERE id = $1 RETURNING *', [id]);
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