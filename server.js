const fs = require('fs');
const http = require('http');
const url = require('url');
const { v4: uuidv4 } = require('uuid');
const port = 3000;
const { newUser, addGasto, modGasto } = require('./roommates.js');
const enviar = require('./sendmail.js');



http
    .createServer(async (req, res) => {


        // RANZERIZANDO INDEX
        if ((req.url == '/') && (req.method == 'GET')) {
            res.setHeader('content-type', 'text/html');
            res.end(fs.readFileSync('index.html', 'utf8'));
        }

        let roommatesJSON = JSON.parse(fs.readFileSync("roommates.json", "utf8"));
        let roommates = roommatesJSON.roommates;
        // Ruta para datos de archivo roommates.json
        if ((req.url == '/roommates') && (req.method == 'GET')) {
            res.setHeader('content-type', 'application/json');
            res.end(fs.readFileSync('roommates.json', 'utf8'));
        }

        // ALMACENANDO Y CREANDO ROOMATES
        else if (req.url.startsWith('/roommate') && req.method == 'POST') {
            res.setHeader('content-type', 'application/json');
            newUser().then(async (roommate) => {
                agregar(roommate);
                console.log(roommate);
                res.writeHead(201).end(JSON.stringify(roommate));
            })
            .catch((e) => {
                res.writeHead(500).end("Error agregando usuario usuario", e);
            });
           
        }
        else if (req.url.startsWith("/roomates") && req.method == "DELETE") {
            const { id } = url.parse(req.url, true).query;
            roommatesJSON.roommates = roommates.filter((g) => g.id !== id);
            fs.writeFileSync("roommates.json", JSON.stringify(roommatesJSON));
            res.writeHead(200).end("Gasto borrado exitosamente!");
        }
        // MOSTRAR GASTOS
        let gastosJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8'));
        let gastos = gastosJSON.gastos;

        if (req.url.startsWith('/gastos') && req.method == 'GET') {
            res.end(JSON.stringify(gastosJSON));
        }
        // AGREGAR GASTOS
        else if (req.url.startsWith('/gasto') && req.method == 'POST') {
            let data = "";
            req.on('data', (payload) => {
                data += payload;
            });

            req.on('end', () => {
                body = JSON.parse(data);
                gasto = {
                    id: uuidv4().slice(30),
                    roommate: body.roommate,
                    descripcion: body.descripcion,
                    monto: body.monto
                };
                gastos.push(gasto);
                addGasto(body);
                let roommate = JSON.parse(fs.readFileSync("roommates.json", "utf8"));
                let datosRm = roommate.roommates;
                let nombre = gastos.map((r) => r.roommate);
                let descripcion = gastos.map((r) => r.descripcion);
                let monto = gastos.map((r) => r.monto);
                let correos = datosRm.map((r) => r.correo);
                // ENVIAR CORREO
                enviar(nombre, descripcion, monto, correos)
                    .then(() => {
                        res.end();
                    })
                    .catch((e) => {
                        res.writeHead(500).end("Error al enviar correos", e);
                    });
                fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON));
                res.writeHead(201).end("Gastos creados!");
            })
        }
        // ACTUALIZAR GASTOS.JSON
        else if (req.url.startsWith('/gasto') && req.method == 'PUT') {

            let data = "";
            const { id } = url.parse(req.url, true).query;
            req.on("data", (payload) => {
                data += payload;
            });
            req.on("end", () => {
                let body = JSON.parse(data)
                body.id = id;
                modGasto(body);
                gastosJSON.gastos = gastos.map((g) => {
                    if (g.id == body.id) {
                        return body;
                    }
                    return g
                });
                fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON), (err) => {
                    err ? console.log('Error en ingreso de gastos') : console.log('Ok')
                });
                res.writeHead(201).end("Gastos actualizados!");
            });

            // BORRAR ARCHIVOS DE GASTOS
        }
        else if (req.url.startsWith("/gasto") && req.method == "DELETE") {
            const { id } = url.parse(req.url, true).query;
            gastosJSON.gastos = gastos.filter((g) => g.id !== id);
            fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON));
            res.writeHead(200).end("Gasto borrado exitosamente!");

        }
    })

    .listen(port, () => console.log('Corriendo en:', port));

const agregar = (roommates) => {
    const partiJSON = JSON.parse(fs.readFileSync('roommates.json', 'utf8'));
    partiJSON.roommates.push(roommates);
    fs.writeFileSync('roommates.json', JSON.stringify(partiJSON));
}